"use client";

import { useState } from "react";
import axios from "axios";

// Types matching backend
export interface CompetitorAnalysis {
    name: string;
    url: string;
    pricing_model: string;
    value_prop: string;
}

export interface Verdict {
    saturation_score: number;
    explanation: string;
    blue_ocean_opportunity: string;
}

export interface AnalysisResult {
    validation_id: string; // UUID from backend
    competitor_analysis: CompetitorAnalysis[];
    voice_of_customer: { pain_points: string[] };
    verdict: Verdict;
}

export type WorkflowStatus = "idle" | "searching" | "scraping" | "analyzing" | "complete";

export function useValidator() {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<WorkflowStatus>("idle");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [currentIdea, setCurrentIdea] = useState<string>("");
    const [scrapedData, setScrapedData] = useState<any[]>([]);

    const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

    const handleValidate = async (idea: string) => {
        setStatus("searching");
        setCurrentIdea(idea);
        setLogs([]);
        setResult(null);
        setScrapedData([]);
        addLog(`[INFO] Starting validation for: "${idea}"`);

        try {
            // Step 1: Search
            addLog("[Scout] Initializing Scout Agent...");
            addLog(`[Scout] Searching for competitors...`);
            const searchRes = await axios.post("http://127.0.0.1:8000/api/validate/step1-search", { idea });
            const { queries, results } = searchRes.data;

            addLog(`[Scout] Generated queries: ${queries.join(", ")}`);
            addLog(`[Scout] Found ${results.length} targets. Handing off to Spy Agent...`);

            // Step 2: Scrape
            setStatus("scraping");
            const urlsToScrape = results.slice(0, 3).map((r: any) => r.link);

            let scrapedDataRaw: any[] = [];
            if (urlsToScrape.length > 0) {
                addLog(`[Spy] Scraping ${urlsToScrape.length} sites for deep analysis...`);
                const scrapeRes = await axios.post("http://127.0.0.1:8000/api/validate/step2-scrape", { urls: urlsToScrape });
                scrapedDataRaw = scrapeRes.data.scraped_data;
                setScrapedData(scrapedDataRaw);

                const totalChars = scrapedDataRaw.reduce((acc: number, curr: any) => acc + (curr.content?.length || 0), 0);
                addLog(`[Spy] Extracted ~${Math.round(totalChars / 4)} tokens of data. Handing off to Analyst...`);
            } else {
                addLog("[Spy] Skipping scrape (no URLs). Handing off to Analyst...");
                scrapedDataRaw = [];
                setScrapedData([]);
            }

            // Step 3: Analyze
            setStatus("analyzing");
            addLog("[Analyst] Analyzing market saturation & opportunity (GPT-4o Review)...");
            const analyzeRes = await axios.post("http://127.0.0.1:8000/api/validate/step3-analyze", {
                idea,
                scraped_data: scrapedDataRaw
            });

            const analysis = analyzeRes.data;
            setResult(analysis);
            addLog(`[SUCCESS] Analysis complete. Score: ${analysis.verdict.saturation_score}/100`);
            addLog(`[DB] Saved Validation Record ID: ${analysis.validation_id}`);
            setStatus("complete");

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.detail || error.message;
            addLog(`[ERROR] Validation failed: ${msg}`);
            setStatus("idle");
        }
    };

    return {
        logs,
        status,
        result,
        currentIdea,
        scrapedData,
        handleValidate,
        isProcessing: status !== "idle" && status !== "complete"
    };
}
