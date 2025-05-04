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
import { Loader2, ArrowRight, Settings, FileText, ListChecks, Hash, Percent, Clock, Zap, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

const DEFAULT_SETTINGS = {
    "b3b5a8d8-f409-4e01-8fd4-043d3055db5e": {
        duration: 180,
        subjects: {
            '7bc04a29-039c-430d-980d-a066b16efc86': { count: 25, mcq: 20, numerical: 5 },
            'bdcc1b1b-5d9d-465d-a7b8-f9619bb61fe7': { count: 25, mcq: 20, numerical: 5 },
            'f1d41a0c-1a71-4994-90f3-4b5d82a6f5f9': { count: 25, mcq: 20, numerical: 5 },
        },
        questionType: 'both',
        ratio: Math.round(((20 + 20 + 20) / (25 + 25 + 25)) * 100),
    },
    "4625ad6f-33db-4c22-96e0-6c23830482de": {
        duration: 180,
        subjects: {
            '4b89e781-8987-47aa-84b6-d95025d590b0': { count: 45, mcq: 45, numerical: 0 },
            '45966dd6-eaed-452f-bfcc-e9632c72da0f': { count: 45, mcq: 45, numerical: 0 },
            '634d1a76-ecfd-4d2b-bdb9-5d6658948236': { count: 90, mcq: 90, numerical: 0 },
        },
        questionType: 'mcq',
        ratio: 100,
    }
};

export default function GenerateTestPage() {
    const router = useRouter();

    const [examsData, setExamsData] = useState([]);
    const [isLoadingExams, setIsLoadingExams] = useState(true);
    const [selectedExam, setSelectedExam] = useState(null);
    const [testType, setTestType] = useState(null);
    const [customConfigStep, setCustomConfigStep] = useState(null);
    const [shouldApplyDefaults, setShouldApplyDefaults] = useState(false);

    const [papersData, setPapersData] = useState([]);
    const [isLoadingPapers, setIsLoadingPapers] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [paperSearchTerm, setPaperSearchTerm] = useState("");

    const [subjectsData, setSubjectsData] = useState([]);
    const [chaptersBySubject, setChaptersBySubject] = useState({});
    const [isLoadingSubjectsChapters, setIsLoadingSubjectsChapters] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedChapters, setSelectedChapters] = useState({});
    const [questionType, setQuestionType] = useState('both');
    const [questionCounts, setQuestionCounts] = useState({});
    const [ratio, setRatio] = useState(50);
    const [testDuration, setTestDuration] = useState(180);

    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setIsLoadingExams(true);
        fetch('/api/generate/config')
            .then(res => res.json())
            .then(data => {
                setExamsData(data.exams || []);
            })
            .catch(err => console.error("Failed to fetch exams:", err))
            .finally(() => setIsLoadingExams(false));
    }, []);

    useEffect(() => {
        setPapersData([]);
        setSubjectsData([]);
        setChaptersBySubject({});
        setSelectedPaper(null);
        setSelectedSubjects([]);
        setSelectedChapters({});
        setQuestionCounts({});

        if (selectedExam && (testType === 'past' || (testType === 'custom' && (customConfigStep === 'configure' || customConfigStep === 'defaultApplied')))) {
            const endpoint = `/api/generate/config?examId=${selectedExam}`;
            let loadingSetter = testType === 'past' ? setIsLoadingPapers : setIsLoadingSubjectsChapters;

            loadingSetter(true);
            fetch(endpoint)
                .then(res => res.json())
                .then(data => {
                    if (testType === 'past') {
                        setPapersData(data.papers || []);
                    } else {
                        setSubjectsData(data.subjects || []);
                        setChaptersBySubject(data.chaptersBySubject || {});
                        if (customConfigStep === 'defaultApplied') {
                            setShouldApplyDefaults(true);
                        }
                    }
                })
                .catch(err => console.error(`Failed to fetch config for exam ${selectedExam}:`, err))
                .finally(() => loadingSetter(false));
        }
    }, [selectedExam, testType, customConfigStep]);

    useEffect(() => {
        if (shouldApplyDefaults && Array.isArray(subjectsData) && subjectsData.length > 0 && Object.keys(chaptersBySubject).length > 0 && selectedExam) {
            const defaults = DEFAULT_SETTINGS[selectedExam];
            if (defaults) {
                console.log("Applying default settings for:", selectedExam);
                const allSubjectIds = subjectsData.map(s => s.id);
                const allChapters = {};
                const defaultCounts = {};

                allSubjectIds.forEach(subjId => {
                    allChapters[subjId] = chaptersBySubject[subjId]?.map(c => c.id) || [];
                    const subjectDefaultConfig = defaults.subjects[subjId];
                    defaultCounts[subjId] = subjectDefaultConfig ? subjectDefaultConfig.count : 10;
                });

                setSelectedSubjects(allSubjectIds);
                setSelectedChapters(allChapters);
                setQuestionCounts(defaultCounts);
                setQuestionType(defaults.questionType);
                setRatio(defaults.ratio);
                setTestDuration(defaults.duration);
            } else {
                console.warn("No default settings found for exam:", selectedExam);
                setCustomConfigStep('configure');
            }
            setShouldApplyDefaults(false);
        }
    }, [shouldApplyDefaults, subjectsData, chaptersBySubject, selectedExam]);

    const handleExamChange = (examId) => {
        setSelectedExam(examId);
        setTestType(null);
        setCustomConfigStep(null);
        setSelectedPaper(null);
        setSelectedSubjects([]);
        setSelectedChapters({});
        setQuestionCounts({});
    };

    const handleTestTypeChange = (type) => {
        setTestType(type);
        setCustomConfigStep(type === 'custom' ? 'choose' : null);
        if (type === 'past') {
            setSelectedSubjects([]);
            setSelectedChapters({});
            setQuestionCounts({});
        } else {
            setSelectedPaper(null);
        }
    };

    const handleUseDefaultSettings = () => {
        if (!DEFAULT_SETTINGS[selectedExam]) {
            alert(`Default settings are not available for ${examsData.find(e => e.id === selectedExam)?.name || 'this exam'}. Please configure manually.`);
            handleConfigureManually();
            return;
        }
        setCustomConfigStep('defaultApplied');
    };

    const handleConfigureManually = () => {
        setCustomConfigStep('configure');
    };

    const handleSubjectToggle = (subjectId) => {
        if (!selectedSubjects.includes(subjectId)) {
            setSelectedChapters(prev => ({ ...prev, [subjectId]: [] }));
            setQuestionCounts(prev => ({ ...prev, [subjectId]: 10 }));
        }
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(subj => subj !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleChapterToggle = (subjectId, chapterId) => {
        setSelectedChapters(prev => ({
            ...prev,
            [subjectId]: prev[subjectId]?.includes(chapterId)
                ? prev[subjectId].filter(chap => chap !== chapterId)
                : [...(prev[subjectId] || []), chapterId],
        }));
    };

    const handleSelectAllChapters = (subjectId) => {
        const allChapterIds = chaptersBySubject[subjectId]?.map(c => c.id) || [];
        setSelectedChapters(prev => ({ ...prev, [subjectId]: allChapterIds }));
    };

    const handleDeselectAllChapters = (subjectId) => {
        setSelectedChapters(prev => ({ ...prev, [subjectId]: [] }));
    };

    const handleGenerateTest = async () => {
        setIsGenerating(true);
        const isDefault = testType === 'custom' && customConfigStep === 'defaultApplied';
        const payload = {
            selectedExam,
            testType,
            selectedPaper: testType === 'past' ? selectedPaper : null,
            customConfig: testType === 'custom' ? {
                usedDefaults: isDefault,
                selectedSubjects,
                selectedChapters,
                questionType,
                questionCounts,
                ratio: questionType === 'both' ? ratio : null,
                duration: testDuration,
            } : null,
        };

        console.log("Sending generation request:", payload);

        try {
            const response = await fetch('/api/generate/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Generated test data:", data);
            
            alert(`Test created! ID: ${data.testId}. Questions: ${data.questionCount}. Duration: ${data.duration} mins.`);

            router.push(`/test/${data.testId}`);

        } catch (error) {
            console.error("Failed to generate test:", error);
            alert(`Error generating test: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const canProceedToType = !!selectedExam;
    const canProceedToConfig = canProceedToType && !!testType;
    const isPastPaperConfigComplete = testType === 'past' && !!selectedPaper;
    const isCustomConfigComplete = testType === 'custom' &&
                                   (customConfigStep === 'defaultApplied' ||
                                    (customConfigStep === 'configure' &&
                                     selectedSubjects.length > 0 &&
                                     selectedSubjects.every(subjId => (selectedChapters[subjId]?.length > 0 && questionCounts[subjId] > 0)) &&
                                     !!questionType &&
                                     testDuration > 0));
    const canGenerate = (isPastPaperConfigComplete || isCustomConfigComplete) && !isGenerating;

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

    const filteredPapersData = useMemo(() => {
        if (!paperSearchTerm) {
            return papersData;
        }
        return papersData.filter(paper =>
            paper.name.toLowerCase().includes(paperSearchTerm.toLowerCase())
        );
    }, [papersData, paperSearchTerm]);

    return (
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto pb-12">
                <h1 className="text-3xl font-bold mb-2 text-center">Generate Your Test</h1>
                <p className="text-center text-muted-foreground mb-8">Configure and create a personalized practice test.</p>

                <Card className="mb-6 shadow-sm transition-all duration-300 ease-out">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" /> Select Exam</CardTitle>
                        <CardDescription>Choose the examination you want to generate a test for.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingExams ? (
                             <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="ml-2">Loading exams...</span>
                            </div>
                        ) : (
                            <Select onValueChange={handleExamChange} value={selectedExam || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an exam..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {examsData.map((exam) => (
                                        <SelectItem key={exam._id} value={exam._id}>
                                            {exam.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </CardContent>
                </Card>

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

                {canProceedToConfig && testType === 'custom' && customConfigStep === 'choose' && (
                    <Card className="mb-6 shadow-sm animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-primary" /> Custom Test Setup</CardTitle>
                            <CardDescription>Use recommended default settings or configure manually.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleUseDefaultSettings} className="flex-1" variant="outline">
                                <Zap className="w-4 h-4 mr-2" /> Use Default Settings
                            </Button>
                            <Button onClick={handleConfigureManually} className="flex-1">
                                <Settings className="w-4 h-4 mr-2" /> Configure Manually
                            </Button>
                        </CardContent>
                    </Card>
                )}

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
                                        <SelectValue placeholder="Select or search for a paper..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                placeholder="Search papers..."
                                                value={paperSearchTerm}
                                                onChange={(e) => setPaperSearchTerm(e.target.value)}
                                                className="w-full h-9"
                                            />
                                        </div>
                                        {filteredPapersData.length > 0 ? (
                                            filteredPapersData.map((paper) => (
                                                <SelectItem key={paper._id} value={paper._id}>
                                                    {paper.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-sm text-muted-foreground">No papers found.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center italic">No past papers found for the selected exam.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {canProceedToConfig && testType === 'custom' && customConfigStep === 'configure' && (
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
                            ) : Array.isArray(subjectsData) && subjectsData.length > 0 ? (
                                <>
                                    <div>
                                        <Label className="text-base font-medium mb-3 block">1. Select Subjects</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {subjectsData.map((subject) => (
                                                <Label
                                                    key={subject.id}
                                                    htmlFor={`subj-${subject.id}`}
                                                    className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer transition-colors hover:border-primary/80 ${selectedSubjects.includes(subject.id) ? 'border-primary bg-primary/5' : 'border-border'}`}
                                                >
                                                    <Checkbox
                                                        id={`subj-${subject.id}`}
                                                        checked={selectedSubjects.includes(subject.id)}
                                                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                                                    />
                                                    <span className="text-sm font-medium">{subject.name}</span>
                                                </Label>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedSubjects.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t">
                                            <Label className="text-base font-medium mb-1 block">2. Select Chapters</Label>
                                            {selectedSubjects.map(subjId => {
                                                const subjectName = subjectsData.find(s => s.id === subjId)?.name || 'Subject';
                                                const chaptersForCurrentSubject = chaptersBySubject[subjId] || [];
                                                return (
                                                    <div key={subjId} className="p-4 border rounded-md bg-card">
                                                        <h4 className="font-semibold mb-3 text-primary">{subjectName} Chapters</h4>
                                                        <div className="flex gap-2 mb-3">
                                                            <Button variant="ghost" size="xs" className="text-xs text-muted-foreground hover:text-primary" onClick={() => handleSelectAllChapters(subjId)}>Select All</Button>
                                                            <Button variant="ghost" size="xs" className="text-xs text-muted-foreground hover:text-primary" onClick={() => handleDeselectAllChapters(subjId)}>Deselect All</Button>
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                                            {chaptersForCurrentSubject.length > 0 ? chaptersForCurrentSubject.map(chapter => (
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
                                                            )) : (
                                                                <p className="text-xs text-muted-foreground italic text-center">No chapters found for this subject.</p>
                                                            )}
                                                        </div>
                                                        {chaptersForCurrentSubject.length > 0 && selectedChapters[subjId]?.length === 0 && (
                                                            <p className="text-xs text-muted-foreground italic mt-2 text-center">Select at least one chapter for {subjectName}.</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center italic">Configuration options not available or failed to load for this exam.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {testType === 'custom' && (customConfigStep === 'defaultApplied' || (customConfigStep === 'configure' && isCustomConfigComplete)) && (
                    <Card className="mb-6 shadow-sm animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Test Summary & Duration</CardTitle>
                            {customConfigStep === 'defaultApplied' && <CardDescription>Default settings applied. You can still adjust the duration.</CardDescription>}
                            {customConfigStep === 'configure' && <CardDescription>Review the test structure and set the duration.</CardDescription>}
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
                            </div>
                            <div>
                                <Label htmlFor="test-duration" className="text-base font-medium mb-2 block">Set Test Duration (minutes)</Label>
                                <Input
                                    id="test-duration"
                                    type="number"
                                    min="10"
                                    step="5"
                                    value={testDuration}
                                    onChange={(e) => setTestDuration(Math.max(10, parseInt(e.target.value) || 10))}
                                    className="w-full"
                                    placeholder="e.g., 180"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

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

const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

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

if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
