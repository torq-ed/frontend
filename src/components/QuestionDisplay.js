"use client";

import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye } from 'lucide-react';

// Helper function to format time (can be moved to a utils file later)
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

export default function QuestionDisplay({
    questionData,
    mode = 'view', // 'view' or 'test'
    userAnswer, // Current answer (string for numerical, index for MCQ)
    onAnswerChange, // Function to call when answer changes: (answer) => void
    isSubmitted = false, // Only relevant in 'view' mode
    isCorrect = null, // Only relevant in 'view' mode
    showExplanation = false, // Only relevant in 'view' mode
    onCheckAnswer, // Function to call when checking answer (view mode)
    onToggleExplanation, // Function to toggle explanation (view mode)
    elapsedTime, // Optional: time spent on this question (view mode)
}) {
    if (!questionData) {
        return <div>Loading question...</div>; // Or some placeholder
    }

    const handleMcqChange = (value) => {
        if (onAnswerChange) {
            onAnswerChange(parseInt(value));
        }
    };

    const handleNumericalChange = (e) => {
        if (onAnswerChange) {
            onAnswerChange(e.target.value);
        }
    };

    // Determine if the check button should be disabled in view mode
    const isCheckDisabled = mode === 'view' && (
        isSubmitted ||
        (questionData.type === 'singleCorrect' && userAnswer === null) ||
        (questionData.type === 'numerical' && (!userAnswer || userAnswer.trim() === ''))
    );

    return (
        <div className="bg-card rounded-xl shadow-md border border-border/40 p-6 md:p-8 h-full flex flex-col">
            {/* Metadata */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 text-xs">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{questionData.exam_name || 'N/A'}</Badge>
                    <Badge variant="secondary">{questionData.subject_name || 'N/A'}</Badge>
                    <Badge variant="secondary">{questionData.chapter_name || 'N/A'}</Badge>
                    {mode === 'view' && <Badge variant="secondary">{questionData.paper_name || 'N/A'}</Badge>}
                    {getDifficultyBadge(questionData.level)}
                </div>
                {mode === 'view' && elapsedTime !== undefined && (
                    <div className="font-mono text-sm text-foreground/80 bg-accent px-2 py-1 rounded">
                        Time: {formatTime(elapsedTime)}
                    </div>
                )}
            </div>

            {/* Question Text */}
            <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none mb-6 flex-grow overflow-y-auto custom-scrollbar pr-2">
                <Latex>{questionData.question || ''}</Latex>
            </div>

            {/* Answer Section */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                    {mode === 'test' ? 'Your Answer' : 'Answer & Explanation'}
                </h2>
                {questionData.type === 'singleCorrect' && (
                    <RadioGroup
                        // Ensure value is a string or undefined for RadioGroup
                        value={userAnswer !== null && userAnswer !== undefined ? userAnswer.toString() : undefined}
                        onValueChange={handleMcqChange}
                        disabled={mode === 'view' && isSubmitted}
                        className="space-y-3"
                    >
                        {questionData.options.map((option, index) => (
                            <div key={index} className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${
                                mode === 'view' && isSubmitted && questionData.correct_option.includes(index) ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : ''
                            } ${
                                mode === 'view' && isSubmitted && userAnswer === index && !questionData.correct_option.includes(index) ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : ''
                            } ${!(mode === 'view' && isSubmitted) ? 'border-border hover:bg-accent cursor-pointer' : 'cursor-default'}`}>
                                <RadioGroupItem value={index.toString()} id={`option-${index}-${questionData._id}`} className="mt-1 self-start" />
                                <Label htmlFor={`option-${index}-${questionData._id}`} className="flex-1 cursor-pointer">
                                    <Latex>{option}</Latex>
                                </Label>
                                {mode === 'view' && isSubmitted && userAnswer === index && (
                                    isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 ml-2" /> : <XCircle className="h-5 w-5 text-red-600 ml-2" />
                                )}
                                {mode === 'view' && isSubmitted && userAnswer !== index && questionData.correct_option.includes(index) && (
                                    <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                                )}
                            </div>
                        ))}
                    </RadioGroup>
                )}

                {questionData.type === 'numerical' && (
                    <div className="flex items-center gap-3">
                        <Input
                            type="text"
                            placeholder="Enter your answer"
                            value={userAnswer || ''} // Ensure value is controlled
                            onChange={handleNumericalChange}
                            disabled={mode === 'view' && isSubmitted}
                            className={`flex-grow ${mode === 'view' && isSubmitted ? (isCorrect ? 'border-green-500 focus-visible:ring-green-500' : 'border-red-500 focus-visible:ring-red-500') : ''}`}
                        />
                        {mode === 'view' && isSubmitted && (
                            isCorrect ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons & Feedback (View Mode Only) */}
            {mode === 'view' && (
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                    <Button
                        onClick={onCheckAnswer}
                        disabled={isCheckDisabled}
                        className="w-full sm:w-auto"
                    >
                        {isSubmitted ? (isCorrect ? 'Correct!' : 'Incorrect') : 'Check Answer'}
                    </Button>

                    {isSubmitted && (
                        <Button
                            variant="outline"
                            onClick={onToggleExplanation}
                            className="w-full sm:w-auto"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                        </Button>
                    )}
                </div>
            )}

            {/* Explanation Section (View Mode Only) */}
            {mode === 'view' && isSubmitted && showExplanation && questionData.explanation && (
                <div className="mt-6 pt-4 border-t border-border/40">
                    <h3 className="text-md font-semibold mb-2">Explanation</h3>
                    <div className="prose prose-sm sm:prose dark:prose-invert max-w-none bg-accent/50 dark:bg-accent/20 p-4 rounded-md overflow-y-auto max-h-40 custom-scrollbar">
                        <Latex>{questionData.explanation}</Latex>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add styles if they are specific to this component and not global
const styles = `
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
