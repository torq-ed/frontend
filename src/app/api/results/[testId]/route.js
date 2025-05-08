import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.email;
    const { testId } = params;

    if (!testId) {
        return NextResponse.json({ error: "Missing test ID" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const testsDb = client.db("tests");
        const testsCollection = testsDb.collection("tests");
        const pyqsDb = client.db("pyqs");
        const questionsCollection = pyqsDb.collection("questions");

        const testDoc = await testsCollection.findOne({ _id: testId });

        if (!testDoc) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }

        if (testDoc.createdBy !== userId) {
            return NextResponse.json({ error: "Forbidden. You do not own this test." }, { status: 403 });
        }

        if (testDoc.status !== 'completed') {
            return NextResponse.json({ error: "Test not yet completed." }, { status: 400 });
        }

        const questionIds = testDoc.questionIds || [];
        const questionsData = await questionsCollection.find(
            { _id: { $in: questionIds } },
            { projection: { question: 1, options: 1, type: 1, correct_option: 1, correct_value: 1, explanation: 1, subject: 1, subject_name: 1, chapter_name: 1, exam_name: 1 } }
        ).toArray();

        const questionsMap = questionsData.reduce((map, q) => {
            map[q._id.toString()] = q;
            return map;
        }, {});
        
        const detailedQuestions = testDoc.questionIds.map(qId => {
            const questionDetail = questionsMap[qId];
            const userAnswer = testDoc.userAnswers ? testDoc.userAnswers[qId] : null;
            const resultInfo = testDoc.scoreDetails && testDoc.scoreDetails.results ? testDoc.scoreDetails.results[qId] : { correct: false, answered: false };

            let correctAnswer;
            if (questionDetail?.type === 'singleCorrect') {
                correctAnswer = questionDetail.correct_option ? questionDetail.correct_option[0] : null;
            } else if (questionDetail?.type === 'numerical') {
                correctAnswer = questionDetail.correct_value;
            }

            return {
                _id: qId,
                questionText: questionDetail?.question,
                options: questionDetail?.options,
                type: questionDetail?.type,
                subject: questionDetail?.subject, // Keep subject ID for grouping
                subjectName: questionDetail?.subject_name || "N/A", 
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: resultInfo.correct,
                answered: resultInfo.answered,
                explanation: questionDetail?.explanation,
                status: resultInfo.answered ? (resultInfo.correct ? 'correct' : 'incorrect') : 'skipped',
            };
        });

        // Calculate subject-wise analysis
        const subjectAnalysis = {};
        detailedQuestions.forEach(q => {
            const subjectKey = q.subjectName || 'Uncategorized';
            if (!subjectAnalysis[subjectKey]) {
                subjectAnalysis[subjectKey] = {
                    total: 0,
                    correct: 0,
                    incorrect: 0,
                    skipped: 0,
                    score: 0, // Assuming +4 for correct, -1 for incorrect, 0 for skipped
                };
            }
            subjectAnalysis[subjectKey].total++;
            if (q.status === 'correct') {
                subjectAnalysis[subjectKey].correct++;
                subjectAnalysis[subjectKey].score += 4;
            } else if (q.status === 'incorrect') {
                subjectAnalysis[subjectKey].incorrect++;
                subjectAnalysis[subjectKey].score -= 1;
            } else {
                subjectAnalysis[subjectKey].skipped++;
            }
        });


        const responseData = {
            testId: testDoc._id,
            testName: testDoc.config?.testName || testDoc.config?.customConfig?.testName || `Test: ${testDoc._id.substring(0,8)}`,
            createdAt: testDoc.createdAt,
            completedAt: testDoc.completedAt,
            duration: testDoc.duration,
            timeLeftOnSubmit: testDoc.timeLeftOnSubmit,
            score: testDoc.scoreDetails?.score,
            totalQuestions: testDoc.scoreDetails?.totalQuestions,
            correctCount: testDoc.scoreDetails?.correctCount,
            incorrectCount: testDoc.scoreDetails?.incorrectCount,
            skippedCount: testDoc.scoreDetails?.skippedCount,
            questions: detailedQuestions,
            subjectAnalysis: subjectAnalysis,
        };

        return NextResponse.json(responseData);

    } catch (e) {
        console.error("API Results Fetch Error:", e);
        return NextResponse.json({ error: "Failed to fetch test results", details: e.message }, { status: 500 });
    }
}
