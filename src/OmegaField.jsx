import React, { useState } from 'react';

// Import Assets
import staffImg from '/assets/staff.png';
import knifeImg from '/assets/knife.png';
import swordImg from '/assets/sword.png';
import shieldImg from '/assets/shield.png';
import omegaFinalImg from '/assets/omega-final.png';
import omegaMImg from '/assets/omega-m.png';
import omegaFImg from '/assets/omega-f.png';

// Coordinates & Config
// Box 600x600. Center 300,300. Radius 300.

const MARKERS = [
    { label: 'A', color: 'bg-red-500', pos: 'top-[15.6%] left-1/2 -translate-x-1/2 -translate-y-1/2', x: 50, y: 15.6 },
    { label: 'B', color: 'bg-yellow-500', pos: 'top-1/2 right-[15.6%] translate-x-1/2 -translate-y-1/2', x: 84.4, y: 50 },
    { label: 'C', color: 'bg-blue-500', pos: 'bottom-[15.6%] left-1/2 -translate-x-1/2 translate-y-1/2', x: 50, y: 84.4 },
    { label: 'D', color: 'bg-purple-500', pos: 'top-1/2 left-[15.6%] -translate-x-1/2 -translate-y-1/2', x: 15.6, y: 50 },

    { label: '1', color: 'bg-red-500', pos: 'top-[25.7%] right-[25.7%] translate-x-1/2 -translate-y-1/2', x: 74.3, y: 25.7 },
    { label: '2', color: 'bg-yellow-500', pos: 'bottom-[25.7%] right-[25.7%] translate-x-1/2 translate-y-1/2', x: 74.3, y: 74.3 },
    { label: '3', color: 'bg-blue-500', pos: 'bottom-[25.7%] left-[25.7%] -translate-x-1/2 translate-y-1/2', x: 25.7, y: 74.3 },
    { label: '4', color: 'bg-purple-500', pos: 'top-[25.7%] left-[25.7%] -translate-x-1/2 -translate-y-1/2', x: 25.7, y: 25.7 },
];

const SLOTS = [
    { id: 'center', pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', x: 50, y: 50 },
    { id: 'ne', pos: 'top-[31%] right-[31%] translate-x-1/2 -translate-y-1/2', x: 69, y: 31 },
    { id: 'se', pos: 'bottom-[31%] right-[31%] translate-x-1/2 translate-y-1/2', x: 69, y: 69 },
    { id: 'sw', pos: 'bottom-[31%] left-[31%] -translate-x-1/2 translate-y-1/2', x: 31, y: 69 },
    { id: 'nw', pos: 'top-[31%] left-[31%] -translate-x-1/2 -translate-y-1/2', x: 31, y: 31 },
];

const ANSWER_SPOTS = [
    { id: 'c_n', label: 'C-N', pos: 'top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'c_e', label: 'C-E', pos: 'top-1/2 right-[43%] translate-x-1/2 -translate-y-1/2' },
    { id: 'c_s', label: 'C-S', pos: 'bottom-[43%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'c_w', label: 'C-W', pos: 'top-1/2 left-[43%] -translate-x-1/2 -translate-y-1/2' },

    { id: 'm_in_n', label: 'In-N', pos: 'top-[23.5%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'm_in_e', label: 'In-E', pos: 'top-1/2 right-[23.5%] translate-x-1/2 -translate-y-1/2' },
    { id: 'm_in_s', label: 'In-S', pos: 'bottom-[23.5%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'm_in_w', label: 'In-W', pos: 'top-1/2 left-[23.5%] -translate-x-1/2 -translate-y-1/2' },

    { id: 'm_out_n', label: 'Out-N', pos: 'top-[8%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { id: 'm_out_e', label: 'Out-E', pos: 'top-1/2 right-[8%] translate-x-1/2 -translate-y-1/2' },
    { id: 'm_out_s', label: 'Out-S', pos: 'bottom-[8%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { id: 'm_out_w', label: 'Out-W', pos: 'top-1/2 left-[8%] -translate-x-1/2 -translate-y-1/2' },
];

// Weapon overlays (using PNG assets)
const WeaponIcons = {
    'F-Staff': (
        <img src={staffImg} alt="Staff" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    ),
    'F-Legs': (
        <img src={knifeImg} alt="Legs" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    ),
    'M-Sword': (
        <img src={swordImg} alt="Sword" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    ),
    'M-Shield': (
        <img src={shieldImg} alt="Shield" className="w-4/5 object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} />
    )
};

function OmegaField({ placedUnits = [], onSlotClick, showAnswerSpots = false, onAnswerSpotClick, selectedSpot = null, previousAnswerSpot = null, correctSpots = [], showAttacks = false, isTransitioning = false, isMobile = false, isCenterRevealed = true }) {

    // Find Center Unit Type
    const centerUnit = placedUnits.find(u => u.position === 'center');
    const centerType = centerUnit ? centerUnit.type : 'Vertical'; // Default Vertical visual if missing

    // Helper to get coords by slot id
    const getSlotCoords = (id) => {
        const s = SLOTS.find(slot => slot.id === id);
        return s ? { x: s.x, y: s.y } : { x: 50, y: 50 };
    };

    return (
        <div className="relative w-full shrink-0 mx-auto my-4 transition-all" style={{ aspectRatio: '1/1' }}>
            <style>{`
                @keyframes enterFade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>

            {/* 0.5 Attack Range Layer (Includes Center Boss) */}
            {/* 0.5 Attack Range Layer (Includes Center Boss) */}
            {/* Always render but control opacity for transitions */}
            <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 rounded-full overflow-hidden ${showAttacks ? 'opacity-100' : 'opacity-0'}`}>
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    {placedUnits.map((unit, idx) => {
                        // Don't show attacks for ghost units (P1 in P2)
                        // But wait, the user said "2회차엔 2회차 장판만 유효".
                        // If P1 unit is present as ghost, its attack is gone.
                        // But wait, the user said "2회차엔 2회차 장판만 유효".
                        // If P1 unit is present as ghost, its attack is gone.
                        if (unit.isGhost) return null;

                        // Sequential Animation Styles
                        const animStyle = {
                            animationDelay: `${idx * 200}ms`,
                            animationFillMode: 'forwards',
                            transformOrigin: 'center',
                            opacity: 0 // Start invisible, animate in
                        };
                        const animClass = "animate-in fade-in zoom-in duration-500 ease-out fill-mode-forwards"; // using Tailwind animate-in primitives if possible, else standard CSS transitiion might need 'opacity' handling in css.

                        // Since standard Tailwind `animate-in` works on mount, and these elements mount when `showAttacks` is true, it should work.
                        // We explicitly set `opacity: 0` in style to ensure starts hidden if animation takes time.
                        // Actually `animate-in` usually handles start state. Let's rely on standard class + style override.
                        // However, we need to ensure opacity ends at 1. `fill-mode-forwards` isn't a tailwind class.
                        // We'll wrap in a group or apply directly.
                        // Let's use standard style keyframes if tailwind not sufficient? 
                        // Actually, let's just use `style={{ ...animStyle, animation: `fadeInScale 0.5s ease-out ${idx*150}ms forwards` }}` and define keyframes in global css?
                        // Or simpler: Just Render them but with a transition class? No, they are conditionally rendered.
                        // When showAttacks becomes true, they mount.
                        // Sequential Animation Styles (Opacity Only)
                        // Note: Using transform in animation overrides SVG transform attribute on <g> elements, breaking positioning.
                        // So we strictly animate Opacity. The user accepted "Just appearing transition".

                        const transitionStyle = {
                            animation: `enterFade 0.5s ease-out ${idx * 150}ms both`
                        };

                        const { x, y } = getSlotCoords(unit.position);
                        const unitVal = 6.25; // 1 Interval = 50 / 8 = 6.25.

                        const radiusSword = 25; // M-Sword
                        const beamWidth = 4 * unitVal; // 25

                        // Attack styling
                        const attackFill_F = "rgba(168, 85, 247, .5)"; // Purple
                        const attackFill_M = "rgba(239, 68, 68, .5)"; // Red
                        const centerAttackFill = "rgba(59, 130, 246, .5)"; // Blue
                        const attackStroke = "none";

                        if (unit.position === 'center') {
                            const isVertical = unit.type === 'Vertical';
                            const r = 200; // Large enough to cover map
                            const toRad = deg => deg * Math.PI / 180;
                            const getPt = deg => `${50 + r * Math.cos(toRad(deg))} ${50 + r * Math.sin(toRad(deg))}`;

                            if (isVertical) {
                                // North/South 120deg (N: -90, range -150 to -30. S: 90, range 30 to 150)
                                return (
                                    <path key={idx}
                                        d={`M50 50 L${getPt(-60)} L${getPt(60)} Z M50 50 L${getPt(120)} L${getPt(240)} Z`}
                                        fill={centerAttackFill} stroke={attackStroke}
                                        style={transitionStyle}
                                    />
                                );
                            } else {
                                // East/West 120deg (E: 0, range -60 to 60. W: 180, range 120 to 240)
                                return (
                                    <path key={idx}
                                        d={`M50 50 L${getPt(-150)} L${getPt(-30)} Z M50 50 L${getPt(30)} L${getPt(150)} Z`}
                                        fill={centerAttackFill} stroke={attackStroke}
                                        style={transitionStyle}
                                    />
                                );
                            }
                        }

                        if (unit.type === 'M-Sword') {
                            return (
                                <circle key={idx} cx={x} cy={y} r={radiusSword} fill={attackFill_M} stroke={attackStroke} style={transitionStyle} />
                            );
                        }
                        if (unit.type === 'M-Shield') {
                            // Donut
                            return (
                                <path key={idx}
                                    d={`M-100 -100 H300 V300 H-100 Z M ${x} ${y} m -${radiusSword},0 a ${radiusSword},${radiusSword} 0 1,0 ${radiusSword * 2},0 a ${radiusSword},${radiusSword} 0 1,0 -${radiusSword * 2},0`}
                                    fill={attackFill_M}
                                    fillRule="evenodd"
                                    stroke={attackStroke}
                                    style={transitionStyle}
                                />
                            );
                        }
                        if (unit.type === 'F-Staff') {
                            const angle = Math.atan2(50 - y, 50 - x) * 180 / Math.PI;
                            return (
                                <g key={idx} transform={`translate(${x}, ${y}) rotate(${angle})`} style={transitionStyle}>
                                    <rect x={-100} y={-beamWidth / 2} width={300} height={beamWidth} fill={attackFill_F} stroke={attackStroke} />
                                    <rect x={-beamWidth / 2} y={-100} width={beamWidth} height={200} fill={attackFill_F} stroke={attackStroke} />
                                </g>
                            );
                        }
                        if (unit.type === 'F-Legs') {
                            const angle = Math.atan2(50 - y, 50 - x) * 180 / Math.PI;
                            return (
                                <g key={idx} transform={`translate(${x}, ${y}) rotate(${angle})`} style={transitionStyle}>
                                    <path
                                        d={`M-200 -200 H400 V400 H-200 Z M-150 ${-beamWidth / 2} v${beamWidth} h400 v-${beamWidth} z`}
                                        fill={attackFill_F}
                                        fillRule="evenodd"
                                        stroke={attackStroke}
                                    />
                                </g>
                            );
                        }
                        return null;
                    })}
                </svg>
            </div>

            {/* 1. Field Boundary & concentric guides (8 rings) */}
            {
                Array.from({ length: 8 }).map((_, i) => (
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
                ))
            }

            {/* 2. Markers */}
            {
                MARKERS.map((m) => (
                    <div key={m.label} className={`absolute w-[7.5%] aspect-square rounded-full ${m.color} flex items-center justify-center text-black font-bold text-sm md:text-lg shadow-lg border-2 border-white/20 z-10 ${m.pos}`}>
                        <span className="-translate-y-[7%]">{m.label}</span>
                    </div>
                ))
            }

            {/* 3. Answer Spots (Clickable Zones) */}
            {
                showAnswerSpots && ANSWER_SPOTS.map((s) => {
                    // Optimized for Light/Dark mode visibility
                    // Light Mode: Use stronger blue/slate mix to stand out against gray center.
                    // Dark Mode: Keep white/transparent style.
                    let bgStyle = 'bg-blue-600/30 border-blue-600/60 hover:bg-blue-600/50 hover:border-blue-800 dark:bg-white/10 dark:border-white/30 dark:hover:bg-white/30 dark:hover:border-white';
                    
                    if (selectedSpot === s.id) bgStyle = 'bg-blue-500 border-blue-400 dark:border-blue-300';
                    if (previousAnswerSpot === s.id) bgStyle = 'bg-yellow-500/40 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-110 ring-2 ring-yellow-500/50';

                    const isCorrect = correctSpots && correctSpots.includes(s.id);
                    const isP1 = previousAnswerSpot === s.id;

                    return (
                        <div
                            key={s.id}
                            onClick={() => onAnswerSpotClick && onAnswerSpotClick(s.id)}
                            className={`absolute w-[7.5%] aspect-square rounded-full border-2 cursor-pointer transition-all z-20 flex items-center justify-center
                            after:absolute after:-inset-6 after:content-[''] after:rounded-full
                            ${s.pos} ${bgStyle}`}
                        >
                            {selectedSpot === s.id && <span className="text-white font-bold text-xs">SELF</span>}
                            {isP1 && !selectedSpot && <span className="text-yellow-200 font-bold text-sm drop-shadow-md">1st</span>}
                            {isCorrect && <span className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></span>}
                        </div>
                    );
                })
            }

            {/* 4. Placement Slots & Units */}
            {
                SLOTS.map((slot) => {
                    const unit = placedUnits.find(u => u.position === slot.id);
                    const isPassive = showAnswerSpots;
                    const isCenter = slot.id === 'center';

                    if (isCenter) {
                        const isVert = unit?.type === 'Vertical';
                        return (
                            <div
                                key={slot.id}
                                onClick={() => !isPassive && onSlotClick && onSlotClick(slot.id)}
                                className={`absolute w-[18.75%] aspect-square flex items-center justify-center z-15
                                    ${slot.pos} 
                                    ${!isPassive ? 'cursor-pointer after:absolute after:-inset-4 after:content-[\'\']' : ''}
                                    `}
                            >
                                {/* Central Boss Image */}
                                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/50 bg-black/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                    <img src={omegaFinalImg} alt="Omega Final" className="w-full h-full object-cover" />

                                    {/* Center Attack Indicator (Monitor Projection) */}
                                    {/* Vertical Type -> Vertical Bar (Blue-Black-Blue) */}
                                    {/* Horizontal Type -> Horizontal Bar */}
                                    {unit && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-slate-900 border-blue-400 shadow-[0_0_20px_#3b82f6] opacity-90
                                        ${isCenterRevealed
                                                    ? (isVert ? 'w-[28%] h-full border-x-[6px] border-y-0 rounded-none' : 'w-full h-[28%] border-y-[6px] border-x-0 rounded-none')
                                                    : 'w-[12%] h-[12%] border-2 rounded-full animate-pulse bg-blue-500/50'
                                                }
                                    `}></div>
                                        </div>
                                    )}
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
                            baseImg = omegaMImg;
                            borderColor = 'border-blue-400';
                            overlayColor = 'bg-blue-500/20';
                        }
                        else if (unit.type.startsWith('F-')) {
                            baseImg = omegaFImg;
                            borderColor = 'border-purple-400';
                            overlayColor = 'bg-purple-500/20';
                        }
                    }

                    return (
                        <div
                            key={slot.id}
                            onClick={() => !isPassive && onSlotClick && onSlotClick(slot.id)}
                            className={`absolute w-[12.5%] aspect-square rounded-full flex items-center justify-center transition-all z-10
                                ${slot.pos} 
                                ${!unit ? 'border-2 border-dashed border-slate-600/50' : ''}
                                ${!isPassive && !unit ? 'cursor-pointer hover:border-white/50 after:absolute after:-inset-4 after:content-[\'\']' : ''}
                                ${isPassive && !unit ? 'opacity-0' : ''} 
                                ${unit?.isGhost ? 'opacity-80' : ''}
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
                })
            }
        </div >
    );
}

export default React.memo(OmegaField);
