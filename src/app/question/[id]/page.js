"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from 'lucide-react';
import QuestionDisplay from '@/components/QuestionDisplay'; // Import the new component

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
    const { data: session } = useSession();

    const [questionData, setQuestionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswer, setUserAnswer] = useState(null); // Use null for initial MCQ state
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            setError(null);
            setIsSubmitted(false); // Reset submission state on new question load
            setIsCorrect(null);
            setShowExplanation(false);
            setUserAnswer(null); // Reset answer
            setElapsedTime(0); // Reset timer
            clearInterval(timerRef.current); // Clear previous timer

            fetchQuestionData(id)
                .then(data => {
                    if (data) {
                        setQuestionData(data);
                        // Initialize userAnswer based on type after data loads
                        setUserAnswer(data.type === 'numerical' ? '' : null);
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
        // Cleanup function for timer when component unmounts or id changes
        return () => clearInterval(timerRef.current);
    }, [id]);

    // Timer Effect
    useEffect(() => {
        if (questionData && !isSubmitted && !isLoading) { // Start timer only if data loaded, not submitted, not loading
            timerRef.current = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        // No cleanup needed here as it's handled in the id effect's cleanup
    }, [questionData, isSubmitted, isLoading]);

    const handleCheckAnswer = async () => {
        if (!questionData) return;
        clearInterval(timerRef.current);
        setIsSubmitted(true);
        setShowExplanation(false);

        let isCorrectResult = null;
        let userAnswerData = null;
        let correctAnswerData = null;

        if (questionData.type === 'singleCorrect') {
            const correctIndex = questionData.correct_option[0];
            isCorrectResult = userAnswer === correctIndex; // userAnswer is already the index
            userAnswerData = userAnswer;
            correctAnswerData = questionData.correct_option;
        } else if (questionData.type === 'numerical') {
            isCorrectResult = userAnswer.trim() === questionData.correct_value;
            userAnswerData = userAnswer.trim();
            correctAnswerData = questionData.correct_value;
        }
        setIsCorrect(isCorrectResult);

        // --- Add Activity Logging ---
        if (session?.user?.id) {
            const activityData = {
                userId: session.user.id,
                questionId: id,
                questionType: questionData.type,
                userAnswer: userAnswerData,
                correctAnswer: correctAnswerData,
                isCorrect: isCorrectResult,
                timeTaken: elapsedTime,
                timestamp: new Date(),
                context: 'single_question_view' // Add context
            };

            try {
                const response = await fetch('/api/activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activityData),
                });
                if (!response.ok) console.error("Failed to log activity:", await response.text());
            } catch (error) {
                console.error("Error logging activity:", error);
            }
        } else {
            console.log("User not signed in, activity not logged.");
        }
        // --- End Activity Logging ---
    };

    const handleAnswerChange = (newAnswer) => {
        setUserAnswer(newAnswer);
    };

    const handleToggleExplanation = () => {
        setShowExplanation(!showExplanation);
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
        return <div className="min-h-screen flex items-center justify-center pt-20">Question data not available.</div>;
    }

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-4xl mx-auto">
                {/* Use the QuestionDisplay component */}
                <QuestionDisplay
                    questionData={questionData}
                    mode="view"
                    userAnswer={userAnswer}
                    onAnswerChange={handleAnswerChange}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                    showExplanation={showExplanation}
                    onCheckAnswer={handleCheckAnswer}
                    onToggleExplanation={handleToggleExplanation}
                    elapsedTime={elapsedTime}
                />

                {/* Navigation or other actions */}
                <div className="flex justify-between items-center mt-8 mb-12">
                    <Button variant="outline" onClick={() => router.back()}>
                        Back
                    </Button>
                    {/* Add next/previous question buttons if needed */}
                </div>
            </div>
        </main>
    );
}
