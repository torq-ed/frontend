"use client";

import { useState, useEffect, useRef } from 'react'; // Import useRef
import { useParams, useRouter } from 'next/navigation';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component

// Mock function to fetch question data - replace with your actual API call
async function fetchQuestionData(id) {
    // Example: Replace with fetch(`/api/question/${id}`)
    // This mock simulates fetching data and resolving names
    console.log(`Fetching question with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Example data structure (replace with actual fetched data)
    const mockData = {
        "c0d31be8-472e-4245-a455-e79a95772adf": {
            "_id": "c0d31be8-472e-4245-a455-e79a95772adf",
            "question": "A physical quantity $Q$ is related to four observables $a, b, c, d$ as follows :\n$\\mathrm{Q}=\\frac{\\mathrm{ab}{ }^4}{\\mathrm{~cd}}$\n\nwhere, $\\mathrm{a}=(60 \\pm 3) \\mathrm{Pa} ; \\mathrm{b}=(20 \\pm 0.1) \\mathrm{m} ; \\mathrm{c}=(40 \\pm 0.2) \\mathrm{Nsm}^{-2}$ and $\\mathrm{d}=(50 \\pm 0.1) \\mathrm{m}$, then the percentage error in Q is $\\frac{x}{1000}$, where $x=$ ________ .",
            "type": "numerical", // Can be "mcq" or "numerical"
            "paper_id": "97ee7f60-4b48-4534-8b97-dac4daedb0d2",
            "level": 2, // 1: Easy, 2: Medium, 3: Hard
            "options": [], // For MCQ: ["Option A text", "Option B text", ...]
            "correct_option": [], // For MCQ: Index or text of correct option(s)
            "correct_value": "7700", // For numerical
            "explanation": "$\\begin{aligned} & \\mathrm{Q}=\\frac{\\mathrm{ab}^4}{\\mathrm{~cd}} \\\\ & \\Rightarrow \\frac{\\Delta \\mathrm{Q}}{\\mathrm{Q}} \\times 100=\\left[\\frac{\\Delta \\mathrm{a}}{\\mathrm{a}}+4 \\frac{\\Delta \\mathrm{~b}}{\\mathrm{~b}}+\\frac{\\Delta \\mathrm{c}}{\\mathrm{c}}+\\frac{\\Delta \\mathrm{d}}{\\mathrm{d}}\\right] \\times 100 \\\\ & \\Rightarrow \\frac{\\mathrm{x}}{1000}=\\left[\\frac{3}{60}+4\\left(\\frac{0.1}{20}\\right)+\\left(\\frac{0.2}{40}\\right)+\\frac{0.1}{50}\\right] \\times 100 \\\\ & \\Rightarrow \\mathrm{x}=7700\\end{aligned}$",
            "chapter": "d09b550d-c06d-4603-a5c5-8ed115b366a6",
            "subject": "7bc04a29-039c-430d-980d-a066b16efc86",
            "exam": "b3b5a8d8-f409-4e01-8fd4-043d3055db5e",
            // Add resolved names (assuming API provides these)
            "exam_name": "JEE Main",
            "subject_name": "Physics",
            "chapter_name": "Units and Measurements",
            "paper_name": "2023 Shift 1"
        },
        "f8b97505-2a95-46c8-b1aa-aa29cab08d0a": {
            "_id": "f8b97505-2a95-46c8-b1aa-aa29cab08d0a",
            "question": "For an experimental expression $y=\\frac{32.3 \\times 1125}{27.4}$, where all the digits are significant. Then to report the value of $y$ we should write",
            "type": "singleCorrect",
            "paper_id": "9190c57b-4dcf-4e4a-8aa8-7c3ebb05664f",
            "level": 1,
            "options": [
              "$y=1326.19$",
              "$y=1330$",
              "$y=1326.186$",
              "$y=1326.2$"
            ],
            "correct_option": [
              1
            ],
            "correct_value": null,
            "explanation": "$y=\\frac{32.3 \\times 1125}{27.4}=1326.18$\nSo we need to report to three significant digit.\nSo, $y=1330$",
            "chapter": "d09b550d-c06d-4603-a5c5-8ed115b366a6",
            "subject": "7bc04a29-039c-430d-980d-a066b16efc86",
            "exam": "b3b5a8d8-f409-4e01-8fd4-043d3055db5e",
            "exam_name": "JEE Main",
            "subject_name": "Physics",
            "chapter_name": "Units and Measurements",
            "paper_name": "2023 Shift 1"
          },
        // Add another mock question for MCQ type if needed
        // "another-mcq-id": {
        //     "_id": "another-mcq-id",
        //     "question": "What is the value of $\\int_0^1 x^2 dx$?",
        //     "type": "mcq",
        //     "paper_id": "some-paper-id",
        //     "level": 1,
        //     "options": ["1/3", "1/2", "1", "2"],
        //     "correct_option": [0], // Index of the correct option
        //     "correct_value": null,
        //     "explanation": "$\\int_0^1 x^2 dx = [\\frac{x^3}{3}]_0^1 = \\frac{1^3}{3} - \\frac{0^3}{3} = \\frac{1}{3}$",
        //     "chapter": "some-chapter-id",
        //     "subject": "some-subject-id",
        //     "exam": "some-exam-id",
        //     "exam_name": "Mock Exam",
        //     "subject_name": "Mathematics",
        //     "chapter_name": "Integration",
        //     "paper_name": "Practice Set 1"
        // }
    };

    // Return data for the requested ID or null if not found
    return mockData[id] || null;
}


export default function QuestionPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [questionData, setQuestionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState(null); // For MCQ
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // State for timer in seconds
    const timerRef = useRef(null); // Ref to store interval ID

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            setError(null);
            fetchQuestionData(id)
                .then(data => {
                    if (data) {
                        setQuestionData(data);
                    } else {
                        setError("Question not found.");
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch question:", err);
                    setError("Failed to load question data.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setError("No question ID provided.");
            setIsLoading(false);
        }
    }, [id]);

    // Timer Effect
    useEffect(() => {
        if (questionData && !isSubmitted) {
            // Start timer only if data is loaded and not submitted
            timerRef.current = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            // Clear interval if submitted or no data
            clearInterval(timerRef.current);
        }

        // Cleanup function to clear interval on component unmount or before re-running
        return () => clearInterval(timerRef.current);
    }, [questionData, isSubmitted]); // Dependencies: run when data loads or submission status changes

    const handleCheckAnswer = () => {
        if (!questionData) return;
        clearInterval(timerRef.current); // Stop the timer
        setIsSubmitted(true);
        setShowExplanation(false); // Hide explanation initially on check

        // Treat 'singleCorrect' as an MCQ type
        if (questionData.type === 'singleCorrect') {
            const correctIndex = questionData.correct_option[0]; // Assuming single correct
            setIsCorrect(selectedOption === correctIndex);
        } else if (questionData.type === 'numerical') {
            // Basic comparison, might need more robust checking for numerical answers
            setIsCorrect(userAnswer.trim() === questionData.correct_value);
        }
    };

    // Helper function to format time
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getDifficultyBadge = (level) => {
        switch (level) {
            case 1: return <Badge variant="outline" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 border-teal-300">Easy</Badge>;
            case 2: return <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-300">Medium</Badge>;
            case 3: return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300">Hard</Badge>;
            default: return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center px-4">
                <XCircle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Error</h1>
                <p className="text-destructive mb-6">{error}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    if (!questionData) {
        // This case might be redundant if error handles 'not found', but good as a fallback
        return <div className="min-h-screen flex items-center justify-center pt-20">Question data not available.</div>;
    }

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-4xl mx-auto">
                {/* Question Card */}
                <div className="bg-card rounded-xl shadow-md border border-border/40 p-6 md:p-8 mb-6">
                    {/* Metadata & Timer */}
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4 text-xs">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{questionData.exam_name || 'N/A'}</Badge>
                            <Badge variant="secondary">{questionData.subject_name || 'N/A'}</Badge>
                            <Badge variant="secondary">{questionData.chapter_name || 'N/A'}</Badge>
                            <Badge variant="secondary">{questionData.paper_name || 'N/A'}</Badge>
                            {getDifficultyBadge(questionData.level)}
                        </div>
                        {/* Display Timer */}
                        <div className="font-mono text-sm text-foreground/80 bg-accent px-2 py-1 rounded">
                            Time: {formatTime(elapsedTime)}
                        </div>
                    </div>

                    {/* Question Text */}
                    <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none mb-6">
                        <Latex>{questionData.question || ''}</Latex>
                    </div>

                    {/* Answer Section */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3 border-b pb-2">Your Answer</h2>
                        {/* Render RadioGroup for 'singleCorrect' type */}
                        {questionData.type === 'singleCorrect' && (
                            <RadioGroup
                                value={selectedOption !== null ? selectedOption.toString() : undefined}
                                onValueChange={(value) => setSelectedOption(parseInt(value))}
                                disabled={isSubmitted}
                                className="space-y-3"
                            >
                                {questionData.options.map((option, index) => (
                                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${
                                        isSubmitted && questionData.correct_option.includes(index) ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : ''
                                    } ${
                                        isSubmitted && selectedOption === index && !questionData.correct_option.includes(index) ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : ''
                                    } ${!isSubmitted ? 'border-border hover:bg-accent' : ''}`}>
                                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1 self-start" />
                                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                            <Latex>{option}</Latex>
                                        </Label>
                                        {isSubmitted && selectedOption === index && (
                                            isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 ml-2" /> : <XCircle className="h-5 w-5 text-red-600 ml-2" />
                                        )}
                                         {isSubmitted && selectedOption !== index && questionData.correct_option.includes(index) && (
                                            <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                                        )}
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {questionData.type === 'numerical' && (
                            <div className="flex items-center gap-3">
                                <Input
                                    type="text" // Use text to allow various numerical inputs, validation might be needed
                                    placeholder="Enter your answer"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    disabled={isSubmitted}
                                    className={`flex-grow ${isSubmitted ? (isCorrect ? 'border-green-500 focus-visible:ring-green-500' : 'border-red-500 focus-visible:ring-red-500') : ''}`}
                                />
                                {isSubmitted && (
                                    isCorrect ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons & Feedback */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button
                            onClick={handleCheckAnswer}
                            // Update disabled condition for 'singleCorrect'
                            disabled={isSubmitted || (questionData.type === 'singleCorrect' && selectedOption === null) || (questionData.type === 'numerical' && userAnswer.trim() === '')}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitted ? (isCorrect ? 'Correct!' : 'Incorrect') : 'Check Answer'}
                        </Button>

                        {isSubmitted && (
                            <Button
                                variant="outline"
                                onClick={() => setShowExplanation(!showExplanation)}
                                className="w-full sm:w-auto"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                            </Button>
                        )}
                    </div>

                    {/* Explanation Section */}
                    {isSubmitted && showExplanation && questionData.explanation && (
                        <div className="mt-6 pt-4 border-t border-border/40">
                            <h3 className="text-md font-semibold mb-2">Explanation</h3>
                            <div className="prose prose-sm sm:prose dark:prose-invert max-w-none bg-accent/50 dark:bg-accent/20 p-4 rounded-md">
                                <Latex>{questionData.explanation}</Latex>
                            </div>
                        </div>
                    )}
                </div>

                 {/* Navigation or other actions */}
                 <div className="flex justify-between items-center mt-8 mb-12">
                     <Button variant="outline" onClick={() => router.back()}>
                         Back to Search
                     </Button>
                     {/* Add next/previous question buttons if needed */}
                 </div>
            </div>
        </main>
    );
}
