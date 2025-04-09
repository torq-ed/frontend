"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const { data: session } = useSession();
    const isSignedIn = !!session;

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`fixed w-full top-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8`}>
            <div className={`mx-auto max-w-7xl rounded-full transition-all duration-300 flex items-center justify-between ${
                scrolled 
                    ? "bg-background/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] mt-2 px-4 py-2" 
                    : "bg-background/40 backdrop-blur-lg mt-4 px-6 py-3 shadow-[0_8px_20px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
            }`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative overflow-hidden rounded-full bg-primary/10 p-1">
                        <Image 
                            src="/logo-trans.svg" 
                            alt="Torq Logo" 
                            width={36} 
                            height={36}
                            className="transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                        />
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Torq
                    </span>
                </Link>

                {/* Authentication Buttons */}
                <div className="hidden md:flex items-center space-x-3">
                    {isSignedIn ? (
                        <>
                            <Button 
                                variant={pathname === "/dashboard" ? "default" : "ghost"}
                                size="sm" 
                                className={`rounded-full px-4 ${
                                  pathname === "/dashboard" 
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-primary/10"
                                }`}
                                asChild
                            >
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <Button 
                                variant={pathname === "/activity" ? "default" : "ghost"}
                                size="sm" 
                                className={`rounded-full px-4 ${
                                  pathname === "/activity" 
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-primary/10"
                                }`}
                                asChild
                            >
                                <Link href="/activity">Activity</Link>
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full hover:bg-destructive/10 hover:text-destructive px-4 border-none"
                                onClick={() => signOut({ callbackUrl: '/' })}
                            >
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                            asChild
                        >
                            <Link href="/about">About</Link>
                        </Button>
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                            asChild
                        >
                            <Link href="/features">Features</Link>
                        </Button>
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                            asChild
                        >
                            <Link href="/contact">Contact</Link>
                        </Button>
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                            asChild
                        >
                            <Link href="/signin">Sign In</Link>
                        </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <MobileMenu isSignedIn={isSignedIn} />
                </div>
            </div>
        </header>
    );
}

function MobileMenu({ isSignedIn }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col justify-center items-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-300"
                aria-label="Toggle menu"
            >
                <span className={`w-5 h-0.5 bg-current transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
                <span className={`w-5 h-0.5 bg-current my-1 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`w-5 h-0.5 bg-current transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-16 right-4 bg-background/80 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-4 min-w-[200px] animate-in fade-in slide-in-from-top-5">
                    <ul className="flex flex-col space-y-2">
                        {[
                            { href: '/', label: 'Home' },
                            { href: '/about', label: 'About' },
                            { href: '/features', label: 'Features' },
                            { href: '/contact', label: 'Contact' },
                        ].map((link) => (
                            <li key={link.href}>
                                <Link 
                                    href={link.href}
                                    className={`block px-4 py-2 rounded-md transition-colors duration-300
                                        ${pathname === link.href 
                                            ? 'bg-primary/20 text-primary' 
                                            : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        
                        <li className="pt-2 mt-2 border-t border-border/50">
                            {isSignedIn ? (
                                <>
                                    <Link 
                                        href="/dashboard" 
                                        className="block px-4 py-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link 
                                        href="/activity" 
                                        className="block px-4 py-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                                    >
                                        Activity
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="w-full text-left px-4 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-300"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link 
                                    href="/signin" 
                                    className="block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 text-center"
                                >
                                    Sign In
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
