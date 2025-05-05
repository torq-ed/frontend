"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Loader2, XCircle, Timer, ChevronLeft, ChevronRight, Flag, Check, Power } from 'lucide-react';
import QuestionDisplay from '@/components/QuestionDisplay';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Head from 'next/head';

// Status constants
const STATUS = {
    NOT_VISITED: 'not_visited',
    UNANSWERED: 'unanswered', // Visited but not answered
    ANSWERED: 'answered',
    MARKED_REVIEW: 'marked_review', // Answered and marked for review
    MARKED_UNANSWERED: 'marked_unanswered', // Marked for review but not answered
};

// Helper function to format time
const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Counter for sequential numbering in the palette - moved outside component
let questionCounter = 0;

export default function TestPage() {
    const params = useParams();
    const router = useRouter();
    const { testId } = params;
    const { data: session } = useSession();

    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [statuses, setStatuses] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerIntervalRef = useRef(null);
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (testId && !initialFetchDone.current) {
            initialFetchDone.current = true;
            setIsLoading(true);
            setError(null);
            fetch(`/api/test/${testId}`)
                .then(async res => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
                        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.status !== 'not_started' && data.status !== 'in_progress') {
                        console.warn("Test already completed or in an unexpected state:", data.status);
                    }
                    setTestData(data);
                    setQuestions(data.questions || []);
                    setTimeLeft(data.duration * 60);

                    const initialStatuses = {};
                    const initialAnswers = {};
                    (data.questions || []).forEach(q => {
                        initialStatuses[q._id] = STATUS.NOT_VISITED;
                        initialAnswers[q._id] = q.type === 'numerical' ? '' : null;
                    });
                    setStatuses(initialStatuses);
                    setAnswers(initialAnswers);

                    if (data.questions && data.questions.length > 0) {
                        setStatuses(prev => ({ ...prev, [data.questions[0]._id]: STATUS.UNANSWERED }));
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch test data:", err);
                    setError(err.message || "Failed to load test data.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [testId]);

    useEffect(() => {
        if (timeLeft === null || isLoading || timeLeft <= 0 || isSubmitting) {
            clearInterval(timerIntervalRef.current);
            if (timeLeft !== null && timeLeft <= 0 && !isSubmitting) {
                console.log("Time's up! Auto-submitting...");
                handleSubmitTest(true);
            }
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    clearInterval(timerIntervalRef.current);
                    alert("Time's up!");
                    handleSubmitTest(true);
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timerIntervalRef.current);
    }, [timeLeft, isLoading, isSubmitting]);

    useEffect(() => {
        questionCounter = 0;
    }, [questions]);

    const updateStatus = useCallback((questionId, newAnswer) => {
        setStatuses(prevStatuses => {
            const currentStatus = prevStatuses[questionId];
            let nextStatus = currentStatus;

            const hasAnswer = (newAnswer !== null && newAnswer !== '');

            if (currentStatus === STATUS.NOT_VISITED || currentStatus === STATUS.UNANSWERED) {
                nextStatus = hasAnswer ? STATUS.ANSWERED : STATUS.UNANSWERED;
            } else if (currentStatus === STATUS.ANSWERED) {
                if (!hasAnswer) nextStatus = STATUS.UNANSWERED;
            } else if (currentStatus === STATUS.MARKED_REVIEW) {
                if (!hasAnswer) nextStatus = STATUS.MARKED_UNANSWERED;
            } else if (currentStatus === STATUS.MARKED_UNANSWERED) {
                if (hasAnswer) nextStatus = STATUS.MARKED_REVIEW;
            }

            if (nextStatus === STATUS.NOT_VISITED && currentStatus !== STATUS.NOT_VISITED) {
                nextStatus = hasAnswer ? STATUS.ANSWERED : STATUS.UNANSWERED;
            }

            if (prevStatuses[questionId] === nextStatus) {
                return prevStatuses;
            }

            return { ...prevStatuses, [questionId]: nextStatus };
        });
    }, []);

    const handleAnswerChange = useCallback((questionId, answer) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: answer
        }));
        updateStatus(questionId, answer);
    }, [updateStatus]);

    const navigateQuestion = useCallback((index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
            const questionId = questions[index]._id;
            setStatuses(prevStatuses => {
                if (prevStatuses[questionId] === STATUS.NOT_VISITED) {
                    return { ...prevStatuses, [questionId]: STATUS.UNANSWERED };
                }
                return prevStatuses;
            });
        }
    }, [questions]);

    const handleNext = () => {
        navigateQuestion(currentQuestionIndex + 1);
    };

    const handlePrevious = () => {
        navigateQuestion(currentQuestionIndex - 1);
    };

    const handleClearResponse = () => {
        const currentQuestionId = questions[currentQuestionIndex]?._id;
        if (currentQuestionId) {
            const currentQuestionType = questions[currentQuestionIndex]?.type;
            const clearedAnswer = currentQuestionType === 'numerical' ? '' : null;
            handleAnswerChange(currentQuestionId, clearedAnswer);
        }
    };

    const handleMarkForReview = () => {
        const questionId = questions[currentQuestionIndex]?._id;
        if (!questionId) return;

        setStatuses(prevStatuses => {
            const currentStatus = prevStatuses[questionId];
            let nextStatus;

            const effectiveStatus = currentStatus === STATUS.NOT_VISITED ? STATUS.UNANSWERED : currentStatus;

            if (effectiveStatus === STATUS.MARKED_REVIEW || effectiveStatus === STATUS.MARKED_UNANSWERED) {
                const hasAnswer = (answers[questionId] !== null && answers[questionId] !== '');
                nextStatus = hasAnswer ? STATUS.ANSWERED : STATUS.UNANSWERED;
            } else {
                const hasAnswer = (answers[questionId] !== null && answers[questionId] !== '');
                nextStatus = hasAnswer ? STATUS.MARKED_REVIEW : STATUS.MARKED_UNANSWERED;
            }
            return { ...prevStatuses, [questionId]: nextStatus };
        });
    };

    const handleSubmitTest = async (isAutoSubmit = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        clearInterval(timerIntervalRef.current);

        const submissionData = {
            testId: testId,
            answers: answers,
            timeLeft: timeLeft,
            finalStatuses: statuses,
            submittedAt: new Date(),
            isAutoSubmit: isAutoSubmit,
        };

        console.log("Submitting test:", submissionData);

        try {
            const response = await fetch('/api/test/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Submission successful:", result);
            router.push(`/results/${testId}`);
        } catch (error) {
            console.error("Failed to submit test:", error);
            setError(`Submission failed: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case STATUS.ANSWERED: return 'bg-green-500 hover:bg-green-600 border-green-600 text-white';
            case STATUS.UNANSWERED: return 'bg-red-500 hover:bg-red-600 border-red-600 text-white';
            case STATUS.NOT_VISITED: return 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200';
            case STATUS.MARKED_REVIEW: return 'bg-purple-500 hover:bg-purple-600 border-purple-600 text-white';
            case STATUS.MARKED_UNANSWERED: return 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500 text-black';
            default: return 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200';
        }
    };

    const getStatusTooltip = (status) => {
        switch (status) {
            case STATUS.ANSWERED: return 'Answered';
            case STATUS.UNANSWERED: return 'Not Answered';
            case STATUS.NOT_VISITED: return 'Not Visited';
            case STATUS.MARKED_REVIEW: return 'Marked for Review (Answered)';
            case STATUS.MARKED_UNANSWERED: return 'Marked for Review (Not Answered)';
            default: return 'Unknown';
        }
    };

    const questionsBySubject = useMemo(() => {
        return questions.reduce((acc, question, index) => {
            const subjectName = question.subject_name || `Subject ${question.subject?.substring(0, 4) || index}`;
            if (!acc[subjectName]) {
                acc[subjectName] = {
                    name: subjectName,
                    questions: []
                };
            }
            acc[subjectName].questions.push({ ...question, originalIndex: index });
            return acc;
        }, {});
    }, [questions]);

    questionCounter = 0;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <XCircle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Error Loading Test</h1>
                <p className="text-destructive mb-6">{error}</p>
                <Button onClick={() => router.push('/generate')}>Go Back</Button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentQuestionId = currentQuestion?._id;
    const currentAnswer = answers[currentQuestionId];
    const currentStatus = statuses[currentQuestionId];
    const isMarked = currentStatus === STATUS.MARKED_REVIEW || currentStatus === STATUS.MARKED_UNANSWERED;

    return (
        <>
            <main className="h-screen flex flex-col bg-muted/40">
                <header aria-label="Test Navigation" className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 flex-shrink-0">
                    <h1 className="text-lg font-semibold md:text-xl truncate pr-2">
                        {testData?.config?.customConfig?.testName || testData?.config?.selectedPaperName || `Test: ${testId.substring(0, 8)}`}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 font-mono text-lg font-medium bg-primary/10 text-primary px-3 py-1 rounded-md">
                            <Timer className="h-5 w-5" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Power className="mr-2 h-4 w-4" />}
                                    Submit Test
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to submit the test? You cannot make changes after submission.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSubmitTest(false)} disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Confirm Submit
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </header>

                <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
                        {currentQuestion ? (
                            <QuestionDisplay
                                key={currentQuestionId}
                                questionData={currentQuestion}
                                mode="test"
                                userAnswer={currentAnswer}
                                onAnswerChange={(answer) => handleAnswerChange(currentQuestionId, answer)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">No question selected or available.</div>
                        )}

                        <div className="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-2 flex-shrink-0">
                            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isSubmitting}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="secondary" onClick={handleClearResponse} disabled={isSubmitting}>
                                    Clear Response
                                </Button>
                                <Button variant={isMarked ? "default" : "outline"} onClick={handleMarkForReview} disabled={isSubmitting}>
                                    {isMarked ? <Check className="mr-2 h-4 w-4" /> : <Flag className="mr-2 h-4 w-4" />}
                                    {isMarked ? 'Unmark Review' : 'Mark for Review'}
                                </Button>
                            </div>
                            <Button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1 || isSubmitting}>
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <aside className="w-full md:w-72 lg:w-80 border-l bg-background p-4 overflow-y-auto flex-shrink-0">
                        <h2 className="text-lg font-semibold mb-4">Question Palette</h2>
                        <TooltipProvider delayDuration={100}>
                            {Object.keys(questionsBySubject).sort().map((subjectName) => {
                                const { name, questions: subjectQuestions } = questionsBySubject[subjectName];
                                return (
                                    <div key={name} className="mb-4">
                                        <h3 className="text-sm font-medium mb-2 text-primary">{name} ({subjectQuestions.length})</h3>
                                        <div className="grid grid-cols-5 gap-2">
                                            {subjectQuestions.map((q) => {
                                                questionCounter++;
                                                const currentDisplayNumber = questionCounter;
                                                const statusClass = getStatusColor(statuses[q._id]);

                                                return (
                                                    <Tooltip key={q._id}>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                className={`h-9 w-9 text-xs font-bold rounded-md transition-all duration-150 border ${statusClass} ${currentQuestionIndex === q.originalIndex ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-background' : ''}`}
                                                                onClick={() => navigateQuestion(q.originalIndex)}
                                                                disabled={isSubmitting}
                                                            >
                                                                {currentDisplayNumber}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" align="center">
                                                            <p>Q{currentDisplayNumber}: {getStatusTooltip(statuses[q._id])}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </TooltipProvider>
                        <div className="mt-6 pt-4 border-t text-xs space-y-2">
                            <h4 className="font-semibold mb-1">Legend:</h4>
                            <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${getStatusColor(STATUS.ANSWERED).split(' ')[0]}`}></div> Answered</div>
                            <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${getStatusColor(STATUS.UNANSWERED).split(' ')[0]}`}></div> Not Answered</div>
                            <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${getStatusColor(STATUS.MARKED_REVIEW).split(' ')[0]}`}></div> Marked (Answered)</div>
                            <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${getStatusColor(STATUS.MARKED_UNANSWERED).split(' ')[0]}`}></div> Marked (Not Answered)</div>
                            <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${getStatusColor(STATUS.NOT_VISITED).split(' ')[0]}`}></div> Not Visited</div>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    );
}
