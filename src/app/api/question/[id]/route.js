import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
// import { ObjectId } from 'mongodb'; // Import if using MongoDB ObjectIds directly

export async function GET(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("pyqs");
        const collection = db.collection("questions");

        // Find the question by its _id (assuming _id is a string UUID)
        // If using MongoDB ObjectIds, you might need: const question = await collection.findOne({ _id: new ObjectId(id) });
        const question = await collection.findOne({ _id: id });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Fetch related names if needed (similar to search query)
        const examsCollection = db.collection("exams");
        const subjectsCollection = db.collection("subjects");
        const chaptersCollection = db.collection("chapters");
        const papersCollection = db.collection("papers");

        const exam = await examsCollection.findOne({ _id: question.exam }, { projection: { name: 1 } });
        const subject = await subjectsCollection.findOne({ _id: question.subject }, { projection: { name: 1 } });
        const chapter = await chaptersCollection.findOne({ _id: question.chapter }, { projection: { name: 1 } });
        const paper = await papersCollection.findOne({ _id: question.paper_id }, { projection: { name: 1 } });

        // Add names to the question object
        question.exam_name = exam ? exam.name : null;
        question.subject_name = subject ? subject.name : null;
        question.chapter_name = chapter ? chapter.name : null;
        question.paper_name = paper ? paper.name : null;

        return NextResponse.json(question);

    } catch (e) {
        console.error("API Question Fetch Error:", e);
        // Distinguish between client errors (like invalid ID format) and server errors
        if (e.name === 'BSONTypeError') { // Example for ObjectId format error
             return NextResponse.json({ error: "Invalid Question ID format" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to fetch question data", details: e.message }, { status: 500 });
    }
}
