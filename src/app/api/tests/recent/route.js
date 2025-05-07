import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.email;

        const client = await clientPromise;
        const testsDb = client.db("tests");
        const testsCollection = testsDb.collection("tests");
        
        // Query for tests created by this user, sort by createdAt descending, limit to 3
        const recentTests = await testsCollection
            .find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .limit(3)
            .toArray();

        return NextResponse.json(recentTests);
    } catch (error) {
        console.error("Failed to fetch recent tests:", error);
        return NextResponse.json({ error: "Failed to fetch recent tests" }, { status: 500 });
    }
}
