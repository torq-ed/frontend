"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Sample data for filters and results (replace with real data in production)
const EXAMS = ["JEE Mains", "JEE Advanced", "NEET", "BITSAT", "KVPY"];
const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology"];
const CHAPTERS = {
  "Physics": ["Mechanics", "Electromagnetism", "Thermodynamics", "Optics", "Modern Physics"],
  "Chemistry": ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Analytical Chemistry"],
  "Mathematics": ["Algebra", "Calculus", "Trigonometry", "Coordinate Geometry", "Vectors"],
  "Biology": ["Botany", "Zoology", "Human Physiology", "Genetics", "Ecology"]
};
const PAPERS = ["2022", "2021", "2020", "2019", "2018"];

// Sample results (replace with real data in production)
const SAMPLE_RESULTS = [
  {
    id: 1,
    question: "A particle moves in a circle of radius 20 cm with constant speed and time period 4π seconds. What is the magnitude of velocity and acceleration of the particle?",
    exam: "JEE Advanced",
    subject: "Physics",
    chapter: "Mechanics",
    paper: "2022",
    difficulty: "Hard"
  },
  {
    id: 2,
    question: "The pH of a monobasic acid with dissociation constant Ka is 3.5 in its 0.1 M solution. Calculate the value of Ka.",
    exam: "NEET",
    subject: "Chemistry",
    chapter: "Physical Chemistry",
    paper: "2021",
    difficulty: "Medium"
  },
  {
    id: 3,
    question: "If y = tan⁻¹(sin x / (1 + cos x)), prove that dy/dx = 1/2.",
    exam: "JEE Mains",
    subject: "Mathematics",
    chapter: "Calculus",
    paper: "2020",
    difficulty: "Easy"
  },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Filter handling functions
  const toggleExam = (exam) => {
    setSelectedExams(prev => 
      prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam]
    );
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const toggleChapter = (chapter) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) ? prev.filter(c => c !== chapter) : [...prev, chapter]
    );
  };

  const togglePaper = (paper) => {
    setSelectedPapers(prev => 
      prev.includes(paper) ? prev.filter(p => p !== paper) : [...prev, paper]
    );
  };

  // Search handling
  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedExams([]);
    setSelectedSubjects([]);
    setSelectedChapters([]);
    setSelectedPapers([]);
  };

  // Get available chapters based on selected subjects
  const availableChapters = selectedSubjects.length > 0 
    ? selectedSubjects.flatMap(subject => CHAPTERS[subject] || [])
    : Object.values(CHAPTERS).flat();

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Questions</h1>
          <p className="text-foreground/80 mb-6">Find and filter through previous years' questions</p>
          
          {/* Search input */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-background rounded-full shadow-md overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/50">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 px-6 bg-transparent border-none outline-none text-foreground"
              />
              <Button 
                type="submit" 
                variant="default"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full mr-1.5 transition-transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
              </Button>
            </div>
            
            {/* Mobile Filter Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mt-4 w-full rounded-lg flex items-center justify-center border border-input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </form>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters section - Hidden on mobile until toggled */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 lg:w-72 space-y-6`}>
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border/40">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Filters</h2>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="text-xs h-8 hover:bg-destructive/10 hover:text-destructive px-2"
                >
                  Clear All
                </Button>
              </div>
              
              {/* Exam filter */}
              <div className="mb-5">
                <h3 className="text-sm font-medium mb-2">Exam</h3>
                <div className="flex flex-wrap gap-2">
                  {EXAMS.map((exam) => (
                    <button
                      key={exam}
                      onClick={() => toggleExam(exam)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                        selectedExams.includes(exam)
                          ? "bg-primary text-primary-foreground shadow-sm font-medium scale-105" // Use primary button style for selected
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent hover:border-primary/30" // Use secondary style for unselected
                      }`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Subject filter */}
              <div className="mb-5">
                <h3 className="text-sm font-medium mb-2">Subject</h3>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                        selectedSubjects.includes(subject) 
                          ? "bg-primary text-primary-foreground shadow-sm font-medium scale-105" // Use primary button style for selected
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent hover:border-primary/30" // Use secondary style for unselected
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chapter filter */}
              <div className="mb-5">
                <h3 className="text-sm font-medium mb-2">Chapter</h3>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pb-1 custom-scrollbar">
                  {availableChapters.map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() => toggleChapter(chapter)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                        selectedChapters.includes(chapter)
                          ? "bg-primary text-primary-foreground shadow-sm font-medium scale-105" // Use primary button style for selected
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent hover:border-primary/30" // Use secondary style for unselected
                      }`}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Paper Year filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Paper Year</h3>
                <div className="flex flex-wrap gap-2">
                  {PAPERS.map((paper) => (
                    <button
                      key={paper}
                      onClick={() => togglePaper(paper)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                        selectedPapers.includes(paper) 
                          ? "bg-primary text-primary-foreground shadow-sm font-medium scale-105" // Use primary button style for selected
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent hover:border-primary/30" // Use secondary style for unselected
                      }`}
                    >
                      {paper}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Results section */}
          <div className="flex-1">
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border/40">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Results</h2>
                <p className="text-sm text-foreground/70">
                  {SAMPLE_RESULTS.length} questions found
                </p>
              </div>
              
              {/* Results list */}
              <div className="space-y-4">
                {SAMPLE_RESULTS.map((result) => (
                  <div 
                    key={result.id}
                    className="border border-border/40 hover:border-primary/30 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer"
                    onClick={() => router.push(`/question/${result.id}`)}
                  >
                    <div className="flex gap-2 mb-2 flex-wrap"> {/* Added flex-wrap */}
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"> {/* Subject: Blue */}
                        {result.subject}
                      </span>
                      <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-0.5 rounded-full"> {/* Exam: Green */}
                        {result.exam}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full"> {/* Paper: Yellow */}
                        {result.paper}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.difficulty === "Easy" ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300" : // Easy: Teal
                        result.difficulty === "Medium" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" : // Medium: Orange
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" // Hard: Red
                      }`}>
                        {result.difficulty}
                      </span>
                    </div>
                    <p className="text-foreground/90">{result.question}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-foreground/60">{result.chapter}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                      >
                        View Question
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-6 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-md"
                    disabled
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                  </Button>
                  <Button variant="default" size="sm" className="h-8 w-8 p-0 rounded-md">1</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md">2</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md">3</Button>
                  <span className="text-sm">...</span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md">10</Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
