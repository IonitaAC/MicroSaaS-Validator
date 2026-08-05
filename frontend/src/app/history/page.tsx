"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Search, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface ValidationSummary {
    id: string;
    idea: string;
    created_at: string;
    saturation_score: number;
    blue_ocean_opportunity?: string;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<ValidationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/history");
                setHistory(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getScoreColor = (score: number) => {
        if (score < 40) return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
        if (score > 75) return "text-red-400 border-red-500/30 bg-red-950/20";
        return "text-yellow-400 border-yellow-500/30 bg-yellow-950/20";
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Link href="/" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Validator
                        </Link>
                        <h1 className="text-3xl font-bold">Validation History</h1>
                        <p className="text-zinc-400">Past ideas and their market saturation scores.</p>
                    </div>
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="text-center py-20 text-zinc-500 animate-pulse">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                        <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-500">No validations yet</h3>
                        <p className="text-zinc-600 mb-6">Start by validating your first Micro-SaaS idea.</p>
                        <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
                            Validate New Idea
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {history.map((item) => (
                            <Link key={item.id} href={`/report/${item.id}`}>
                                <div className="group bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 hover:bg-zinc-800 transition-all cursor-pointer flex justify-between items-center">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                            {item.idea}
                                        </h3>
                                        {item.blue_ocean_opportunity && (
                                            <p className="text-sm text-zinc-400 line-clamp-1">
                                                <span className="text-indigo-400 font-mono text-xs uppercase mr-2">Opportunity</span>
                                                {item.blue_ocean_opportunity}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0 ml-4">
                                        <div className={`text-2xl font-bold font-mono px-3 py-1 rounded-lg border ${getScoreColor(item.saturation_score)}`}>
                                            {item.saturation_score}/100
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1 uppercase font-semibold">Saturation</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
