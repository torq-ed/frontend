"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, XCircle, CheckCircle, AlertCircle, ArrowLeft, FileText, BarChart2, ListChecks, Eye, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

// Helper to format time (seconds to HH:MM:SS)
const formatDuration = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined) return "N/A";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function ResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { testId } = params;
    const { data: session, status: sessionStatus } = useSession();

    const [resultsData, setResultsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/signin');
        }
        if (sessionStatus === 'authenticated' && testId) {
            setIsLoading(true);
            fetch(`/api/results/${testId}`)
                .then(async res => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
                        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setResultsData(data);
                    setError(null);
                })
                .catch(err => {
                    console.error("Failed to fetch results:", err);
                    setError(err.message || "Failed to load results.");
                    setResultsData(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [testId, sessionStatus, router]);

    const CHART_COLORS = useMemo(() => {
        return {
            correct: 'hsl(142.1, 70.6%, 45.3%)',
            incorrect: 'hsl(0, 84.2%, 60.2%)',
            skipped: 'hsl(47.9, 95.8%, 53.1%)',
            barPrimary: 'hsl(221.2, 83.2%, 53.3%)',
            accent: 'hsl(262.1, 83.3%, 57.8%)',
            grid: 'hsl(var(--border))',
            tickLabel: 'hsl(var(--muted-foreground))',
            tooltipBg: 'hsl(var(--popover))',
            tooltipText: 'hsl(var(--popover-foreground))',
        };
    }, []);

    const overallPerformanceData = useMemo(() => {
        if (!resultsData) return [];
        return [
            { name: 'Correct', value: resultsData.correctCount || 0, fill: CHART_COLORS.correct },
            { name: 'Incorrect', value: resultsData.incorrectCount || 0, fill: CHART_COLORS.incorrect },
            { name: 'Skipped', value: resultsData.skippedCount || 0, fill: CHART_COLORS.skipped }
        ];
    }, [resultsData, CHART_COLORS]);

    const subjectChartData = useMemo(() => {
        if (!resultsData || !resultsData.subjectAnalysis) return [];
        return Object.entries(resultsData.subjectAnalysis).map(([subject, data]) => ({
            name: subject.length > 15 ? subject.substring(0, 12) + "..." : subject,
            score: data.score,
            correct: data.correct,
            incorrect: data.incorrect,
            fill: CHART_COLORS.barPrimary
        }));
    }, [resultsData, CHART_COLORS]);

    if (isLoading || sessionStatus === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <XCircle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Error Loading Results</h1>
                <p className="text-destructive mb-6">{error}</p>
                <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    if (!resultsData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No results data found.</p>
            </div>
        );
    }

    const {
        testName, completedAt, score, totalQuestions, correctCount, incorrectCount, skippedCount,
        questions, subjectAnalysis, duration, timeLeftOnSubmit
    } = resultsData;

    const accuracy = totalQuestions > 0 && (totalQuestions - skippedCount > 0) ? ((correctCount / (totalQuestions - skippedCount)) * 100) : 0;
    const timeTaken = duration && timeLeftOnSubmit !== undefined ? (duration * 60) - timeLeftOnSubmit : null;

    const getOptionLabel = (index) => String.fromCharCode(65 + index);

    return (
        <main className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="mb-8">
                    <Button variant="outline" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-primary">{testName}</h1>
                            <p className="text-sm text-muted-foreground">
                                Completed on: {new Date(completedAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold">{score}</p>
                            <p className="text-sm text-muted-foreground">Total Score</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <Card className="lg:col-span-2 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart2 className="h-6 w-6 text-primary" />Overall Performance</CardTitle>
                            <CardDescription>A summary of your performance in this test.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-semibold">{correctCount || 0}</p>
                                <p className="text-xs" style={{ color: CHART_COLORS.correct }}>Correct</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-semibold">{incorrectCount || 0}</p>
                                <p className="text-xs" style={{ color: CHART_COLORS.incorrect }}>Incorrect</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-semibold">{skippedCount || 0}</p>
                                <p className="text-xs" style={{ color: CHART_COLORS.skipped }}>Skipped</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-semibold">{accuracy.toFixed(1)}%</p>
                                <p className="text-xs" style={{ color: CHART_COLORS.barPrimary }}>Accuracy</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-semibold">{formatDuration(timeTaken)}</p>
                                <p className="text-xs" style={{ color: CHART_COLORS.accent }}>Time Taken</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-semibold">{totalQuestions || 0}</p>
                                <p className="text-xs text-muted-foreground">Total Questions</p>
                            </div>
                        </CardContent>
                        <CardContent>
                            <Progress value={(correctCount / totalQuestions) * 100} className="w-full h-3" indicatorClassName="bg-primary" />
                            <p className="text-xs text-muted-foreground mt-1 text-right">{correctCount} out of {totalQuestions} questions correct.</p>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-1 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-6 w-6 text-primary" />Score Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px] sm:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overallPerformanceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {overallPerformanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: CHART_COLORS.tooltipText }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {subjectAnalysis && Object.keys(subjectAnalysis).length > 0 && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary" />Subject-wise Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Subject</TableHead>
                                            <TableHead className="text-center">Correct</TableHead>
                                            <TableHead className="text-center">Incorrect</TableHead>
                                            <TableHead className="text-center">Skipped</TableHead>
                                            <TableHead className="text-right">Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(subjectAnalysis).map(([subject, data]) => (
                                            <TableRow key={subject}>
                                                <TableCell className="font-medium">{subject}</TableCell>
                                                <TableCell className="text-center" style={{ color: CHART_COLORS.correct }}>{data.correct}</TableCell>
                                                <TableCell className="text-center" style={{ color: CHART_COLORS.incorrect }}>{data.incorrect}</TableCell>
                                                <TableCell className="text-center" style={{ color: CHART_COLORS.skipped }}>{data.skipped}</TableCell>
                                                <TableCell className="text-right font-semibold">{data.score}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="md:col-span-1 h-[300px] sm:h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectChartData} margin={{ top: 5, right: 0, left: -20, bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                                        <XAxis
                                            dataKey="name"
                                            angle={-35}
                                            textAnchor="end"
                                            height={60}
                                            interval={0}
                                            tick={{ fill: CHART_COLORS.tickLabel, fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fill: CHART_COLORS.tickLabel, fontSize: 12 }} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: CHART_COLORS.tooltipBg, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 'var(--radius)' }}
                                            itemStyle={{ color: CHART_COLORS.tooltipText }}
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="score" name="Score" fill={CHART_COLORS.barPrimary} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Question Breakdown</CardTitle>
                        <CardDescription>Review each question and your answer.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={q._id} className={`p-4 rounded-lg border-2 ${
                                q.status === 'correct' ? 'border-green-500 bg-green-500/10' :
                                q.status === 'incorrect' ? 'border-red-500 bg-red-500/10' :
                                'border-yellow-500 bg-yellow-500/10'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-lg">Question {index + 1}</h4>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                        q.status === 'correct' ? 'bg-green-200 text-green-800' :
                                        q.status === 'incorrect' ? 'bg-red-200 text-red-800' :
                                        'bg-yellow-200 text-yellow-800'
                                    }`}>
                                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">Subject: {q.subjectName}</p>
                                <p className="mb-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.questionText || "Question text not available." }} />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="font-medium mb-1">Your Answer:</p>
                                        {q.answered ? (
                                            q.type === 'singleCorrect' ? (
                                                <p className={`p-2 rounded ${q.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                                    Option {getOptionLabel(q.userAnswer)}: {q.options?.[q.userAnswer] || "N/A"}
                                                </p>
                                            ) : (
                                                <p className={`p-2 rounded ${q.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>{q.userAnswer}</p>
                                            )
                                        ) : (
                                            <p className="p-2 rounded bg-yellow-100 dark:bg-yellow-900 italic">Skipped</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Correct Answer:</p>
                                        {q.type === 'singleCorrect' ? (
                                            <p className="p-2 rounded bg-blue-100 dark:bg-blue-900">
                                                Option {getOptionLabel(q.correctAnswer)}: {q.options?.[q.correctAnswer] || "N/A"}
                                            </p>
                                        ) : (
                                            <p className="p-2 rounded bg-blue-100 dark:bg-blue-900">{q.correctAnswer}</p>
                                        )}
                                    </div>
                                </div>
                                {q.explanation && (
                                    <details className="mt-3 text-sm">
                                        <summary className="cursor-pointer font-medium text-primary hover:underline">View Explanation</summary>
                                        <div className="mt-2 p-3 bg-muted/50 rounded prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                                    </details>
                                )}
                                <div className="mt-3 text-right">
                                    <Link href={`/question/${q._id}?source=results&testId=${testId}`} passHref>
                                        <Button variant="outline" size="sm">
                                            <Eye className="mr-2 h-4 w-4" /> View Question Details
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
