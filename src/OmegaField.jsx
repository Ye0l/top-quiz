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
    { id: 'c_n', label: 'C-N', pos: 'top-[45%] left-1/2 -translate-x-1/2 -translate-y-2/3' },
    { id: 'c_e', label: 'C-E', pos: 'top-1/2 right-[45%] translate-x-2/3 -translate-y-1/2' },
    { id: 'c_s', label: 'C-S', pos: 'bottom-[45%] left-1/2 -translate-x-1/2 translate-y-2/3' },
    { id: 'c_w', label: 'C-W', pos: 'top-1/2 left-[45%] -translate-x-2/3 -translate-y-1/2' },

    { id: 'm_in_n', label: 'In-N', pos: 'top-[24%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'm_in_e', label: 'In-E', pos: 'top-1/2 right-[24%] translate-x-1/2 -translate-y-1/2' },
    { id: 'm_in_s', label: 'In-S', pos: 'bottom-[24%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'm_in_w', label: 'In-W', pos: 'top-1/2 left-[24%] -translate-x-1/2 -translate-y-1/2' },

    { id: 'm_out_n', label: 'Out-N', pos: 'top-[9%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'm_out_e', label: 'Out-E', pos: 'top-1/2 right-[9%] translate-x-1/2 -translate-y-1/2' },
    { id: 'm_out_s', label: 'Out-S', pos: 'bottom-[9%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'm_out_w', label: 'Out-W', pos: 'top-1/2 left-[9%] -translate-x-1/2 -translate-y-1/2' },
];

// Weapon overlays (using PNG assets)
const WeaponIcons = {
    'F-Staff': (
        <img src="/assets/staff.png" alt="Staff" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    ),
    'F-Legs': (
        <img src="/assets/knife.png" alt="Legs" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    ),
    'M-Sword': (
        <img src="/assets/sword.png" alt="Sword" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    ),
    'M-Shield': (
        <img src="/assets/shield.png" alt="Shield" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    )
};

export default function OmegaField({ placedUnits = [], onSlotClick, showAnswerSpots = false, onAnswerSpotClick, selectedSpot = null, previousAnswerSpot = null, correctSpots = [] }) {

    // Find Center Unit Type
    const centerUnit = placedUnits.find(u => u.position === 'center');
    const centerType = centerUnit ? centerUnit.type : 'Vertical'; // Default Vertical visual if missing

    return (
        <div className="relative w-full max-w-[440px] shrink-0 mx-auto my-4 transition-all" style={{ aspectRatio: '1/1' }}>

            {/* 0. Map-wide Safe Zone Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-50 overflow-hidden rounded-full">
                <svg viewBox="0 0 100 100" className="w-full h-full block">
                    {centerType === 'Vertical' ? (
                        <path d="M50 50 L100 -50 V150 L50 50 L0 150 V-50 L50 50Z" fill="url(#gradSafe)" pointerEvents="none" />
                    ) : (
                        <path d="M50 50 L-50 0 H150 L50 50 L150 100 H-50 L50 50Z" fill="url(#gradSafe)" pointerEvents="none" />
                    )}
                    <defs>
                        <radialGradient id="gradSafe" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#2493fbff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#2493fbff" stopOpacity="0.2" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* 1. Field Boundary & concentric guides (8 rings) */}
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className={`absolute rounded-full border border-slate-700/50 z-0 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        ${i === 0 ? 'border-4 border-slate-600 w-full h-full shadow-2xl' : ''}
                    `}
                    style={{
                        width: `${100 - (i * (100 / 8))}%`,
                        height: `${100 - (i * (100 / 8))}%`
                    }}
                ></div>
            ))}

            {/* 2. Markers */}
            {MARKERS.map((m) => (
                <div key={m.label} className={`absolute w-[12%] aspect-square rounded-full ${m.color} flex items-center justify-center text-black font-bold text-lg md:text-2xl shadow-lg border-2 border-white/20 z-10 ${m.pos}`}>
                    {m.label}
                </div>
            ))}

            {/* 3. Answer Spots (Clickable Zones) */}
            {showAnswerSpots && ANSWER_SPOTS.map((s) => {
                let bgStyle = 'bg-white/10 border-white/30 hover:bg-white/30 hover:border-white';
                if (selectedSpot === s.id) bgStyle = 'bg-blue-500 border-blue-300';
                if (previousAnswerSpot === s.id) bgStyle = 'bg-slate-700/80 border-slate-500 shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-110'; // Highlight P1 Answer

                const isCorrect = correctSpots && correctSpots.includes(s.id);
                const isP1 = previousAnswerSpot === s.id;

                return (
                    <div
                        key={s.id}
                        onClick={() => onAnswerSpotClick && onAnswerSpotClick(s.id)}
                        className={`absolute w-[14%] aspect-square rounded-full border-2 cursor-pointer transition-all z-20 flex items-center justify-center
                            ${s.pos} ${bgStyle}`}
                    >
                        {selectedSpot === s.id && <span className="text-white font-bold text-xs">SELF</span>}
                        {isP1 && !selectedSpot && <span className="text-slate-300 font-bold text-xs opacity-70">1st</span>}
                        {isCorrect && <span className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></span>}
                    </div>
                );
            })}

            {/* 4. Placement Slots & Units */}
            {SLOTS.map((slot) => {
                const unit = placedUnits.find(u => u.position === slot.id);
                const isPassive = showAnswerSpots;
                const isCenter = slot.id === 'center';

                if (isCenter) {
                    return (
                        <div
                            key={slot.id}
                            onClick={() => !isPassive && onSlotClick && onSlotClick(slot.id)}
                            className={`absolute w-[25%] aspect-square flex items-center justify-center z-15
                                    ${slot.pos} 
                                    ${!isPassive ? 'cursor-pointer' : ''}
                                    `}
                        >
                            {/* Central Boss Image */}
                            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/50 bg-black/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                <img src="/assets/omega-final.png" alt="Omega Final" className="w-full h-full object-cover" />
                                {/* Optional overlay for Type indication if image doesn't differ */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="bg-black/60 text-white text-[10px] px-1 rounded font-mono border border-white/20">
                                        {unit ? (unit.type === 'Vertical' ? 'V' : 'H') : 'V'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                }

                // Normal Slots (NE/SE/SW/NW)

                // Determine base image (M or F) and Overlay
                let baseImg = null;
                let borderColor = 'border-white/40';
                let overlayColor = 'bg-transparent';

                if (unit) {
                    if (unit.type.startsWith('M-')) {
                        baseImg = '/assets/omega-m.png';
                        borderColor = 'border-blue-400';
                        overlayColor = 'bg-blue-500/20';
                    }
                    else if (unit.type.startsWith('F-')) {
                        baseImg = '/assets/omega-f.png';
                        borderColor = 'border-purple-400';
                        overlayColor = 'bg-purple-500/20';
                    }
                }

                return (
                    <div
                        key={slot.id}
                        onClick={() => !isPassive && onSlotClick && onSlotClick(slot.id)}
                        className={`absolute w-[16%] aspect-square rounded-full flex items-center justify-center transition-all z-10
                                ${slot.pos} 
                                ${!unit ? 'border-2 border-dashed border-slate-600/50' : ''}
                                ${!isPassive && !unit ? 'cursor-pointer hover:border-white/50' : ''}
                                ${isPassive && !unit ? 'opacity-0' : ''} 
                                ${unit?.isGhost ? 'opacity-40 grayscale' : ''}
                                `}
                    >
                        {unit && baseImg ? (
                            <div className="relative w-full h-full">
                                {/* Base Image Container */}
                                <div className={`w-full h-full rounded-full overflow-hidden bg-white/10 border-2 ${borderColor} shadow-lg relative`}>
                                    <img src={baseImg} alt={unit.type} className="w-full h-full object-cover" />
                                    {/* Color Overlay */}
                                    <div className={`absolute inset-0 ${overlayColor} mix-blend-overlay`}></div>
                                </div>

                                {/* Weapon Icon Overlay (Right Side) */}
                                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-8 h-8 bg-slate-900/80 rounded-full border border-white/30 flex items-center justify-center shadow-md p-1">
                                    {WeaponIcons[unit.type]}
                                </div>
                            </div>
                        ) : (
                            !isPassive && <span className="text-slate-700 text-xs">+</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
