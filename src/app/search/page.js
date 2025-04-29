"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, Loader2 } from "lucide-react";
import Latex from 'react-latex-next'; // Import Latex component
import 'katex/dist/katex.min.css'; // Import katex CSS for styling

const EXAMS = {
	"b3b5a8d8-f409-4e01-8fd4-043d3055db5e": {
		"name": "JEE Main",
		"subjects": [
			[
				"7bc04a29-039c-430d-980d-a066b16efc86",
				"Physics"
			],
			[
				"bdcc1b1b-5d9d-465d-a7b8-f9619bb61fe7",
				"Chemistry"
			],
			[
				"f1d41a0c-1a71-4994-90f3-4b5d82a6f5f9",
				"Mathematics"
			]
		]
	},
	"6d34f7cd-c80e-4a42-8c35-2b167f459c06": {
		"name": "JEE Advanced",
		"subjects": [
			[
				"f66d8bfb-ba6a-4b3f-adbc-fbf402e39020",
				"Physics"
			],
			[
				"17d9f684-251f-4f52-8092-1b54b33b1ed5",
				"Chemistry"
			],
			[
				"96b44962-2c79-4a42-87ce-f8b87c9e174a",
				"Mathematics"
			]
		]
	},
	"4625ad6f-33db-4c22-96e0-6c23830482de": {
		"name": "NEET",
		"subjects": [
			[
				"4b89e781-8987-47aa-84b6-d95025d590b0",
				"Physics"
			],
			[
				"45966dd6-eaed-452f-bfcc-e9632c72da0f",
				"Chemistry"
			],
			[
				"634d1a76-ecfd-4d2b-bdb9-5d6658948236",
				"Biology"
			]
		]
	},
	"bb792041-50de-4cfe-83f3-f899a79c0930": {
		"name": "COMEDK",
		"subjects": [
			[
				"1ff8290a-8193-4001-a93e-8aa8fcb1f3ac",
				"Physics"
			],
			[
				"6ec16a3d-177a-44f3-b342-4c51cf2b1045",
				"Chemistry"
			],
			[
				"3d7d5653-4382-4275-be29-58b0eea9f510",
				"Mathematics"
			]
		]
	},
	"c8da26c7-cf1b-421f-829b-c95dbdd3cc6a": {
		"name": "BITSAT",
		"subjects": [
			[
				"45363e06-86a7-4d8e-be8d-318ee79af980",
				"Physics"
			],
			[
				"416dff44-e43b-4cd3-8c5a-d30b56d24151",
				"Chemistry"
			],
			[
				"6848df90-e6d7-4505-a691-53956ebf45a2",
				"Mathematics"
			]
		]
	},
	"1aa38a2b-dee5-453e-a394-29c033c16789": {
		"name": "MHT CET",
		"subjects": [
			[
				"eaccceff-1c6e-4d73-bab0-6b2a2a0fb0a0",
				"Physics"
			],
			[
				"fe61bc1d-8b3b-4ce8-ab28-a156c8a62fb8",
				"Chemistry"
			],
			[
				"2d820cff-7252-4a17-9f44-10b92970705e",
				"Mathematics"
			]
		]
	},
	"4fe0bca2-d3eb-43e8-b705-f4eb7301a74c": {
		"name": "VITEEE",
		"subjects": [
			[
				"fdd0de52-3277-408a-aed9-12c735635134",
				"Physics"
			],
			[
				"2a6d5d09-a157-43a4-aa81-022f2e70f596",
				"Chemistry"
			],
			[
				"c476840a-2596-4510-878c-d641b83469dc",
				"Mathematics"
			]
		]
	},
	"f3e78517-c050-4fea-822b-e43c4d2d3523": {
		"name": "WBJEE",
		"subjects": [
			[
				"c41e01c9-86c8-41ff-8b48-e585020ec8c9",
				"Physics"
			],
			[
				"2d96a490-384b-4984-9356-086b3baf166b",
				"Chemistry"
			],
			[
				"168bd1c7-3c23-4d1c-ab40-fcf70bb1fb72",
				"Mathematics"
			]
		]
	}
}
const ALL_SUBJECT_NAMES = [...new Set(Object.values(EXAMS).flatMap(exam => exam.subjects.map(sub => sub[1])))];

export default function Search() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedExams, setSelectedExams] = useState([]);
	const [selectedSubjects, setSelectedSubjects] = useState([]);
	const [selectedChapters, setSelectedChapters] = useState([]);
	const [selectedPapers, setSelectedPapers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const router = useRouter();

	const [fetchedPapers, setFetchedPapers] = useState([]);
	const [fetchedChapters, setFetchedChapters] = useState([]);
	const [isPapersLoading, setIsPapersLoading] = useState(false);
	const [isChaptersLoading, setIsChaptersLoading] = useState(false);

	const [subjectSearch, setSubjectSearch] = useState("");
	const [chapterSearch, setChapterSearch] = useState("");
	const [paperSearch, setPaperSearch] = useState("");

	const [searchResults, setSearchResults] = useState([]);
	const [paginationInfo, setPaginationInfo] = useState({
		currentPage: 1,
		totalPages: 1,
		totalResults: 0,
		limit: 10,
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [isSearchLoading, setIsSearchLoading] = useState(false);

	const availableSubjects = useMemo(() => {
		if (selectedExams.length === 0) {
			return ALL_SUBJECT_NAMES.map(name => ({ subjectName: name, isSimple: true }));
		} else {
			return selectedExams.flatMap(examId => {
				const exam = EXAMS[examId];
				if (!exam) return [];
				return exam.subjects.map(([subjectId, subjectName]) => ({
					subjectId,
					subjectName,
					examId,
					examName: exam.name,
					isSimple: false
				}));
			});
		}
	}, [selectedExams]);

	useEffect(() => {
		const fetchPapers = async () => {
			if (selectedExams.length === 0) {
				setFetchedPapers([]);
				setSelectedPapers([]);
				return;
			}
			setIsPapersLoading(true);
			try {
				const examIds = selectedExams.join(',');
				const response = await fetch(`/api/search/filters?examId=${examIds}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setFetchedPapers(data || []);
				const availablePaperIds = new Set(data.map(p => p._id));
				setSelectedPapers(prev => prev.filter(pId => availablePaperIds.has(pId)));
			} catch (error) {
				console.error("Failed to fetch papers:", error);
				setFetchedPapers([]);
			} finally {
				setIsPapersLoading(false);
			}
		};

		fetchPapers();
	}, [selectedExams]);

	// Fetch Chapters when selectedSubjects changes (which depends on selectedExams)
	useEffect(() => {
		const fetchChapters = async () => {
			if (selectedSubjects.length === 0) {
				setFetchedChapters([]);
				setSelectedChapters([]); // Clear selected chapters if no subjects are selected
				return;
			}
			setIsChaptersLoading(true);
			try {
				const examIds = [...new Set(selectedSubjects.map(s => s.examId))].join(',');
				const subjectIds = [...new Set(selectedSubjects.map(s => s.subjectId))].join(',');
				const response = await fetch(`/api/search/filters?examId=${examIds}&subjectId=${subjectIds}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setFetchedChapters(data || []); // Expecting array like [{ _id, name }]
				// Remove selected chapters that are no longer available
				const availableChapterIds = new Set(data.map(c => c._id));
				setSelectedChapters(prev => prev.filter(cId => availableChapterIds.has(cId)));
			} catch (error) {
				console.error("Failed to fetch chapters:", error);
				setFetchedChapters([]); // Clear on error
			} finally {
				setIsChaptersLoading(false);
			}
		};

		// Only fetch chapters if there are selected subjects (implies selected exams)
		if (selectedSubjects.length > 0) {
			fetchChapters();
		} else {
			// If subjects are cleared but exams might still be selected, clear chapters
			setFetchedChapters([]);
			setSelectedChapters([]);
		}
	}, [selectedSubjects]);


	// Function to fetch search results
	const fetchSearchResults = useCallback(async (page = 1, limit = 10) => {
		setIsSearchLoading(true);
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.append('query', searchQuery);
			if (selectedExams.length > 0) params.append('examIds', selectedExams.join(','));
			// Extract only subject IDs for the query
			if (selectedSubjects.length > 0) params.append('subjectIds', [...new Set(selectedSubjects.map(s => s.subjectId))].join(','));
			if (selectedChapters.length > 0) params.append('chapterIds', selectedChapters.join(','));
			if (selectedPapers.length > 0) params.append('paperIds', selectedPapers.join(','));
			params.append('page', page.toString());
			params.append('limit', limit.toString());

			const response = await fetch(`/api/search/query?${params.toString()}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setSearchResults(data.results || []);
			setPaginationInfo(data.pagination || { currentPage: 1, totalPages: 1, totalResults: 0, limit: 10 });
			setCurrentPage(data.pagination?.currentPage || 1); // Ensure currentPage state matches response
		} catch (error) {
			console.error("Failed to fetch search results:", error);
			setSearchResults([]); // Clear results on error
			setPaginationInfo({ currentPage: 1, totalPages: 1, totalResults: 0, limit: 10 }); // Reset pagination
		} finally {
			setIsSearchLoading(false);
		}
	}, [searchQuery, selectedExams, selectedSubjects, selectedChapters, selectedPapers]); // Dependencies for the fetch function itself

	// Trigger search on filter changes or page changes
	useEffect(() => {
		// Debounce or delay could be added here if needed
		fetchSearchResults(currentPage, paginationInfo.limit);
	}, [selectedExams, selectedSubjects, selectedChapters, selectedPapers, currentPage, fetchSearchResults, paginationInfo.limit]); // Include fetchSearchResults and limit


	// Filter handling functions (no changes needed)
	const toggleExam = (examId) => {
		setSelectedExams(prev =>
			prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]
		);
		setCurrentPage(1); // Reset page on filter change
	};

	const toggleSubject = (subjectInfo) => {
        if (subjectInfo.isSimple) {
            console.warn("Simple subject toggling not implemented.");
        } else {
            // Handle subject-exam combination toggling
            const selectionKey = { subjectId: subjectInfo.subjectId, examId: subjectInfo.examId };
            setSelectedSubjects(prev =>
                prev.some(s => s.subjectId === selectionKey.subjectId && s.examId === selectionKey.examId)
                    ? prev.filter(s => !(s.subjectId === selectionKey.subjectId && s.examId === selectionKey.examId))
                    : [...prev, selectionKey]
            );
        }
		setCurrentPage(1); // Reset page on filter change
	};

	const toggleChapter = (chapterId) => {
		setSelectedChapters(prev =>
			prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
		);
		setCurrentPage(1); // Reset page on filter change
	};

	const togglePaper = (paperId) => {
		setSelectedPapers(prev =>
			prev.includes(paperId) ? prev.filter(id => id !== paperId) : [...prev, paperId]
		);
		setCurrentPage(1); // Reset page on filter change
	};

	// Search handling - Trigger fetch with page 1
	const handleSearch = (e) => {
		e.preventDefault();
		setIsLoading(true); // Keep visual feedback for button click
		setCurrentPage(1); // Reset to first page on new search query
		fetchSearchResults(1, paginationInfo.limit).finally(() => setIsLoading(false));
	};

	// Clear filters - Reset page and trigger fetch
	const clearFilters = () => {
		setSelectedExams([]);
		setSelectedSubjects([]);
		setSelectedChapters([]);
		setSelectedPapers([]);
		setSubjectSearch(""); // Clear dropdown search on filter clear
		setChapterSearch("");
		setPaperSearch("");
		setCurrentPage(1); // Reset page
		// Fetch will be triggered by the state changes via useEffect
	};

	// Pagination handlers
	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= paginationInfo.totalPages && newPage !== currentPage) {
			setCurrentPage(newPage);
			// Fetch is triggered by useEffect watching currentPage
		}
	};

	// Helper to check if a subject-exam combo is selected
	const isSubjectSelected = (subjectInfo) => {
        if (subjectInfo.isSimple) {
            // Check simple selection if implemented
            return false; // Placeholder
        }
		return selectedSubjects.some(s => s.subjectId === subjectInfo.subjectId && s.examId === subjectInfo.examId);
	};

	// Helper to get display name for selected subject object
	const getSelectedSubjectDisplayName = (selectedSubject) => {
		const exam = EXAMS[selectedSubject.examId];
		const subjectData = exam?.subjects.find(([id]) => id === selectedSubject.subjectId);
		return subjectData ? `${subjectData[1]} | ${exam.name}` : 'Unknown Subject';
	};

	// Helper to get display name for selected chapter/paper ID (still needed for filter display)
	const getSelectedItemName = (itemId, itemsArray) => {
		const item = itemsArray.find(i => i._id === itemId);
		return item ? item.name : 'Unknown';
	};

	// Function to render pagination buttons
	const renderPaginationButtons = () => {
		const buttons = [];
		const totalPages = paginationInfo.totalPages;
		const maxButtons = 5; // Max buttons to show (e.g., 1 ... 5 6 7 ... 10)

		if (totalPages <= maxButtons) {
			for (let i = 1; i <= totalPages; i++) {
				buttons.push(
					<Button
						key={i}
						variant={currentPage === i ? "default" : "outline"}
						size="sm"
						className="h-8 w-8 p-0 rounded-md"
						onClick={() => handlePageChange(i)}
					>
						{i}
					</Button>
				);
			}
		} else {
			// Logic for showing limited buttons with ellipsis (...)
			let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
			let endPage = Math.min(totalPages, startPage + maxButtons - 1);

			if (endPage - startPage + 1 < maxButtons) {
				startPage = Math.max(1, endPage - maxButtons + 1);
			}

			if (startPage > 1) {
				buttons.push(
					<Button key="1" variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={() => handlePageChange(1)}>1</Button>
				);
				if (startPage > 2) {
					buttons.push(<span key="start-ellipsis" className="text-sm px-1">...</span>);
				}
			}

			for (let i = startPage; i <= endPage; i++) {
				buttons.push(
					<Button
						key={i}
						variant={currentPage === i ? "default" : "outline"}
						size="sm"
						className="h-8 w-8 p-0 rounded-md"
						onClick={() => handlePageChange(i)}
					>
						{i}
					</Button>
				);
			}

			if (endPage < totalPages) {
				if (endPage < totalPages - 1) {
					buttons.push(<span key="end-ellipsis" className="text-sm px-1">...</span>);
				}
				buttons.push(
					<Button key={totalPages} variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md" onClick={() => handlePageChange(totalPages)}>{totalPages}</Button>
				);
			}
		}

		return buttons;
	};


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
					{/* Filters section */}
					<div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 lg:w-72 space-y-6`}>
						<div className="bg-card rounded-xl p-5 shadow-sm border border-border/40">
							{/* Filter header */}
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

							{/* Exam filter - Unchanged */}
							<div className="mb-5">
								<h3 className="text-sm font-medium mb-2">Exam</h3>
								<div className="flex flex-wrap gap-2">
									{Object.entries(EXAMS).map(([examId, examData]) => (
										<button
											key={examId}
											onClick={() => toggleExam(examId)}
											className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${selectedExams.includes(examId)
												? "bg-primary text-primary-foreground shadow-sm font-medium scale-105"
												: "bg-accent hover:bg-primary/20 border border-transparent hover:border-primary/30"
												}`}
										>
											{examData.name}
										</button>
									))}
								</div>
							</div>

							{/* Subject filter - Added Search Input */}
							<div className="mb-5">
								<h3 className="text-sm font-medium mb-2">Subject</h3>
								<div className="flex flex-wrap gap-2">
									{/* Display selected subjects directly */}
									{selectedSubjects.map((selSub) => (
										<button
											key={`${selSub.subjectId}-${selSub.examId}`}
											onClick={() => toggleSubject({ subjectId: selSub.subjectId, examId: selSub.examId, isSimple: false })}
											className="px-3 py-1 text-xs rounded-full transition-all duration-200 bg-primary text-primary-foreground shadow-sm font-medium scale-105"
										>
											{getSelectedSubjectDisplayName(selSub)} &times;
										</button>
									))}

									{/* Dropdown for adding more subjects */}
									<DropdownMenu onOpenChange={(open) => !open && setSubjectSearch("")}> {/* Clear search on close */}
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="h-7 px-2 text-xs border-dashed"
												disabled={selectedExams.length === 0}
											>
												Add Subject <ChevronDown className="h-3 w-3 ml-1" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-64 max-h-72 overflow-y-hidden flex flex-col"> {/* Increased width slightly */}
											<div className="p-2">
												<Input
													autoFocus
													placeholder="Search subjects..."
													value={subjectSearch}
													onChange={(e) => setSubjectSearch(e.target.value)}
													className="h-8 text-xs"
												/>
											</div>
											<DropdownMenuSeparator />
											<div className="flex-grow overflow-y-auto custom-scrollbar"> {/* Scrollable area for items */}
												{availableSubjects
													.filter(sub =>
														!sub.isSimple &&
														!isSubjectSelected(sub) &&
														(subjectSearch === "" ||
															sub.subjectName.toLowerCase().includes(subjectSearch.toLowerCase()) ||
															sub.examName.toLowerCase().includes(subjectSearch.toLowerCase()))
													)
													.map((subjectInfo) => (
														<DropdownMenuCheckboxItem
															key={`${subjectInfo.subjectId}-${subjectInfo.examId}`}
															checked={false}
															onCheckedChange={() => toggleSubject(subjectInfo)}
															onSelect={(e) => e.preventDefault()} // Prevent closing on select
														>
															{subjectInfo.subjectName} | {subjectInfo.examName}
														</DropdownMenuCheckboxItem>
													))}
												{availableSubjects.filter(sub => !sub.isSimple && !isSubjectSelected(sub)).length === 0 && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">No available subjects</DropdownMenuLabel>
												)}
												{availableSubjects.filter(sub =>
													!sub.isSimple &&
													!isSubjectSelected(sub) &&
													(subjectSearch === "" ||
														sub.subjectName.toLowerCase().includes(subjectSearch.toLowerCase()) ||
														sub.examName.toLowerCase().includes(subjectSearch.toLowerCase()))
												).length === 0 && availableSubjects.filter(sub => !sub.isSimple && !isSubjectSelected(sub)).length > 0 && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">No subjects match search</DropdownMenuLabel>
												)}
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>

							{/* Chapter filter - Added Search Input */}
							<div className="mb-5">
								<h3 className="text-sm font-medium mb-2">Chapter</h3>
								<div className="flex flex-wrap gap-2">
									{/* Display selected chapters directly */}
									{selectedChapters.map((chapterId) => (
										<button
											key={chapterId}
											onClick={() => toggleChapter(chapterId)}
											className="px-3 py-1 text-xs rounded-full transition-all duration-200 bg-primary text-primary-foreground shadow-sm font-medium scale-105"
										>
											{getSelectedItemName(chapterId, fetchedChapters)} &times;
										</button>
									))}

									{/* Dropdown for adding more chapters */}
									<DropdownMenu onOpenChange={(open) => !open && setChapterSearch("")}> {/* Clear search on close */}
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="h-7 px-2 text-xs border-dashed"
												disabled={isChaptersLoading || selectedSubjects.length === 0}
											>
												{isChaptersLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : 'Add Chapter'}
												{!isChaptersLoading && <ChevronDown className="h-3 w-3 ml-1" />}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-64 max-h-72 overflow-y-hidden flex flex-col">
											<div className="p-2">
												<Input
													autoFocus
													placeholder="Search chapters..."
													value={chapterSearch}
													onChange={(e) => setChapterSearch(e.target.value)}
													className="h-8 text-xs"
													disabled={isChaptersLoading}
												/>
											</div>
											<DropdownMenuSeparator />
											<div className="flex-grow overflow-y-auto custom-scrollbar">
												{fetchedChapters
													.filter(chap =>
														!selectedChapters.includes(chap._id) &&
														(chapterSearch === "" || chap.name.toLowerCase().includes(chapterSearch.toLowerCase()))
													)
													.map((chapter) => (
														<DropdownMenuCheckboxItem
															key={chapter._id}
															checked={false}
															onCheckedChange={() => toggleChapter(chapter._id)}
															onSelect={(e) => e.preventDefault()} // Prevent closing on select
														>
															{chapter.name}
														</DropdownMenuCheckboxItem>
													))}
												{fetchedChapters.filter(chap => !selectedChapters.includes(chap._id)).length === 0 && !isChaptersLoading && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">
														{selectedSubjects.length > 0 ? 'No available chapters' : 'Select subject(s)'}
													</DropdownMenuLabel>
												)}
												{fetchedChapters.filter(chap =>
													!selectedChapters.includes(chap._id) &&
													(chapterSearch === "" || chap.name.toLowerCase().includes(chapterSearch.toLowerCase()))
												).length === 0 && fetchedChapters.filter(chap => !selectedChapters.includes(chap._id)).length > 0 && !isChaptersLoading && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">No chapters match search</DropdownMenuLabel>
												)}
												{isChaptersLoading && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">Loading...</DropdownMenuLabel>
												)}
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>

							{/* Paper Year filter - Added Search Input */}
							<div>
								<h3 className="text-sm font-medium mb-2">Paper Year</h3>
								<div className="flex flex-wrap gap-2">
									{/* Display selected papers directly */}
									{selectedPapers.map((paperId) => (
										<button
											key={paperId}
											onClick={() => togglePaper(paperId)}
											className="px-3 py-1 text-xs rounded-full transition-all duration-200 bg-primary text-primary-foreground shadow-sm font-medium scale-105"
										>
											{getSelectedItemName(paperId, fetchedPapers)} &times;
										</button>
									))}
									{/* Dropdown for adding more papers */}
									<DropdownMenu onOpenChange={(open) => !open && setPaperSearch("")}> {/* Clear search on close */}
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="h-7 px-2 text-xs border-dashed"
												disabled={isPapersLoading || selectedExams.length === 0}
											>
												{isPapersLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : 'Add Year'}
												{!isPapersLoading && <ChevronDown className="h-3 w-3 ml-1" />}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-64 max-h-72 overflow-y-hidden flex flex-col">
											<div className="p-2">
												<Input
													autoFocus
													placeholder="Search years..."
													value={paperSearch}
													onChange={(e) => setPaperSearch(e.target.value)}
													className="h-8 text-xs"
													disabled={isPapersLoading}
												/>
											</div>
											<DropdownMenuSeparator />
											<div className="flex-grow overflow-y-auto custom-scrollbar">
												{fetchedPapers
													.filter(paper =>
														!selectedPapers.includes(paper._id) &&
														(paperSearch === "" || paper.name.toLowerCase().includes(paperSearch.toLowerCase()))
													)
													.map((paper) => (
														<DropdownMenuCheckboxItem
															key={paper._id}
															checked={false}
															onCheckedChange={() => togglePaper(paper._id)}
															onSelect={(e) => e.preventDefault()} // Prevent closing on select
														>
															{paper.name}
														</DropdownMenuCheckboxItem>
													))}
												{fetchedPapers.filter(paper => !selectedPapers.includes(paper._id)).length === 0 && !isPapersLoading && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">
														{selectedExams.length > 0 ? 'No available years' : 'Select exam(s)'}
													</DropdownMenuLabel>
												)}
												{fetchedPapers.filter(paper =>
													!selectedPapers.includes(paper._id) &&
													(paperSearch === "" || paper.name.toLowerCase().includes(paperSearch.toLowerCase()))
												).length === 0 && fetchedPapers.filter(paper => !selectedPapers.includes(paper._id)).length > 0 && !isPapersLoading && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">No years match search</DropdownMenuLabel>
												)}
												{isPapersLoading && (
													<DropdownMenuLabel className="text-xs text-muted-foreground italic text-center py-2">Loading...</DropdownMenuLabel>
												)}
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>
					</div>

					{/* Results section - Updated */}
					<div className="flex-1">
						<div className="bg-card rounded-xl p-5 shadow-sm border border-border/40 min-h-[400px] flex flex-col">
							{/* Results header */}
							<div className="flex justify-between items-center mb-4">
								<h2 className="font-semibold text-lg">Results</h2>
								{!isSearchLoading && (
									<p className="text-sm text-foreground/70">
										{paginationInfo.totalResults} questions found
									</p>
								)}
								{isSearchLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
							</div>

							{/* Results list - Updated */}
							<div className="space-y-4 flex-grow">
								{isSearchLoading && searchResults.length === 0 && ( // Show loader centrally if loading initial results
									<div className="flex justify-center items-center h-full">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
									</div>
								)}
								{!isSearchLoading && searchResults.length === 0 && (
									<div className="flex justify-center items-center h-full">
										<p className="text-center text-foreground/60 py-8">No questions found matching your criteria.</p>
									</div>
								)}
								{searchResults.map((result) => (
									<div
										key={result._id}
										className="border border-border/40 hover:border-primary/30 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer"
										onClick={() => router.push(`/question/${result._id}`)}
									>
										<div className="flex gap-2 mb-2 flex-wrap">
											<span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
												{result.subject_name || 'N/A'}
											</span>
											<span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
												{result.exam_name || 'N/A'}
											</span>
											<span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full">
												{result.paper_name || 'N/A'}
											</span>
											<span className={`
												bg-${result.level === 1 ? 'teal' : result.level === 2 ? 'orange' : 'red'}-100 
												text-${result.level === 1 ? 'teal' : result.level === 2 ? 'orange' : 'red'}-800 
												dark:bg-${result.level === 1 ? 'teal' : result.level === 2 ? 'orange' : 'red'}-900 
												dark:text-${result.level === 1 ? 'teal' : result.level === 2 ? 'orange' : 'red'}-300 
												text-xs px-2 py-0.5 rounded-full`}>
												{result.level === 1 ? "Easy" : result.level === 2 ? "Medium" : "Hard"}
											</span>
										</div>
										{/* Render question text with Latex */}
										<div className="text-foreground/90 line-clamp-2 overflow-hidden"> {/* Wrap Latex in a div for line-clamp */}
											<Latex>{result.question || ''}</Latex>
										</div>
										<div className="mt-2 flex justify-between items-center">
											<span className="text-xs text-foreground/60">
												{result.chapter_name || 'N/A'}
											</span>
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

							{/* Pagination - Updated */}
							{paginationInfo.totalPages > 1 && !isSearchLoading && (
								<div className="mt-6 flex justify-center pt-4 border-t border-border/40">
									<div className="flex items-center space-x-1">
										<Button
											variant="outline"
											size="sm"
											className="h-8 w-8 p-0 rounded-md"
											disabled={currentPage === 1}
											onClick={() => handlePageChange(currentPage - 1)}
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M15 18l-6-6 6-6"></path>
											</svg>
										</Button>
										{renderPaginationButtons()} {/* This call should now work */}
										<Button
											variant="outline"
											size="sm"
											className="h-8 w-8 p-0 rounded-md"
											disabled={currentPage === paginationInfo.totalPages}
											onClick={() => handlePageChange(currentPage + 1)}
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M9 18l6-6-6-6"></path>
											</svg>
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
