"use client";

import { useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Lightbulb, TrendingUp, TriangleAlert, ExternalLink, DollarSign, Box, Loader2, MessageCircle, MessageSquareQuote } from "lucide-react";
import SaturationGauge from "./SaturationGauge";
import BusinessCanvasGrid from "./BusinessCanvasGrid";
import PivotChat from "./PivotChat";
import OpportunityCard from "./OpportunityCard";

interface CompetitorAnalysis {
    name: string;
    url: string;
    pricing_model: string;
    value_prop: string;
}

interface Verdict {
    saturation_score: number;
    explanation: string;
    blue_ocean_opportunity: string;
}

interface AnalysisResult {
    validation_id: string; // UUID
    competitor_analysis: CompetitorAnalysis[];
    voice_of_customer: { pain_points: string[] };
    verdict: Verdict;
}

interface ReportDashboardProps {
    result: AnalysisResult;
    idea: string;
    scrapedData: any[];
}

interface CanvasResponse {
    canvas: {
        key_partners: string[];
        key_activities: string[];
        key_resources: string[];
        value_propositions: string[];
        customer_relationships: string[];
        channels: string[];
        customer_segments: string[];
        cost_structure: string[];
        revenue_streams: string[];
    }
}

interface SocialResponse {
    reddit_threads: string[];
    user_quotes: string[];
}

export default function ReportDashboard({ result, idea, scrapedData }: ReportDashboardProps) {
    const { verdict, competitor_analysis, voice_of_customer, validation_id } = result;

    const [canvas, setCanvas] = useState<CanvasResponse["canvas"] | null>(null);
    const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);

    const [socialData, setSocialData] = useState<SocialResponse | null>(null);
    const [isScanningSocial, setIsScanningSocial] = useState(false);

    // Color logic based on score
    const isBlueOcean = verdict.saturation_score < 40;
    const isSaturated = verdict.saturation_score > 75;

    const verdictColor = isBlueOcean ? "text-emerald-400" : isSaturated ? "text-red-400" : "text-yellow-400";
    const verdictBorder = isBlueOcean ? "border-emerald-500/30" : isSaturated ? "border-red-500/30" : "border-yellow-500/30";
    const verdictBg = isBlueOcean ? "bg-emerald-950/20" : isSaturated ? "bg-red-950/20" : "bg-yellow-950/20";

    const handleGenerateCanvas = async () => {
        setIsGeneratingCanvas(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/strategy/canvas", {
                validation_id: validation_id,
                idea,
                scraped_data: scrapedData
            });
            setCanvas(res.data.canvas);
        } catch (e) {
            console.error("Failed to generate canvas", e);
        } finally {
            setIsGeneratingCanvas(false);
        }
    };

    const handleSocialScan = async () => {
        setIsScanningSocial(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/validate/step4-social", {
                idea
            });
            setSocialData(res.data);
        } catch (e) {
            console.error("Failed to scan social", e);
        } finally {
            setIsScanningSocial(false);
        }
    };

    return (
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 max-w-6xl mx-auto relative">

            {/* Pivot Coach - Floating Chat */}
            <PivotChat reportContext={result} validationId={validation_id} />

            {/* 1. Verdict Section with Blueprint */}
            <OpportunityCard verdict={verdict} />

            <div className="grid md:grid-cols-3 gap-8">
                {/* 2. Competitor Grid (Span 2) */}
                <section className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-zinc-400" />
                        </div>
                        Key Competitors
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {competitor_analysis.map((comp, idx) => (
                            <div key={idx} className="group bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-white truncate pr-2 max-w-[200px]" title={comp.name}>{comp.name}</h3>
                                        <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-400 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                    <div className="mb-4">
                                        <span className="text-xs font-mono text-zinc-500 uppercase">Value Proposition</span>
                                        <p className="text-sm text-zinc-300 mt-1 line-clamp-3 leading-relaxed">
                                            {comp.value_prop}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-zinc-800/50 flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-green-500" />
                                    <span className="text-xs font-medium text-green-400 bg-green-950/30 px-2 py-1 rounded-full border border-green-900/30">
                                        {comp.pricing_model}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Pain Points (Span 1) */}
                <section className="space-y-6 relative">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-red-950/30 rounded-lg">
                            <TriangleAlert className="w-6 h-6 text-red-500" />
                        </div>
                        Why Users Are Frustrated
                    </h2>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1 shadow-inner h-full">
                        <ul className="divide-y divide-zinc-800/50">
                            {voice_of_customer.pain_points.map((point, i) => (
                                <li key={i} className="p-4 flex gap-3 items-start group hover:bg-zinc-900 transition-colors rounded-xl">
                                    <TriangleAlert className="w-4 h-4 text-red-400 mt-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-sm text-zinc-300 leading-relaxed font-medium">
                                        "{point}"
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>

            {/* 4. Social Listener Section */}
            <section className="space-y-6 pt-8 border-t border-zinc-800">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-indigo-950/30 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    Voice of the Internet
                </h2>

                {!socialData ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                        <p className="text-zinc-400 mb-6 text-center max-w-md">
                            Scan Reddit and Hacker News to find real people discussing this problem, ranting about competitors, or asking for solutions.
                        </p>
                        <button
                            onClick={handleSocialScan}
                            disabled={isScanningSocial}
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-indigo-300 font-semibold rounded-lg border border-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isScanningSocial ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareQuote className="w-4 h-4" />}
                            {isScanningSocial ? "Scanning Discussions..." : "Scan Social Media"}
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Quotes */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-zinc-300">Direct Quotes</h3>
                            <div className="space-y-3">
                                {socialData.user_quotes.length === 0 ? <p className="text-zinc-500 italic">No direct quotes found.</p> : null}
                                {socialData.user_quotes.map((quote, i) => {
                                    const isWTP = quote.toLowerCase().includes("pay") || quote.includes("$") || quote.toLowerCase().includes("buy");
                                    return (
                                        <div key={i} className={`p-4 rounded-xl border relative ${isWTP ? "bg-amber-950/10 border-amber-500/30" : "bg-zinc-900 border-zinc-800"} `}>
                                            <MessageSquareQuote className={`w-5 h-5 absolute top-4 left-4 ${isWTP ? "text-amber-500" : "text-zinc-600"}`} />
                                            <p className={`pl-8 text-sm italic leading-relaxed ${isWTP ? "text-amber-200" : "text-zinc-300"}`}>
                                                "{quote}"
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Threads */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-zinc-300">Discussion Threads</h3>
                            <div className="space-y-2">
                                {socialData.reddit_threads.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-indigo-500/50 hover:bg-zinc-800 transition-all">
                                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
                                            <ExternalLink className="w-3 h-3" />
                                            {url.includes("reddit") ? "Reddit" : "Hacker News"}
                                        </div>
                                        <p className="text-sm text-zinc-400 truncate">{url}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* 5. Strategy Module */}
            <section className="border-t border-zinc-800 pt-12 pb-20">
                {!canvas ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-white">Strategy Module</h2>
                            <p className="text-zinc-400">Generate a strategic Business Model Canvas based on this analysis.</p>
                        </div>
                        <button
                            onClick={handleGenerateCanvas}
                            disabled={isGeneratingCanvas}
                            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-bold text-white shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingCanvas ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Drafting Strategy...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Box className="w-5 h-5" /> Generate Business Model Canvas
                                </span>
                            )}
                        </button>
                    </div>
                ) : (
                    <BusinessCanvasGrid canvas={canvas} />
                )}
            </section>

        </div>
    );
}
