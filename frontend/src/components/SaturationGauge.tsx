"use client";

interface SaturationGaugeProps {
    score: number; // 0-100
}

export default function SaturationGauge({ score }: SaturationGaugeProps) {
    // Determine color based on score
    let colorClass = "text-green-500";
    let label = "Blue Ocean Opportunity";

    if (score > 30 && score <= 70) {
        colorClass = "text-yellow-500";
        label = "Moderate Competition";
    } else if (score > 70) {
        colorClass = "text-red-500";
        label = "Highly Saturated";
    }

    // Calculate rotation for semi-circle (0 to 180 degrees)
    // score 0 -> -90deg (left)
    // score 50 -> 0deg (top) 
    // score 100 -> 90deg (right)
    const rotation = (score / 100) * 180 - 90;

    return (
        <div className="relative flex flex-col items-center justify-center w-64 h-32 overflow-hidden">
            {/* Background Arc */}
            <div className="absolute bottom-0 w-64 h-32 bg-zinc-800 rounded-t-full overflow-hidden">
                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-full h-full origin-bottom transition-transform duration-1000 ease-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                >
                    <div className={`absolute bottom-0 left-1/2 w-1 h-32 -ml-0.5 bg-current ${colorClass} origin-bottom rounded-full shadow-[0_0_15px_currentColor]`} />
                </div>
                {/* Center pivot */}
                <div className="absolute bottom-0 left-1/2 -ml-4 -mb-4 w-8 h-8 bg-zinc-950 rounded-full border-4 border-zinc-800 z-10" />
            </div>

            {/* Score Display (Overlay) */}
            <div className="absolute bottom-4 flex flex-col items-center">
                <span className={`text-4xl font-bold ${colorClass} animate-in zoom-in duration-700 delay-300`}>
                    {score}
                </span>
                <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                    Saturation Score
                </span>
            </div>

            {/* Label below gauge happens outside this component usually, but helpful here */}
        </div>
    );
}
