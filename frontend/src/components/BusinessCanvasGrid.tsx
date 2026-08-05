"use client";

import { Box, Users, Activity, Hammer, Truck, Heart, MessageSquare, Wallet, CreditCard } from "lucide-react";

interface BusinessCanvas {
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

interface Props {
    canvas: BusinessCanvas;
}

export default function BusinessCanvasGrid({ canvas }: Props) {

    const renderCard = (title: string, items: string[], icon: any, className: string = "") => (
        <div className={`bg-zinc-900 border border-zinc-700 p-4 rounded-xl flex flex-col h-full ${className}`}>
            <h3 className="font-bold text-zinc-300 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider">
                {icon} {title}
            </h3>
            <ul className="space-y-2 flex-1">
                {items.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-400 leading-snug">
                        • {item}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Box className="w-6 h-6 text-indigo-500" />
                Business Model Canvas
            </h2>

            {/* Helper for specific grid layout */}
            {/* 
            Desktop: 5 columns. 
            KP (1, span 2 rows)
            KA (2, row 1)
            KR (2, row 2)
            VP (3, span 2 rows)
            CR (4, row 1)
            CH (4, row 2)
            CS (5, span 2 rows)  <- Segments
            
            Bottom:
            Cost (span 2.5)
            Revenue (span 2.5)
        */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-auto md:h-[600px]">

                {/* Col 1: Key Partners */}
                <div className="md:row-span-2">
                    {renderCard("Key Partners", canvas.key_partners, <Users className="w-4 h-4 text-pink-400" />)}
                </div>

                {/* Col 2: Activities & Resources */}
                <div className="flex flex-col gap-4 md:row-span-2">
                    <div className="flex-1">
                        {renderCard("Key Activities", canvas.key_activities, <Activity className="w-4 h-4 text-orange-400" />)}
                    </div>
                    <div className="flex-1">
                        {renderCard("Key Resources", canvas.key_resources, <Box className="w-4 h-4 text-amber-400" />)}
                    </div>
                </div>

                {/* Col 3: Value Prop */}
                <div className="md:row-span-2">
                    {renderCard("Value Propositions", canvas.value_propositions, <Heart className="w-4 h-4 text-red-500" />)}
                </div>

                {/* Col 4: Relationships & Channels */}
                <div className="flex flex-col gap-4 md:row-span-2">
                    <div className="flex-1">
                        {renderCard("Customer Relationships", canvas.customer_relationships, <Heart className="w-4 h-4 text-purple-400" />)}
                    </div>
                    <div className="flex-1">
                        {renderCard("Channels", canvas.channels, <Truck className="w-4 h-4 text-blue-400" />)}
                    </div>
                </div>

                {/* Col 5: Customer Segments */}
                <div className="md:row-span-2">
                    {renderCard("Customer Segments", canvas.customer_segments, <Users className="w-4 h-4 text-emerald-400" />)}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderCard("Cost Structure", canvas.cost_structure, <CreditCard className="w-4 h-4 text-zinc-500" />)}
                {renderCard("Revenue Streams", canvas.revenue_streams, <Wallet className="w-4 h-4 text-green-500" />)}
            </div>
        </div>
    );
}
