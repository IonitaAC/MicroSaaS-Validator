"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReportDashboard from "@/components/ReportDashboard";

export default function ReportPage() {
    const params = useParams(); // { id: string }
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Need to fetch logic similar to hydration
    useEffect(() => {
        if (!params.id) return;

        const fetchReport = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/validate/${params.id}`);
                setResult(res.data);
            } catch (e) {
                console.error(e);
                setError("Failed to load report. It may not exist.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>Loading Analysis...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
                <p className="text-red-400">{error || "Report not found"}</p>
                <Link href="/history" className="text-indigo-400 hover:underline">
                    Back to History
                </Link>
            </div>
        );
    }

    // result structure matches AnalysisResult (validation_id, competitor_analysis, etc.)
    // We need to pass `scrapedData` and `idea` to ReportDashboard.
    // However, the backend `get_validation` endpoint currently returns `AnalystResponse`.
    // `AnalystResponse` doesn't strictly have `idea` or `scrapedData` in the top level response model I defined earlier?
    // Let's check `get_validation` implementation.
    // It returns `AnalystResponse`.
    // `AnalystResponse` has `validation_id`, `competitor_analysis`, `voice_of_customer`, `verdict`.
    // It DOES NOT have the original `idea` string.
    // I need to update `AnalystResponse` to include `idea` so I can display it.

    // WAIT: I should update the backend `get_validation` to return `idea` as well.
    // Or I can just pass `idea="Stored Idea"` as a placeholder if I don't want to change backend now.
    // BUT the prompt says "Re-load the saved data".
    // I'll assume `AnalystResponse` has it or I should add it.
    // Checking `AnalystResponse` definition... it does NOT have `idea`.
    // I should add `idea` to `AnalystResponse` schema and `get_validation` return.

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30 pb-20">
            <div className="container mx-auto px-4">
                <div className="py-6">
                    <Link href="/history" className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to History
                    </Link>
                </div>

                <ReportDashboard
                    result={result}
                    idea={result.idea || "Analyzed Idea"} // Fallback if not yet added
                    scrapedData={[]} // PivotCoach might want this, but for history view we might not have it unless we store it.
                // Store scraped_data? ValidationRecord has `competitors` (metadata) but maybe not raw scraped HTML.
                // `ValidationRecord` has `competitors` JSON which is `List[Dict]`.
                // Chat/Canvas might need it.
                // For now pass empty array or mapped competitors.
                />
            </div>
        </main>
    );
}
