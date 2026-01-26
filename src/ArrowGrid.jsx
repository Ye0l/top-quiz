import React from 'react';

export default function ArrowGrid({ activeIndices, isInteractive = false, onCellClick }) {
    return (
        <div className="relative w-[600px] h-[600px] bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl">

            {/* 1. Inscribed Circle */}
            <div className="absolute inset-0 m-1 rounded-full border-2 border-slate-600 opacity-30 pointer-events-none">
            </div>

            {/* 2. 10x10 Grid Overlay */}
            <div className={`absolute inset-0 grid grid-cols-10 grid-rows-10 p-1 gap-0.5 ${isInteractive ? 'cursor-pointer' : ''}`}>
                {Array.from({ length: 100 }).map((_, i) => {
                    const row = Math.floor(i / 10);
                    const col = i % 10;

                    // Activation logic
                    const isRowActive = activeIndices.includes(row);
                    const isColActive = activeIndices.includes(col);
                    const isHit = isRowActive || isColActive;

                    // Center line guide
                    const isCenterLine = row === 4 || row === 5 || col === 4 || col === 5;

                    return (
                        <div
                            key={i}
                            onClick={() => isInteractive && onCellClick && onCellClick(row, col)}
                            className={`relative rounded-sm transition-all duration-300 ease-out ${isHit
                                ? 'bg-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.6)] z-10 scale-110 border-transparent'
                                : 'bg-slate-800/20 border-slate-800/30 border-[0.5px] scale-100 hover:bg-slate-700/50'}
                            `}
                        >
                            {/* Center marker */}
                            {isCenterLine && !isHit && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>}
                        </div>
                    );
                })}
            </div>

            {/* Center Crosshair (Guide) */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/30 pointer-events-none"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-blue-500/30 pointer-events-none"></div>

        </div>
    );
}
