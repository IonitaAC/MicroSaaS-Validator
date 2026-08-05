"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface TerminalLogProps {
    logs: string[];
}

export default function TerminalLog({ logs }: TerminalLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (logs.length === 0) return null;

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 bg-black rounded-lg border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <Terminal className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-mono text-zinc-400">Validator Agent Terminal</span>
            </div>
            <div
                ref={scrollRef}
                className="h-64 overflow-y-auto p-4 font-mono text-sm space-y-1 scrollbar-hide"
            >
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-zinc-600 select-none">$</span>
                        <span className={getLogColor(log)}>{log}</span>
                    </div>
                ))}
                <div className="animate-pulse text-zinc-500 ml-4">_</div>
            </div>
        </div>
    );
}

function getLogColor(log: string) {
    if (log.includes("[ERROR]")) return "text-red-400";
    if (log.includes("[SUCCESS]")) return "text-green-400";
    if (log.includes("[INFO]")) return "text-blue-400";
    if (log.includes("[WARN]")) return "text-yellow-400";
    return "text-zinc-300";
}
