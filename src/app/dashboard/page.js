"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";


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
        <main className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8 shadow-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">
                                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
                            </h1>
                            <p className="mt-2 text-foreground/80">
                                Here's an overview of your activity and recommendations.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {session?.user?.image && (
                                <div className="relative overflow-hidden rounded-full border-2 border-primary">
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        width={60}
                                        height={60}
                                        className="rounded-full"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            )}
                            <Button className="bg-primary hover:bg-primary/90">
                                View Profile
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Activity Summary */}
                    <div className="bg-card rounded-xl shadow-md p-6 col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            <p className="text-foreground/70">No recent activity to display.</p>
                            {/* Activity items would go here */}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-card rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Total Sessions</span>
                                <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Completed Tasks</span>
                                <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Achievement Points</span>
                                <span className="font-medium">0</span>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-card rounded-xl shadow-md p-6 col-span-1 md:col-span-3">
                        <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                <h3 className="font-medium">Complete Your Profile</h3>
                                <p className="text-sm text-foreground/70 mt-1">Enhance your experience by adding more details to your profile.</p>
                            </div>
                            <div className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                <h3 className="font-medium">Explore Features</h3>
                                <p className="text-sm text-foreground/70 mt-1">Discover all the tools and features available to you.</p>
                            </div>
                            <div className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                <h3 className="font-medium">Connect Accounts</h3>
                                <p className="text-sm text-foreground/70 mt-1">Link your other accounts for a more integrated experience.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
