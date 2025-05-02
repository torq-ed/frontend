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

// Replace Mock function with actual API call
async function fetchQuestionData(id) {
    try {
        const response = await fetch(`/api/question/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null; // Question not found
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching question data:", error);
        throw error; // Re-throw the error to be caught in the useEffect
    }
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
