import clientPromise from "@/lib/mongodb";
import { NextResponse } from 'next/server';
// import { ObjectId } from 'mongodb';

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('query') || '';
		const examIds = searchParams.get('examIds')?.split(',').filter(id => id) || [];
		const subjectIds = searchParams.get('subjectIds')?.split(',').filter(id => id) || [];
		const chapterIds = searchParams.get('chapterIds')?.split(',').filter(id => id) || [];
		const paperIds = searchParams.get('paperIds')?.split(',').filter(id => id) || [];
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const skip = (page - 1) * limit;

		if (limit > 100) {
			return NextResponse.json({ error: "Limit exceeds maximum value of 100" }, { status: 400 });
		}

		if (page < 1 || limit < 1) {
			return NextResponse.json({ error: "Page and limit must be greater than 0" }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db("pyqs");

		const collection = db.collection("questions");
		const queryFilter = {
			$or: [
				{ question: { $regex: query, $options: 'i' } },
				{ answer: { $regex: query, $options: 'i' } },
				{ options: { $regex: query, $options: 'i' } }
			]
		};

		if (examIds.length > 0) {
			queryFilter.exam = { $in: examIds };
		}

		if (subjectIds.length > 0) {
			queryFilter.subject = { $in: subjectIds };
		}

		if (chapterIds.length > 0) {
			queryFilter.chapter = { $in: chapterIds };
		}

		if (paperIds.length > 0) {
			queryFilter.paper = { $in: paperIds };
		}

		const totalCount = await collection.countDocuments(queryFilter);
		const totalPages = Math.ceil(totalCount / limit);

		const data = await collection.find(queryFilter, {
			projection: {
				_id: 1,
				type: 1,
				question: 1,
				exam: 1,
				subject: 1,
				chapter: 1,
				paper_id: 1,
				level: 1,
			}})
			.skip(skip)
			.limit(limit)
			.toArray();

		// for each question, fetch the names of the exam, subject, chapter, and paper
		const examsCollection = db.collection("exams");
		const subjectsCollection = db.collection("subjects");
		const chaptersCollection = db.collection("chapters");
		const papersCollection = db.collection("papers");

		const examIdsToFetch = [...new Set(data.map(item => item.exam))];
		const subjectIdsToFetch = [...new Set(data.map(item => item.subject))];
		const chapterIdsToFetch = [...new Set(data.map(item => item.chapter))];
		let paperIdsToFetch = [...new Set(data.map(item => Object.keys(item.paper_id[0])[0]))];

		const exams = await examsCollection.find({ _id: { $in: examIdsToFetch } }, { projection: { _id: 1, name: 1 } }).toArray();
		const subjects = await subjectsCollection.find({ _id: { $in: subjectIdsToFetch } }, { projection: { _id: 1, name: 1 } }).toArray();
		const chapters = await chaptersCollection.find({ _id: { $in: chapterIdsToFetch } }, { projection: { _id: 1, name: 1 } }).toArray();
		const papers = await papersCollection.find({ _id: { $in: paperIdsToFetch } }, { projection: { _id: 1, name: 1 } }).toArray();

		for (const item of data) {
			const exam = exams.find(exam => exam._id.toString() === item.exam.toString());
			const subject = subjects.find(subject => subject._id.toString() === item.subject.toString());
			const chapter = chapters.find(chapter => chapter._id.toString() === item.chapter.toString());
			const paper = papers.find(paper => paper._id.toString() === Object.keys(item.paper_id[0])[0]);

			item.exam_name = exam ? exam.name : null;
			item.subject_name = subject ? subject.name : null;
			item.chapter_name = chapter ? chapter.name : null;
			item.paper_name = paper ? paper.name : null;
		}


		return NextResponse.json({
			results: data,
			pagination: {
				currentPage: page,
				totalPages: totalPages,
				totalResults: totalCount,
				limit: limit
			}
		});

	} catch (e) {
		console.error("API Search Error:", e);
		return NextResponse.json({ error: "Failed to fetch search results", details: e.message }, { status: 500 });
	}
}
