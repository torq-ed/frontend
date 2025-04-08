import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div>
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-primary text-primary-foreground shadow-md">
                <h1 className="text-xl font-bold">Torq</h1>
                <nav>
                    <ul className="flex gap-4">
                        <li><a href="#features" className="hover:underline transition-colors">Features</a></li>
                        <li><a href="#about" className="hover:underline transition-colors">About</a></li>
                        <li><a href="#contact" className="hover:underline transition-colors">Contact</a></li>
                    </ul>
                </nav>
            </header>
            
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-primary to-secondary text-primary-foreground">
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
                <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-secondary transition-transform transform hover:scale-105">
                    Get Started
                </Button>
            </section>
        </div>
    );
}
