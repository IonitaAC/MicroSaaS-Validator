"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface InputSectionProps {
    onValidate: (idea: string) => void;
    isLoading: boolean;
}

export default function InputSection({ onValidate, isLoading }: InputSectionProps) {
    const [idea, setIdea] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onValidate(idea);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-center bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                Validate your Micro-SaaS Idea
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl text-center">
                Before you build, let our AI agents scout competitors, scrape data, and analyze
                market saturation with brutal honesty.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-zinc-900 rounded-lg p-2 ring-1 ring-white/10 shadow-2xl">
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-zinc-600 text-lg"
                        placeholder="e.g. Uber for dog walkers..."
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !idea.trim()}
                        className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing
                            </>
                        ) : (
                            <>
                                Validate <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
