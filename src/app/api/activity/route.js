import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // Adjust path if necessary
import { ObjectId } from 'mongodb';

export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("userdata");
        const activityCollection = db.collection("activity");

        // Fetch the 5 most recent activities for the user using the string ID
        const recentActivities = await activityCollection
            .find({ userId: session.user.id }) // Query using the string ID
            .sort({ timestamp: -1 }) // Sort by timestamp descending
            .limit(3) // Limit to 5 results
            .toArray();

        return NextResponse.json(recentActivities, { status: 200 });

    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const activityData = await request.json();
        const client = await clientPromise;
        const db = client.db("userdata"); // Use your userdata database
        const activityCollection = db.collection("activity"); // Create/use activity collection

        // Validate or sanitize data if needed
        const {
            questionId,
            questionType,
            userAnswer,
            correctAnswer,
            isCorrect,
            timeTaken,
            timestamp,
        } = activityData;

        if (!questionId || typeof timeTaken !== 'number' || !timestamp) {
            return NextResponse.json({ error: "Missing required activity fields" }, { status: 400 });
        }

        const result = await activityCollection.insertOne({
            userId: session.user.id,
            questionId: questionId, 
            activityType: "questionAttempt", // Add activity type
            questionType,
            userAnswer, // Could be number (index) or string
            correctAnswer, // Could be array or string
            isCorrect,
            timeTaken, // Seconds
            timestamp: new Date(timestamp), // Ensure it's a Date object
        });

        return NextResponse.json({ message: "Activity logged successfully", insertedId: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error("Error logging activity:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
