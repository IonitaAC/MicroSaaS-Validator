"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

interface PivotChatProps {
    reportContext: any; // Full analysis report
    validationId: string;
}

const QUICK_PROMPTS = [
    "How do I differentiate?",
    "What is the MVP?",
    "Suggest a niche",
    "Critique my pricing"
];

export default function PivotChat({ reportContext, validationId }: PivotChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I've analyzed your idea. Ask me anything about the report, or use the quick prompts below to brainstorm a pivot strategy." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const history = messages.filter(m => m.role !== "system");

            const res = await axios.post("http://127.0.0.1:8000/api/validate/chat", {
                validation_id: validationId,
                message: text,
                history: history,
                report_context: reportContext
            });

            const botMsg: Message = { role: "assistant", content: res.data.response };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting to the mentor. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-500 hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-10"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                </button>
            )}

            {/* Chat Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-zinc-950 border-l border-zinc-800 shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Bot className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Pivot Coach</h3>
                            <p className="text-xs text-zinc-400">Context-Aware Analyst</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-zinc-800" : "bg-indigo-600"}`}>
                                {msg.role === "user" ? <User className="w-4 h-4 text-zinc-400" /> : <Sparkles className="w-4 h-4 text-white" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${msg.role === "user" ? "bg-zinc-800 text-zinc-200 rounded-tr-none" : "bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-tl-none"}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-sm rounded-tl-none italic">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length < 3 && !isLoading && (
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide pb-0">
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(prompt)}
                                className="whitespace-nowrap px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-indigo-500 hover:text-indigo-300 text-xs rounded-full text-zinc-400 transition-all"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 pr-12"
                            placeholder="Ask for advice..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:bg-zinc-800 transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
