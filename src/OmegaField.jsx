import React, { useState } from 'react';

// Coordinates & Config
// Box 600x600. Center 300,300. Radius 300.

const MARKERS = [
    { label: 'A', color: 'bg-red-500', pos: 'top-[16.7%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { label: 'B', color: 'bg-yellow-500', pos: 'top-1/2 right-[16.7%] translate-x-1/2 -translate-y-1/2' },
    { label: 'C', color: 'bg-blue-500', pos: 'bottom-[16.7%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { label: 'D', color: 'bg-purple-500', pos: 'top-1/2 left-[16.7%] -translate-x-1/2 -translate-y-1/2' },

    { label: '1', color: 'bg-red-500', pos: 'top-[26.4%] right-[26.4%] translate-x-1/2 -translate-y-1/2' },
    { label: '2', color: 'bg-yellow-500', pos: 'bottom-[26.4%] right-[26.4%] translate-x-1/2 translate-y-1/2' },
    { label: '3', color: 'bg-blue-500', pos: 'bottom-[26.4%] left-[26.4%] -translate-x-1/2 translate-y-1/2' },
    { label: '4', color: 'bg-purple-500', pos: 'top-[26.4%] left-[26.4%] -translate-x-1/2 -translate-y-1/2' },
];

const SLOTS = [
    // Center slot is hidden from grid-based rendering because it's now a global overlay, 
    // BUT we need it for click interaction in Editor.
    // So we keep it but it renders differently.
    { id: 'center', pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'ne', pos: 'top-[32.3%] right-[32.3%] translate-x-1/2 -translate-y-1/2' },
    { id: 'se', pos: 'bottom-[32.3%] right-[32.3%] translate-x-1/2 translate-y-1/2' },
    { id: 'sw', pos: 'bottom-[32.3%] left-[32.3%] -translate-x-1/2 translate-y-1/2' },
    { id: 'nw', pos: 'top-[32.3%] left-[32.3%] -translate-x-1/2 -translate-y-1/2' },
];

const ANSWER_SPOTS = [
    { id: 'c_n', label: 'C-N', pos: 'top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'c_e', label: 'C-E', pos: 'top-1/2 right-[45%] translate-x-1/2 -translate-y-1/2' },
    { id: 'c_s', label: 'C-S', pos: 'bottom-[45%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'c_w', label: 'C-W', pos: 'top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2' },

    { id: 'm_in_n', label: 'In-N', pos: 'top-[24%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'm_in_e', label: 'In-E', pos: 'top-1/2 right-[24%] translate-x-1/2 -translate-y-1/2' },
    { id: 'm_in_s', label: 'In-S', pos: 'bottom-[24%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'm_in_w', label: 'In-W', pos: 'top-1/2 left-[24%] -translate-x-1/2 -translate-y-1/2' },

    { id: 'm_out_n', label: 'Out-N', pos: 'top-[9%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'm_out_e', label: 'Out-E', pos: 'top-1/2 right-[9%] translate-x-1/2 -translate-y-1/2' },
    { id: 'm_out_s', label: 'Out-S', pos: 'bottom-[9%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'm_out_w', label: 'Out-W', pos: 'top-1/2 left-[9%] -translate-x-1/2 -translate-y-1/2' },
];

// SVG Icons
const Icons = {
    'F-Staff': (
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="none" stroke="#d8b4fe" strokeWidth="2" />
            <path d="M12 6v12M8 10l4-4 4 4" stroke="#d8b4fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="1.5" fill="#d8b4fe" />
        </svg>
    ),
    'F-Legs': (
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]">
            <path d="M7 4h10v2H7zM7 8h10v2H7z" fill="#d8b4fe" opacity="0.5" />
            <path d="M9 12l-2 8 5-2 5 2-2-8H9z" stroke="#d8b4fe" strokeWidth="2" fill="none" />
        </svg>
    ),
    'M-Sword': (
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]">
            <path d="M11 2h2v14h-2z" fill="#93c5fd" />
            <path d="M8 16h8v2H8z" fill="#60a5fa" />
            <path d="M12 22l-2-4h4z" fill="#93c5fd" />
        </svg>
    ),
    'M-Shield': (
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" stroke="#93c5fd" strokeWidth="2" fill="none" />
            <path d="M12 4v16M5 9h14" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.5" />
        </svg>
    )
};

export default function OmegaField({ placedUnits = [], onSlotClick, showAnswerSpots = false, onAnswerSpotClick, selectedSpot = null, correctSpots = [] }) {

    // Find Center Unit Type
    const centerUnit = placedUnits.find(u => u.position === 'center');
    const centerType = centerUnit ? centerUnit.type : 'Vertical'; // Default Vertical visual if missing

    return (
        <div className="relative w-[600px] h-[600px] m-8">

            {/* 0. Map-wide Safe Zone Overlay (Controlled by Center Unit) */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-50 overflow-hidden rounded-full">
                {/* 
                    Vertical Safe: Hourglass shape (Wide North/South)
                    Horizontal Safe: Bowtie shape (Wide East/West)
                    We can use conical gradients or SVG paths.
                */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {centerType === 'Vertical' ? (
                        /* Vertical Safe (Gold North/South) - Danger is E/W */
                        <path d="M50 50 L0 0 H100 L50 50 L100 100 H0 L50 50Z" fill="url(#gradSafe)" pointerEvents="none" />
                        // Wait, North/South safe means Triangle Up and Triangle Down.
                        // Path above: 50,50 -> 0,0 (TL) -> 100,0 (TR) -> 50,50 ... This is top triangle (North).
                        // Then 50,50 -> 100,100 (BR) -> 0,100 (BL) -> 50,50 ... This is bottom triangle (South).
                        // Correct.
                    ) : (
                        /* Horizontal Safe (Gold East/West) - Danger is N/S */
                        <path d="M50 50 L100 0 V100 L50 50 L0 100 V0 L50 50Z" fill="url(#gradSafe)" pointerEvents="none" />
                        // 50,50 -> 100,0 (TR) -> 100,100 (BR) -> 50,50 ... Right triangle (East)
                        // 50,50 -> 0,100 (BL) -> 0,0 (TL) -> 50,50 ... Left triangle (West)
                        // Correct.
                    )}
                    <defs>
                        <radialGradient id="gradSafe" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* 1. Field Boundary Circle */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-600 bg-transparent shadow-2xl z-0 pointer-events-none"></div>

            {/* 2. Markers */}
            {MARKERS.map((m) => (
                <div key={m.label} className={`absolute w-12 h-12 rounded-full ${m.color} flex items-center justify-center text-black font-bold text-2xl shadow-lg border-2 border-white/20 z-10 ${m.pos}`}>
                    {m.label}
                </div>
            ))}

            {/* 3. Answer Spots (Clickable Zones) */}
            {showAnswerSpots && ANSWER_SPOTS.map((s) => {
                let bgStyle = 'bg-white/10 border-white/30 hover:bg-white/30 hover:border-white';
                if (selectedSpot === s.id) bgStyle = 'bg-blue-500 border-blue-300';

                const isCorrect = correctSpots && correctSpots.includes(s.id);

                return (
                    <div
                        key={s.id}
                        onClick={() => onAnswerSpotClick && onAnswerSpotClick(s.id)}
                        className={`absolute w-14 h-14 rounded-full border-2 cursor-pointer transition-all z-20 flex items-center justify-center
                            ${s.pos} ${bgStyle}`}
                    >
                        {selectedSpot === s.id && <span className="text-white font-bold text-xs">SELF</span>}
                        {isCorrect && <span className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></span>}
                    </div>
                );
            })}

            {/* 4. Placement Slots & Units */}
            {SLOTS.map((slot) => {
                const unit = placedUnits.find(u => u.position === slot.id);
                const isPassive = showAnswerSpots;
                const isCenter = slot.id === 'center';

                // If center, we only show the clickable area in Editor mode, 
                // but the VISUAL is handled by the global overlay (Layer 0).
                // In Editor mode, clicking center toggles V/H.
                // We should show a label or icon for feedback in Editor maybe?
                // The overlay changes instantly so that's good feedback.
                // We'll keep the slot transparent but clickable for center.

                if (isCenter) {
                    return (
                        <div
                            key={slot.id}
                            onClick={() => !isPassive && onSlotClick && onSlotClick(slot.id)}
                            className={`absolute w-32 h-32 flex items-center justify-center z-10
                                ${slot.pos} 
                                ${!isPassive ? 'cursor-pointer hover:bg-white/10 rounded-full' : ''}
                                `}
                        >
                            {/* Optional: Small Label to verify type if overlay is subtle? */}
                            {!isPassive && <span className="text-white/50 text-xs font-mono">{unit ? unit.type : 'Clk'}</span>}
                        </div>
                    );
                }

                // Normal Slots (NE/SE/SW/NW)
                return (
                    <div
                        key={slot.id}
                        onClick={() => !isPassive && onSlotClick && onSlotClick(slot.id)}
                        className={`absolute w-24 h-24 rounded-lg flex items-center justify-center transition-colors z-10
                            ${slot.pos} 
                            ${!unit ? 'border-2 border-dashed border-slate-600/50' : ''}
                            ${!isPassive && !unit ? 'cursor-pointer hover:border-white/50' : ''}
                            ${isPassive && !unit ? 'opacity-0' : ''} 
                            `}
                    >
                        {unit && Icons[unit.type] ? (
                            Icons[unit.type]
                        ) : (
                            !isPassive && <span className="text-slate-700 text-xs">+</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
