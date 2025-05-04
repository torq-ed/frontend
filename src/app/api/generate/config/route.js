import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('examId');

        const client = await clientPromise;
        const db = client.db("pyqs"); // Use your database name

        const examsCollection = db.collection("exams");
        const subjectsCollection = db.collection("subjects");
        const chaptersCollection = db.collection("chapters");
        const papersCollection = db.collection("papers");

        // If no examId is provided, return the list of all exams
        if (!examId) {
            const exams = await examsCollection.find({}, { projection: { _id: 1, name: 1 } }).toArray();
            return NextResponse.json({ exams });
        }

        // If examId is provided, fetch related subjects, chapters, and papers
        const subjects = await subjectsCollection.find({ exam: examId }, { projection: { _id: 1, name: 1 } }).toArray();
        const subjectIds = subjects.map(s => s._id);

        const chapters = await chaptersCollection.find({ exam: examId, subject: { $in: subjectIds } }, { projection: { _id: 1, name: 1, subject: 1 } }).toArray();
        const papers = await papersCollection.find({ exam: examId }, { projection: { _id: 1, name: 1 } }).toArray();

        // Group chapters by subject ID
        const chaptersBySubject = chapters.reduce((acc, chapter) => {
            const subjectId = chapter.subject;
            if (!acc[subjectId]) {
                acc[subjectId] = [];
            }
            acc[subjectId].push({ id: chapter._id, name: chapter.name }); // Use id/name format consistent with frontend
            return acc;
        }, {});

        // Map subjects to format consistent with frontend expectations (if needed)
        const formattedSubjects = subjects.map(subject => ({
            id: subject._id, // Use id/name format
            name: subject.name
        }));


        return NextResponse.json({
            subjects: formattedSubjects,
            chaptersBySubject,
            papers
        });

    } catch (e) {
        console.error("API Generate Config Error:", e);
        return NextResponse.json({ error: "Failed to fetch configuration data", details: e.message }, { status: 500 });
    }
}
