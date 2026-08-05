"use client";

import Link from "next/link";
import { History } from "lucide-react";
import InputSection from "@/components/InputSection";
import TerminalLog from "@/components/TerminalLog";
import ReportDashboard from "@/components/ReportDashboard";
import { useValidator } from "@/hooks/useValidator";

export default function Home() {
    const { logs, status, result, currentIdea, scrapedData, handleValidate, isProcessing } = useValidator();

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
            <div className="container mx-auto px-4 pb-20">
                <header className="flex justify-between items-center py-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                        Micro-SaaS Validator
                    </h1>
                    <Link href="/history" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-4 py-2 hover:bg-zinc-900 rounded-lg">
                        <History className="w-4 h-4" />
                        <span className="text-sm font-medium">History</span>
                    </Link>
                </header>

                <InputSection onValidate={handleValidate} isLoading={isProcessing} />

                {/* Show Terminal if processing */}
                {isProcessing && <TerminalLog logs={logs} />}

                {status === "complete" && result && (
                    <ReportDashboard
                        result={result}
                        idea={currentIdea}
                        scrapedData={scrapedData}
                    />
                )}
            </div>
        </main>
    );
}
