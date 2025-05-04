import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Function to calculate score (example)
// You'll need the correct answers for this, which might require another DB query
// or fetching them initially and storing them securely (not recommended on client)
// Best approach: Fetch correct answers here based on question IDs.
async function calculateScore(testId, answers) {
    try {
        const client = await clientPromise;
        const testsDb = client.db("tests");
        const testsCollection = testsDb.collection("tests");
        const pyqsDb = client.db("pyqs");
        const questionsCollection = pyqsDb.collection("questions");

        // 1. Get the question IDs (strings) from the test document
        const testDoc = await testsCollection.findOne({ _id: testId }, { projection: { questionIds: 1 } });
        if (!testDoc || !testDoc.questionIds) {
            throw new Error("Test document or question IDs not found for scoring.");
        }
        const questionIds = testDoc.questionIds; // IDs are strings

        // 2. Fetch the correct answers for these questions using string IDs
        const correctAnswersData = await questionsCollection.find(
            { _id: { $in: questionIds } },
            { projection: { _id: 1, type: 1, correct_option: 1, correct_value: 1 } }
        ).toArray();

        const correctAnswersMap = correctAnswersData.reduce((map, q) => {
            map[q._id] = q; // Use string ID as key
            return map;
        }, {});

        // 3. Compare user answers with correct answers
        let score = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let skippedCount = 0;
        const results = {}; // Store individual question results

        for (const questionIdStr in answers) {
            const userAnswer = answers[questionIdStr];
            const correctAnswerInfo = correctAnswersMap[questionIdStr]; // Access using string ID

            if (!correctAnswerInfo) {
                console.warn(`Correct answer info not found for question ${questionIdStr}`);
                continue; // Skip if question data is missing
            }

            let isCorrect = false;
            const isSkipped = userAnswer === null || userAnswer === '';

            if (isSkipped) {
                skippedCount++;
                results[questionIdStr] = { answered: false, correct: false };
            } else {
                if (correctAnswerInfo.type === 'singleCorrect') {
                    // Ensure comparison is correct (e.g., number vs number)
                    isCorrect = parseInt(userAnswer) === correctAnswerInfo.correct_option[0];
                } else if (correctAnswerInfo.type === 'numerical') {
                    // Handle potential floating point issues or range answers if necessary
                    isCorrect = userAnswer.toString().trim() === correctAnswerInfo.correct_value.toString().trim();
                }

                if (isCorrect) {
                    correctCount++;
                    score += 4; // Example scoring: +4 for correct
                    results[questionIdStr] = { answered: true, correct: true };
                } else {
                    incorrectCount++;
                    score -= 1; // Example scoring: -1 for incorrect
                    results[questionIdStr] = { answered: true, correct: false };
                }
            }
        }

        return {
            score,
            correctCount,
            incorrectCount,
            skippedCount,
            totalQuestions: questionIds.length,
            results // Individual results per question
        };

    } catch (error) {
        console.error("Error calculating score:", error);
        // Return a default/error score object or re-throw
        return { score: 0, correctCount: 0, incorrectCount: 0, skippedCount: Object.keys(answers).length, totalQuestions: Object.keys(answers).length, error: "Scoring failed" };
    }
}


export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const submissionData = await request.json();
        const { testId, answers, timeLeft, finalStatuses, submittedAt } = submissionData;

        if (!testId || !answers || timeLeft === undefined || !finalStatuses || !submittedAt) {
            return NextResponse.json({ error: "Missing required submission data" }, { status: 400 });
        }

        const client = await clientPromise;
        const testsDb = client.db("tests");
        const testsCollection = testsDb.collection("tests");

        // Fetch the test document to ensure it exists and belongs to the user (optional check)
        const testDoc = await testsCollection.findOne({ _id: testId });

        if (!testDoc) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }
        if (testDoc.createdBy !== userId) {
            // Allow submission for now, but log warning
             console.warn(`User ${userId} submitting test ${testId} created by ${testDoc.createdBy}`);
            // return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (testDoc.status === 'completed') {
             return NextResponse.json({ error: "Test already submitted" }, { status: 409 }); // Conflict
        }

        // Calculate score
        const scoreDetails = await calculateScore(testId, answers);

        // Update the test document
        const updateResult = await testsCollection.updateOne(
            { _id: testId },
            {
                $set: {
                    status: 'completed',
                    completedAt: new Date(submittedAt), // Use client's submitted time
                    timeLeftOnSubmit: timeLeft,
                    userAnswers: answers, // Store the final answers submitted
                    finalStatuses: finalStatuses, // Store the palette status
                    score: scoreDetails.score,
                    scoreDetails: scoreDetails, // Store detailed results
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
             // This might happen if the test was already completed or ID is wrong
             console.warn(`Test document ${testId} not modified during submission update.`);
             // Check status again to be sure
             const checkDoc = await testsCollection.findOne({ _id: testId }, { projection: { status: 1 } });
             if (checkDoc?.status !== 'completed') {
                 throw new Error("Failed to update test status in database.");
             }
        }

        // --- Optional: Add detailed activity log for the entire test submission ---
        const userdataDb = client.db("userdata");
        const activityCollection = userdataDb.collection("activity");
        const testActivity = {
            userId: userId,
            activityType: 'test_submission',
            testId: testId,
            timestamp: new Date(submittedAt),
            details: {
                score: scoreDetails.score,
                correctCount: scoreDetails.correctCount,
                incorrectCount: scoreDetails.incorrectCount,
                skippedCount: scoreDetails.skippedCount,
                timeLeft: timeLeft,
            }
        };
        await activityCollection.insertOne(testActivity);
        // --- End Activity Logging ---


        console.log(`Test ${testId} submitted successfully by user ${userId}. Score: ${scoreDetails.score}`);

        // Return success response, maybe include the score or redirect info
        return NextResponse.json({
            message: "Test submitted successfully",
            testId: testId,
            score: scoreDetails.score,
            // Include other details if the results page needs them immediately
        });

    } catch (e) {
        console.error("API Test Submit Error:", e);
        return NextResponse.json({ error: "Failed to submit test", details: e.message }, { status: 500 });
    }
}
