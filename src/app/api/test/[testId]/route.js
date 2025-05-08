import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { testId } = await params;

    if (!testId) {
        return NextResponse.json({ error: "Missing test ID" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const testsDb = client.db("tests");
        const testsCollection = testsDb.collection("tests");
        const pyqsDb = client.db("pyqs"); // Database for questions, exams, subjects, chapters
        const questionsCollection = pyqsDb.collection("questions");

        // Fetch the test document
        const testDoc = await testsCollection.findOne({ _id: testId });

        if (!testDoc) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }

        // Optional: Check if the user is authorized to view this test
        // if (testDoc.createdBy !== userId) { ... }

        // IDs are already strings in testDoc.questionIds
        const questionIds = testDoc.questionIds;

        if (!questionIds || questionIds.length === 0) {
            return NextResponse.json({ error: "No question IDs found for this test" }, { status: 400 });
        }

        // Fetch questions with names using $lookup aggregation
        const questionsWithDetails = await questionsCollection.aggregate([
            { $match: { _id: { $in: questionIds } } }, // Match using string IDs
            // Add original order field before lookups
            {
                $addFields: {
                    originalOrder: {
                        $indexOfArray: [questionIds, "$_id"] // Get index from the input array
                    }
                }
            },
            // Lookup Exam Name
            {
                $lookup: {
                    from: "exams",
                    localField: "exam",
                    foreignField: "_id",
                    as: "examDetails"
                }
            },
            // Lookup Subject Name
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subjectDetails"
                }
            },
            // Lookup Chapter Name
            {
                $lookup: {
                    from: "chapters",
                    localField: "chapter",
                    foreignField: "_id",
                    as: "chapterDetails"
                }
            },
            // Add names as fields and project necessary data (Inclusion mode)
            {
                $project: {
                    _id: 1,
                    question: 1,
                    options: 1,
                    type: 1,
                    level: 1,
                    subject: 1,
                    originalOrder: 1, // Keep original order index
                    exam_name: { $ifNull: [{ $arrayElemAt: ["$examDetails.name", 0] }, "N/A"] },
                    subject_name: { $ifNull: [{ $arrayElemAt: ["$subjectDetails.name", 0] }, "N/A"] },
                    chapter_name: { $ifNull: [{ $arrayElemAt: ["$chapterDetails.name", 0] }, "N/A"] },
                }
            },
            // Sort by subject name, then by the original order within the subject
            {
                $sort: {
                    subject_name: 1, // Sort by subject name ascending
                    originalOrder: 1 // Then sort by original index ascending
                }
            }
        ]).toArray();

        // Prepare the response object
        const testData = {
            _id: testDoc._id,
            duration: testDoc.duration,
            config: testDoc.config,
            status: testDoc.status,
            createdAt: testDoc.createdAt,
            questions: questionsWithDetails, // Send the sorted questions
        };

        return NextResponse.json(testData);

    } catch (e) {
        console.error("API Test Fetch Error:", e);
        return NextResponse.json({ error: "Failed to fetch test data", details: e.message }, { status: 500 });
    }
}
