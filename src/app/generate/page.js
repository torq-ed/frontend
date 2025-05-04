"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Settings, FileText, ListChecks, Hash, Percent, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

// Placeholder for exams data - ideally fetched or imported from a shared source
const EXAMS_PLACEHOLDER = [
    { id: "jee-main", name: "JEE Main" },
    { id: "jee-adv", name: "JEE Advanced" },
    { id: "neet", name: "NEET" },
    { id: "bitsat", name: "BITSAT" },
    // Add other exams as needed
];

// Placeholder for fetching data
const fetchPapersForExam = async (examId) => {
    console.log(`Fetching papers for exam: ${examId}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    if (examId === 'jee-main') {
        return [
            { id: 'jee-main-2023-jan-s1', name: 'JEE Main 2023 - Jan Session 1' },
            { id: 'jee-main-2023-apr-s1', name: 'JEE Main 2023 - Apr Session 1' },
        ];
    }
    return [];
};

const fetchSubjectsAndChaptersForExam = async (examId) => {
    console.log(`Fetching subjects/chapters for exam: ${examId}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    // Return structure: { subjectId: { name: 'Subject Name', chapters: [{ id: 'chap1', name: 'Chapter 1' }, ...] } }
    if (examId === 'jee-main') {
        return {
            'physics': { name: 'Physics', chapters: [{ id: 'phy-mech', name: 'Mechanics' }, { id: 'phy-em', name: 'Electromagnetism' }] },
            'chemistry': { name: 'Chemistry', chapters: [{ id: 'chem-org', name: 'Organic' }, { id: 'chem-inorg', name: 'Inorganic' }] },
            'maths': { name: 'Mathematics', chapters: [{ id: 'math-calc', name: 'Calculus' }, { id: 'math-alg', name: 'Algebra' }] },
        };
    }
    return {};
};


export default function GenerateTestPage() {
    const router = useRouter();

    // State
    const [examsData, setExamsData] = useState(EXAMS_PLACEHOLDER); // Use placeholder for now
    const [selectedExam, setSelectedExam] = useState(null);
    const [testType, setTestType] = useState(null); // 'past' or 'custom'

    // Past Paper State
    const [papersData, setPapersData] = useState([]);
    const [isLoadingPapers, setIsLoadingPapers] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState(null);

    // Custom Test State
    const [subjectsData, setSubjectsData] = useState({}); // { subjectId: { name, chapters: [...] } }
    const [isLoadingSubjectsChapters, setIsLoadingSubjectsChapters] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Array of subject IDs
    const [selectedChapters, setSelectedChapters] = useState({}); // { subjectId: [chapterId1, chapterId2] }
    const [questionType, setQuestionType] = useState('both'); // 'mcq', 'numerical', 'both'
    const [questionCounts, setQuestionCounts] = useState({}); // { subjectId: count }
    const [ratio, setRatio] = useState(50); // MCQ percentage (default 50%)
    const [testDuration, setTestDuration] = useState(180); // Default duration in minutes

    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch papers when exam changes
    useEffect(() => {
        if (selectedExam && testType === 'past') {
            setIsLoadingPapers(true);
            setPapersData([]);
            setSelectedPaper(null);
            fetchPapersForExam(selectedExam)
                .then(data => setPapersData(data))
                .catch(err => console.error("Failed to fetch papers:", err))
                .finally(() => setIsLoadingPapers(false));
        } else {
            setPapersData([]); // Clear if exam/type changes
            setSelectedPaper(null);
        }
    }, [selectedExam, testType]);

    // Fetch subjects/chapters when exam changes for custom tests
    useEffect(() => {
        if (selectedExam && testType === 'custom') {
            setIsLoadingSubjectsChapters(true);
            setSubjectsData({});
            setSelectedSubjects([]);
            setSelectedChapters({});
            setQuestionCounts({});
            fetchSubjectsAndChaptersForExam(selectedExam)
                .then(data => setSubjectsData(data))
                .catch(err => console.error("Failed to fetch subjects/chapters:", err))
                .finally(() => setIsLoadingSubjectsChapters(false));
        } else {
            setSubjectsData({}); // Clear if exam/type changes
            setSelectedSubjects([]);
            setSelectedChapters({});
            setQuestionCounts({});
        }
    }, [selectedExam, testType]);

    // Handlers
    const handleExamChange = (examId) => {
        setSelectedExam(examId);
        setTestType(null); // Reset test type when exam changes
        // Reset subsequent selections
        setSelectedPaper(null);
        setSelectedSubjects([]);
        setSelectedChapters({});
        setQuestionCounts({});
    };

    const handleTestTypeChange = (type) => {
        setTestType(type);
        // Reset selections specific to the other type
        if (type === 'past') {
            setSelectedSubjects([]);
            setSelectedChapters({});
            setQuestionCounts({});
        } else {
            setSelectedPaper(null);
        }
    };

    const handleSubjectToggle = (subjectId) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
        // Reset chapters and counts for this subject if deselected
        if (selectedSubjects.includes(subjectId)) {
            setSelectedChapters(prev => {
                const newState = { ...prev };
                delete newState[subjectId];
                return newState;
            });
            setQuestionCounts(prev => {
                const newState = { ...prev };
                delete newState[subjectId];
                return newState;
            });
        } else {
             // Initialize chapter selection for the newly selected subject
             setSelectedChapters(prev => ({ ...prev, [subjectId]: [] }));
             setQuestionCounts(prev => ({ ...prev, [subjectId]: 10 })); // Default count
        }
    };

    const handleChapterToggle = (subjectId, chapterId) => {
        setSelectedChapters(prev => {
            const currentChapters = prev[subjectId] || [];
            const updatedChapters = currentChapters.includes(chapterId)
                ? currentChapters.filter(id => id !== chapterId)
                : [...currentChapters, chapterId];
            return { ...prev, [subjectId]: updatedChapters };
        });
    };

    const handleSelectAllChapters = (subjectId) => {
        const allChapterIds = subjectsData[subjectId]?.chapters.map(c => c.id) || [];
        setSelectedChapters(prev => ({ ...prev, [subjectId]: allChapterIds }));
    };

    const handleDeselectAllChapters = (subjectId) => {
        setSelectedChapters(prev => ({ ...prev, [subjectId]: [] }));
    };

     const handleQuestionCountChange = (subjectId, count) => {
        const value = parseInt(count, 10);
        setQuestionCounts(prev => ({
            ...prev,
            [subjectId]: isNaN(value) || value < 1 ? 1 : value // Ensure positive integer
        }));
    };

    const handleGenerateTest = () => {
        setIsGenerating(true);
        console.log("Generating test with config:", {
            selectedExam,
            testType,
            selectedPaper: testType === 'past' ? selectedPaper : null,
            customConfig: testType === 'custom' ? {
                selectedSubjects,
                selectedChapters,
                questionType,
                questionCounts,
                ratio: questionType === 'both' ? ratio : null,
                duration: testDuration,
            } : null,
        });
        // Simulate generation and navigation
        setTimeout(() => {
            setIsGenerating(false);
            // router.push('/test/session-id'); // Navigate to the actual test interface
            alert("Test generation initiated! (Navigation placeholder)");
        }, 1500);
    };

    // Derived state/checks
    const canProceedToType = !!selectedExam;
    const canProceedToConfig = canProceedToType && !!testType;
    const isPastPaperConfigComplete = testType === 'past' && !!selectedPaper;
    const isCustomConfigComplete = testType === 'custom' &&
                                   selectedSubjects.length > 0 &&
                                   selectedSubjects.every(subjId => (selectedChapters[subjId]?.length > 0 && questionCounts[subjId] > 0)) &&
                                   !!questionType &&
                                   testDuration > 0;
    const canGenerate = (isPastPaperConfigComplete || isCustomConfigComplete) && !isGenerating;

    // Calculate total questions and breakdown
    const { totalQuestions, totalMcq, totalNumerical } = useMemo(() => {
        let tq = 0;
        let tm = 0;
        let tn = 0;

        if (testType === 'custom') {
            selectedSubjects.forEach(subjId => {
                const count = questionCounts[subjId] || 0;
                tq += count;
                if (count > 0) {
                    if (questionType === 'mcq') {
                        tm += count;
                    } else if (questionType === 'numerical') {
                        tn += count;
                    } else if (questionType === 'both') {
                        const mcqForSubj = Math.round(count * (ratio / 100));
                        const numForSubj = count - mcqForSubj;
                        tm += mcqForSubj;
                        tn += numForSubj;
                    }
                }
            });
        }
        return { totalQuestions: tq, totalMcq: tm, totalNumerical: tn };
    }, [selectedSubjects, questionCounts, questionType, ratio, testType]);


    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto pb-12">
                <h1 className="text-3xl font-bold mb-2 text-center">Generate Your Test</h1>
                <p className="text-center text-muted-foreground mb-8">Configure and create a personalized practice test.</p>

                {/* Step 1: Select Exam */}
                <Card className="mb-6 shadow-sm transition-all duration-300 ease-out">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" /> Select Exam</CardTitle>
                        <CardDescription>Choose the examination you want to generate a test for.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleExamChange} value={selectedExam || ""}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an exam..." />
                            </SelectTrigger>
                            <SelectContent>
                                {examsData.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.id}>
                                        {exam.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Step 2: Select Test Type */}
                {canProceedToType && (
                    <Card className="mb-6 shadow-sm animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Choose Test Type</CardTitle>
                            <CardDescription>Do you want to attempt a past paper or create a custom test?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={testType} onValueChange={handleTestTypeChange} className="flex flex-col sm:flex-row gap-4">
                                <Label htmlFor="past-paper" className="flex-1 flex items-center gap-3 border rounded-md p-4 hover:border-primary cursor-pointer transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                    <RadioGroupItem value="past" id="past-paper" />
                                    <FileText className="w-5 h-5" />
                                    <span>Attempt a Past Paper</span>
                                </Label>
                                <Label htmlFor="custom-test" className="flex-1 flex items-center gap-3 border rounded-md p-4 hover:border-primary cursor-pointer transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                    <RadioGroupItem value="custom" id="custom-test" />
                                    <ListChecks className="w-5 h-5" />
                                    <span>Create a Custom Test</span>
                                </Label>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3a: Select Past Paper */}
                {canProceedToConfig && testType === 'past' && (
                    <Card className="mb-6 shadow-sm animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Select Past Paper</CardTitle>
                            <CardDescription>Choose a specific past paper to attempt.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingPapers ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <span className="ml-2">Loading papers...</span>
                                </div>
                            ) : papersData.length > 0 ? (
                                <Select onValueChange={setSelectedPaper} value={selectedPaper || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a paper..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {papersData.map((paper) => (
                                            <SelectItem key={paper.id} value={paper.id}>
                                                {paper.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center italic">No past papers found for the selected exam.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 3b: Configure Custom Test */}
                {canProceedToConfig && testType === 'custom' && (
                    <Card className="mb-6 shadow-sm animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Configure Custom Test</CardTitle>
                            <CardDescription>Select subjects, chapters, and question types.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isLoadingSubjectsChapters ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <span className="ml-2">Loading configuration options...</span>
                                </div>
                            ) : Object.keys(subjectsData).length > 0 ? (
                                <>
                                    {/* Subject Selection */}
                                    <div>
                                        <Label className="text-base font-medium mb-3 block">1. Select Subjects</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {Object.entries(subjectsData).map(([id, data]) => (
                                                <Label
                                                    key={id}
                                                    htmlFor={`subj-${id}`}
                                                    className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer transition-colors hover:border-primary/80 ${selectedSubjects.includes(id) ? 'border-primary bg-primary/5' : 'border-border'}`}
                                                >
                                                    <Checkbox
                                                        id={`subj-${id}`}
                                                        checked={selectedSubjects.includes(id)}
                                                        onCheckedChange={() => handleSubjectToggle(id)}
                                                    />
                                                    <span className="text-sm font-medium">{data.name}</span>
                                                </Label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chapter Selection (per selected subject) */}
                                    {selectedSubjects.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t">
                                            <Label className="text-base font-medium mb-1 block">2. Select Chapters</Label>
                                            {selectedSubjects.map(subjId => (
                                                <div key={subjId} className="p-4 border rounded-md bg-card">
                                                    <h4 className="font-semibold mb-3 text-primary">{subjectsData[subjId]?.name} Chapters</h4>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <Label htmlFor={`qcount-${subjId}`} className="text-sm font-medium flex items-center gap-1"><Hash className="w-3 h-3"/> Questions:</Label>
                                                        <Input
                                                            id={`qcount-${subjId}`}
                                                            type="number"
                                                            min="1"
                                                            value={questionCounts[subjId] || ''}
                                                            onChange={(e) => handleQuestionCountChange(subjId, e.target.value)}
                                                            className="w-20 h-8 text-sm"
                                                            placeholder="e.g., 10"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 mb-3">
                                                        <Button variant="ghost" size="xs" className="text-xs text-muted-foreground hover:text-primary" onClick={() => handleSelectAllChapters(subjId)}>Select All</Button>
                                                        <Button variant="ghost" size="xs" className="text-xs text-muted-foreground hover:text-primary" onClick={() => handleDeselectAllChapters(subjId)}>Deselect All</Button>
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                                        {subjectsData[subjId]?.chapters.map(chapter => (
                                                            <Label
                                                                key={chapter.id}
                                                                htmlFor={`chap-${subjId}-${chapter.id}`}
                                                                className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm"
                                                            >
                                                                <Checkbox
                                                                    id={`chap-${subjId}-${chapter.id}`}
                                                                    checked={selectedChapters[subjId]?.includes(chapter.id) || false}
                                                                    onCheckedChange={() => handleChapterToggle(subjId, chapter.id)}
                                                                />
                                                                {chapter.name}
                                                            </Label>
                                                        ))}
                                                    </div>
                                                     {selectedChapters[subjId]?.length === 0 && (
                                                        <p className="text-xs text-muted-foreground italic mt-2 text-center">Select at least one chapter for {subjectsData[subjId]?.name}.</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Question Type Selection */}
                                    {selectedSubjects.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <Label className="text-base font-medium mb-3 block">3. Select Question Types</Label>
                                            <RadioGroup value={questionType} onValueChange={setQuestionType} className="flex flex-col sm:flex-row gap-3">
                                                <Label htmlFor="qtype-mcq" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer transition-colors hover:border-primary/80 flex-1 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                                    <RadioGroupItem value="mcq" id="qtype-mcq" />
                                                    <span>MCQ Only</span>
                                                </Label>
                                                <Label htmlFor="qtype-num" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer transition-colors hover:border-primary/80 flex-1 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                                    <RadioGroupItem value="numerical" id="qtype-num" />
                                                    <span>Numerical Only</span>
                                                </Label>
                                                <Label htmlFor="qtype-both" className="flex items-center gap-2 border rounded-md p-3 cursor-pointer transition-colors hover:border-primary/80 flex-1 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                                    <RadioGroupItem value="both" id="qtype-both" />
                                                    <span>Both (MCQ & Numerical)</span>
                                                </Label>
                                            </RadioGroup>
                                        </div>
                                    )}

                                    {/* Ratio Selection (if 'both' types selected) */}
                                    {selectedSubjects.length > 0 && questionType === 'both' && (
                                        <div className="pt-4 border-t">
                                            <Label htmlFor="ratio-slider" className="text-base font-medium mb-3 block flex items-center gap-1"><Percent className="w-4 h-4"/> 4. Set MCQ/Numerical Ratio</Label>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-muted-foreground">MCQ</span>
                                                <Input
                                                    id="ratio-slider"
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    value={ratio}
                                                    onChange={(e) => setRatio(parseInt(e.target.value))}
                                                    className="flex-1 h-2 cursor-pointer accent-primary"
                                                />
                                                <span className="text-sm font-medium text-muted-foreground">Numerical</span>
                                            </div>
                                            <p className="text-center text-sm mt-2 font-medium">{ratio}% MCQ / {100 - ratio}% Numerical</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center italic">Configuration options not available for this exam.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                 {/* Step 4: Test Summary & Duration (Only for Custom Test) */}
                 {isCustomConfigComplete && testType === 'custom' && (
                    <Card className="mb-6 shadow-sm animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Test Summary & Duration</CardTitle>
                            <CardDescription>Review the test structure and set the duration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm border p-3 rounded-md">
                                <div className="font-medium">Total Questions:</div>
                                <div className="text-right font-semibold">{totalQuestions}</div>

                                {questionType === 'both' && (
                                    <>
                                        <div className="font-medium text-muted-foreground">MCQ Questions:</div>
                                        <div className="text-right">{totalMcq}</div>
                                        <div className="font-medium text-muted-foreground">Numerical Questions:</div>
                                        <div className="text-right">{totalNumerical}</div>
                                    </>
                                )}
                                {questionType === 'mcq' && (
                                     <>
                                        <div className="font-medium text-muted-foreground">MCQ Questions:</div>
                                        <div className="text-right">{totalQuestions}</div>
                                    </>
                                )}
                                 {questionType === 'numerical' && (
                                     <>
                                        <div className="font-medium text-muted-foreground">Numerical Questions:</div>
                                        <div className="text-right">{totalQuestions}</div>
                                    </>
                                )}
                            </div>
                             <div>
                                <Label htmlFor="test-duration" className="text-base font-medium mb-2 block">Set Test Duration (minutes)</Label>
                                <Input
                                    id="test-duration"
                                    type="number"
                                    min="10" // Minimum duration
                                    step="5"
                                    value={testDuration}
                                    onChange={(e) => setTestDuration(Math.max(10, parseInt(e.target.value) || 10))} // Ensure minimum duration
                                    className="w-full"
                                    placeholder="e.g., 180"
                                />
                            </div>
                        </CardContent>
                    </Card>
                 )}


                {/* Generate Button */}
                {(isPastPaperConfigComplete || isCustomConfigComplete) && (
                     <div className="mt-8 flex justify-center animate-fade-in">
                        <Button
                            size="lg"
                            onClick={handleGenerateTest}
                            disabled={!canGenerate || isGenerating}
                            className="w-full max-w-xs text-lg"
                        >
                            {isGenerating ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <ArrowRight className="mr-2 h-5 w-5" />
                            )}
                            {isGenerating ? 'Generating...' : 'Start Test'}
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}

// Add basic fade-in animation CSS (can be moved to globals.css)
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Custom scrollbar for chapter lists */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 10px;
  border: 3px solid transparent;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}
`;

// Inject styles (consider moving to a CSS file)
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
