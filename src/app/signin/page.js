"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSignIn = async (provider) => {
        setIsLoading(true);
        try {
            await signIn(provider, { callbackUrl: "/" });
        } catch (error) {
            console.error("Error signing in:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Sign In Section */}
            <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-primary to-secondary text-primary-foreground min-h-[calc(100vh-5rem)]">
                {/* Logo */}
                <Image
                    src="/logo-trans.svg"
                    alt="Torq Logo"
                    width={100}
                    height={100}
                    className="mb-6"
                />
                <h2 className="text-4xl font-bold mb-4">Sign In</h2>
                <p className="text-lg mb-10">Choose your preferred sign in method</p>
                
                {/* Provider Buttons */}
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <Button 
                        variant="outline" 
                        className="bg-white text-black hover:bg-gray-50 transition-all transform hover:scale-105 py-5 flex justify-center gap-3 rounded-xl shadow-md hover:shadow-lg border-0 relative overflow-hidden group"
                        onClick={() => handleSignIn("google")}
                        disabled={isLoading}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="relative z-10"><path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path></svg>
                        <span className="font-medium relative z-10">Sign in with Google</span>
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="bg-[#5865F2] text-white hover:bg-[#4a56d4] transition-all transform hover:scale-105 py-5 flex justify-center gap-3 rounded-xl shadow-md hover:shadow-lg border-0 relative overflow-hidden group"
                        onClick={() => handleSignIn("discord")}
                        disabled={isLoading}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#6674ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="relative z-10"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"></path></svg>
                        <span className="font-medium relative z-10">Sign in with Discord</span>
                    </Button>
                    
                    {/* <Button 
                        variant="outline" 
                        className="bg-[#FF4500] text-white hover:bg-[#e03d00] transition-all transform hover:scale-105 py-5 flex justify-center gap-3 rounded-xl shadow-md hover:shadow-lg border-0 relative overflow-hidden group"
                        onClick={() => handleSignIn("reddit")}
                        disabled={isLoading}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ff5a1a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="relative z-10"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547l-.8 3.747c1.824.07 3.48.632 4.674 1.488c.308-.309.73-.491 1.207-.491c.968 0 1.754.786 1.754 1.754c0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87c-3.874 0-7.004-2.176-7.004-4.87c0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754c.463 0 .898.196 1.207.49c1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197a.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248c.687 0 1.248-.561 1.248-1.249c0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25c0 .687.561 1.248 1.249 1.248c.688 0 1.249-.561 1.249-1.249c0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094a.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913c.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463a.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73c-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"></path></svg>
                        <span className="font-medium relative z-10">Sign in with Reddit</span>
                    </Button> */}
                </div>
                
                {/* <p className="mt-10 text-sm">
                    By signing in, you agree to our <a href="#" className="underline hover:text-white/80">Terms of Service</a> and <a href="#" className="underline hover:text-white/80">Privacy Policy</a>.
                </p> */}
            </section>
        </div>
    );
}
