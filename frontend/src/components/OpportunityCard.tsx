"use client";

import { useState } from "react";
import axios from "axios";
import { AlertCircle, Lightbulb, TrendingUp, ChevronDown, Check, Circle, Terminal, Hammer, FileJson } from "lucide-react";
import SaturationGauge from "./SaturationGauge";

interface Verdict {
    saturation_score: number;
    explanation: string;
    blue_ocean_opportunity: string;
}

interface OpportunityCardProps {
    verdict: Verdict;
}

interface ExecutionPlan {
    core_features: string[];
    nice_to_haves: string[];
    tech_stack: string[];
    database_schema: string;
    first_steps: string[];
}

export default function OpportunityCard({ verdict }: OpportunityCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [blueprint, setBlueprint] = useState<ExecutionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Color logic based on score
    const isBlueOcean = verdict.saturation_score < 40;
    const isSaturated = verdict.saturation_score > 75;

    const verdictColor = isBlueOcean ? "text-emerald-400" : isSaturated ? "text-red-400" : "text-yellow-400";
    const verdictBorder = isBlueOcean ? "border-emerald-500/30" : isSaturated ? "border-red-500/30" : "border-yellow-500/30";
    const verdictBg = isBlueOcean ? "bg-emerald-950/20" : isSaturated ? "bg-red-950/20" : "bg-yellow-950/20";

    const handleToggle = async () => {
        if (blueprint) {
            setIsOpen(!isOpen);
            return;
        }

        if (!isOpen) {
            // Fetch if not already fetched and opening
            setIsLoading(true);
            try {
                const res = await axios.post("http://127.0.0.1:8000/api/blueprint/generate", {
                    opportunity_context: verdict.blue_ocean_opportunity
                });
                setBlueprint(res.data);
                setIsOpen(true);
            } catch (e) {
                console.error("Failed to generate blueprint", e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <section className={`grid md:grid-cols-2 gap-8 items-center ${verdictBg} p-8 rounded-2xl border ${verdictBorder} shadow-2xl relative overflow-hidden transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                {isBlueOcean ? <TrendingUp className="w-64 h-64 text-emerald-500" /> : <AlertCircle className="w-64 h-64 text-red-500" />}
            </div>

            <div className="flex flex-col items-center justify-center relative z-10">
                <SaturationGauge score={verdict.saturation_score} />
                <h3 className={`mt-6 text-2xl font-bold ${verdictColor} tracking-tight`}>
                    {isSaturated ? "Highly Saturated Market" : isBlueOcean ? "Blue Ocean Opportunity" : "Moderate Competition"}
                </h3>
            </div>

            <div className="space-y-6 relative z-10">
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                        <AlertCircle className="w-4 h-4" /> The Verdict
                    </h4>
                    <p className="text-xl text-zinc-100 leading-relaxed font-light">
                        "{verdict.explanation}"
                    </p>
                </div>

                <div className="p-5 bg-zinc-950/50 rounded-xl border border-zinc-800 flex gap-4 items-start">
                    <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                    <div>
                        <h5 className="text-yellow-400 font-bold text-sm uppercase tracking-wide mb-1">
                            The Opportunity
                        </h5>
                        <p className="text-zinc-300 text-sm">
                            {verdict.blue_ocean_opportunity}
                        </p>
                    </div>
                </div>

                {/* Blueprint Toggle */}
                <div className="border-t border-zinc-800/50 pt-4">
                    <button
                        onClick={handleToggle}
                        className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-all group"
                    >
                        <span className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                            {isLoading ? (
                                <span className="w-4 h-4 rounded-full border-2 border-zinc-500 border-t-white animate-spin" />
                            ) : (
                                <Hammer className="w-4 h-4 text-emerald-500" />
                            )}
                            {isLoading ? "Drafting Technical Spec..." : "View Execution Blueprint"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 group-hover:text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Blueprint Content */}
                    {isOpen && blueprint && (
                        <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h6 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Must Haves (MVP)</h6>
                                    <ul className="space-y-1">
                                        {blueprint.core_features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                                <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h6 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nice to Havess (v2)</h6>
                                    <ul className="space-y-1">
                                        {blueprint.nice_to_haves.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                                                <Circle className="w-3 h-3 text-zinc-700 mt-0.5 shrink-0" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div className="space-y-2">
                                <h6 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    <Terminal className="w-3 h-3" /> Tech Stack
                                </h6>
                                <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-indigo-300 font-mono">
                                    {blueprint.tech_stack}
                                </div>
                            </div>

                            {/* Schema */}
                            <div className="space-y-2">
                                <h6 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    <FileJson className="w-3 h-3" /> Database Schema
                                </h6>
                                <div className="bg-black/50 border border-zinc-800 p-3 rounded-lg overflow-x-auto">
                                    <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed">
                                        {blueprint.database_schema.replace(/`/g, "")}
                                    </pre>
                                </div>
                            </div>

                            {/* First Steps */}
                            <div className="space-y-2">
                                <h6 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">First Steps</h6>
                                <div className="flex gap-2">
                                    {blueprint.first_steps.map((step, i) => (
                                        <div key={i} className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-center">
                                            <div className="text-lg font-bold text-zinc-700 mb-1">{i + 1}</div>
                                            <div className="text-[10px] text-zinc-300 leading-tight">{step}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
