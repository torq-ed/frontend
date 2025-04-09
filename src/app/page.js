"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    return (
        <div>
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-primary to-secondary text-primary-foreground min-h-screen pt-28">
                {/* Logo */}
                <Image
                    src="/logo-trans.svg"
                    alt="Torq Logo"
                    width={100}
                    height={100}
                    className="mb-0"
                />
                <h2 className="text-4xl font-bold mb-2">Welcome to Torq</h2>
                <p className="text-lg mb-6 italic">"For Students, By Students"</p>
                <Link href="/signin">
                    <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-secondary transition-transform transform hover:scale-105">
                        Get Started
                    </Button>
                </Link>
            </section>
        </div>
    );
}
