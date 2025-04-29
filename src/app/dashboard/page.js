"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link"; // Import Link

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect to sign in if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-16 sm:pt-20 md:pt-24 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 shadow-md md:shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="text-center sm:text-left w-full">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
                            </h1>
                            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-foreground/80">
                                Here's an overview of your activity and recommendations.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                            {session?.user?.image && (
                                <div className="relative overflow-hidden rounded-full border-2 border-primary flex-shrink-0">
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        width={50}
                                        height={50}
                                        className="rounded-full w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            )}
                            <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm whitespace-nowrap py-1 px-2 sm:px-3 h-auto">
                                View Profile
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {/* Top Row: Stats and Activity on mobile, just Activity on larger screens */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {/* Stats Card - Full width on mobile, 1/3 on desktop */}
                        <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 order-1 md:order-2">
                            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Stats</h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span>Total Sessions</span>
                                    <span className="font-medium">0</span>
                                </div>
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span>Completed Tasks</span>
                                    <span className="font-medium">0</span>
                                </div>
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span>Achievement Points</span>
                                    <span className="font-medium">0</span>
                                </div>
                            </div>
                        </div>

                        {/* Activity Summary - Full width on mobile, 2/3 on desktop */}
                        <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 col-span-1 md:col-span-2 order-2 md:order-1">
                            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Activity</h2>
                            <div className="space-y-3 sm:space-y-4">
                                <p className="text-sm sm:text-base text-foreground/70">No recent activity to display.</p>
                                {/* Activity items would go here */}
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-card rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Get Started</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <Link href="/search" className="block"> 
                                <div className="border border-border rounded-lg p-3 sm:p-4 h-full hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                    <h3 className="font-medium text-sm sm:text-base">Search 47k+ Questions</h3>
                                    <p className="text-xs sm:text-sm text-foreground/70 mt-1">Find specific questions from a vast library.</p>
                                </div>
                            </Link>
                            <Link href="/generate" className="block"> 
                                <div className="border border-border rounded-lg p-3 sm:p-4 h-full hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                    <h3 className="font-medium text-sm sm:text-base">Generate Personalized Tests</h3>
                                    <p className="text-xs sm:text-sm text-foreground/70 mt-1">Create custom tests based on your needs.</p>
                                </div>
                            </Link>
                            <Link href="/ai" className="block"> 
                                <div className="border border-border rounded-lg p-3 sm:p-4 h-full hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                    <h3 className="font-medium text-sm sm:text-base">Ask Doubts to TorqAI</h3>
                                    <p className="text-xs sm:text-sm text-foreground/70 mt-1">Get instant help and clarifications from our AI.</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
