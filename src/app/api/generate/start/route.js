import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) { // Ensure user ID exists
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id; // Get user ID

    try {
        const config = await request.json(); // Keep the original config object
        const { selectedExam, testType, selectedPaper, customConfig } = config;

        if (!selectedExam || !testType) {
            return NextResponse.json({ error: "Missing required configuration fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const pyqsDb = client.db("pyqs"); // Database for questions
        const questionsCollection = pyqsDb.collection("questions");

        let questionIds = [];
        let duration = 180;

        if (testType === 'past') {
            if (!selectedPaper) {
                return NextResponse.json({ error: "Missing paper selection for past paper test" }, { status: 400 });
            }
            // Fetch all questions for the selected paper
            const questions = await questionsCollection.find(
                { paper_id: selectedPaper },
                { projection: { _id: 1 } }
            ).toArray();
            questionIds = questions.map(q => q._id);

            // Fetch duration from paper if possible
            const paperData = await pyqsDb.collection("papers").findOne({ _id: selectedPaper }, { projection: { duration: 1 } });
            duration = paperData?.duration || 180; // Use paper's duration or default

        } else if (testType === 'custom') {
            if (!customConfig) {
                return NextResponse.json({ error: "Missing custom configuration" }, { status: 400 });
            }
            const { selectedSubjects, selectedChapters, questionType, questionCounts, ratio, duration: customDuration } = customConfig;
            duration = customDuration || 180; // Use duration from custom config

            if (!selectedSubjects || selectedSubjects.length === 0 || !selectedChapters || !questionCounts) {
                 return NextResponse.json({ error: "Incomplete custom configuration" }, { status: 400 });
            }

            let allQuestions = [];

            // Iterate through each selected subject to fetch questions
            for (const subjId of selectedSubjects) {
                const chaptersForSubj = selectedChapters[subjId];
                const totalCountForSubj = questionCounts[subjId];

                if (!chaptersForSubj || chaptersForSubj.length === 0 || !totalCountForSubj || totalCountForSubj <= 0) {
                    continue; // Skip subject if no chapters or count specified
                }

                let mcqCount = 0;
                let numericalCount = 0;

                if (questionType === 'mcq') {
                    mcqCount = totalCountForSubj;
                } else if (questionType === 'numerical') {
                    numericalCount = totalCountForSubj;
                } else { // 'both'
                    mcqCount = Math.round(totalCountForSubj * (ratio / 100));
                    numericalCount = totalCountForSubj - mcqCount;
                }

                const baseMatch = {
                    exam: selectedExam,
                    subject: subjId,
                    chapter: { $in: chaptersForSubj }
                };

                // Fetch MCQs
                if (mcqCount > 0) {
                    const mcqs = await questionsCollection.aggregate([
                        { $match: { ...baseMatch, type: 'singleCorrect' } },
                        { $sample: { size: mcqCount } },
                        { $project: { _id: 1 } }
                    ]).toArray();
                    allQuestions.push(...mcqs);
                }

                // Fetch Numericals
                if (numericalCount > 0) {
                    const numericals = await questionsCollection.aggregate([
                        { $match: { ...baseMatch, type: 'numerical' } },
                        { $sample: { size: numericalCount } },
                        { $project: { _id: 1 } }
                    ]).toArray();
                    allQuestions.push(...numericals);
                }
            }

            questionIds = allQuestions.map(q => q._id);

        } else {
            return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
        }

        // Shuffle the final list of question IDs
        const shuffledIds = shuffleArray(questionIds);

        // Generate a unique ID for the test session
        const testId = uuidv4();
        const createdAt = new Date();

        // Create the test document
        const testDocument = {
            _id: testId,
            createdBy: userId,
            createdAt: createdAt,
            config: config, // Store the original configuration received
            questionIds: shuffledIds,
            duration: duration,
            status: 'not_started', // Initial status
            // Add other fields like 'startedAt', 'completedAt', 'score' later
        };

        // Connect to the 'tests' database and 'tests' collection
        const testsDb = client.db("tests");
        const testsCollection = testsDb.collection("tests");

        // Insert the test document
        await testsCollection.insertOne(testDocument);

        console.log(`Test session created with ID: ${testId}`);

        // Update user document in userdata database
        const userdataDb = client.db("userdata"); // Connect to userdata DB
        const usersCollection = userdataDb.collection("users"); // Access users collection

        // Add the testId to the user's testIds array
        await usersCollection.updateOne(
            { _id: userId }, // Find user by their ID (assuming NextAuth adapter uses session.user.id as _id)
            { $push: { testIds: testId } } // Push the new testId into the array
        );

        console.log(`Updated user ${userId} with test ID: ${testId}`);

        // Return the ID of the created test session
        return NextResponse.json({
            testId: testId,
            // Optionally return duration and question count for immediate feedback
            duration: duration,
            questionCount: shuffledIds.length
        });

    } catch (e) {
        console.error("API Generate Start Error:", e);
        return NextResponse.json({ error: "Failed to generate test or update user record", details: e.message }, { status: 500 });
    }
}
