import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedExamId = searchParams.get('examId')?.split(',').filter(id => id) || [];
    const requestedSubjectId = searchParams.get('subjectId')?.split(',').filter(id => id) || [];

    if (requestedExamId.length === 0) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("pyqs");

    if (requestedSubjectId.length === 0) {
        const papersCollection = db.collection("papers");
        const papers = await papersCollection.find(
            { exam: { $in: requestedExamId } },
            { projection: { _id: 1, name: 1 } }
        ).toArray();
        return NextResponse.json(papers);
    }


    const chaptersCollection = db.collection("chapters");
    const chapters = await chaptersCollection.find(
        { exam: { $in: requestedExamId }, subject: { $in: requestedSubjectId } },
        { projection: { _id: 1, name: 1 } }
    ).toArray();

    return NextResponse.json(chapters);

  } catch (e) {
    console.error("API Filters Error:", e);
    return NextResponse.json({ error: "Failed to fetch filters", details: e.message }, { status: 500 });
  }
}
