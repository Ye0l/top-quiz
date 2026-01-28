import React from 'react';

function ArrowGrid({ activeIndices, isInteractive = false, onCellClick, history = [], selectedCell = null }) {
    return (
        <div className="relative w-full shrink-0 bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl mx-auto" style={{ aspectRatio: '1/1' }}>

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

                    // History check
                    // Find index in history to determine color intensity (recent = darker/brighter)
                    const historyIndex = history.findIndex(h => h.r === row && h.c === col);
                    const isHistory = historyIndex !== -1;
                    const isLastHistory = isHistory && historyIndex === history.length - 1;

                    // Center line guide
                    const isCenterLine = row === 4 || row === 5 || col === 4 || col === 5;

                    let bgClass = 'bg-slate-800/20';
                    let borderClass = 'border-slate-800/30';
                    let effectsClass = 'scale-100';

                    if (isHit) {
                        bgClass = 'bg-red-500/60';
                        borderClass = 'border-transparent';
                        effectsClass = 'shadow-[0_0_12px_rgba(239,68,68,0.6)] z-10 scale-110';
                    } else if (isLastHistory) {
                        bgClass = 'bg-green-500';
                        borderClass = 'border-green-400';
                        effectsClass = 'shadow-[0_0_10px_rgba(34,197,94,0.8)] z-10 scale-105';
                    } else if (isHistory) {
                        bgClass = 'bg-green-500/30';
                        borderClass = 'border-green-500/40';
                    } else {
                        effectsClass = 'hover:bg-slate-700/50';
                    }

                    // Selected State (Mobile Confirm Pending)
                    if (selectedCell && selectedCell.r === row && selectedCell.c === col) {
                        borderClass = 'border-yellow-400';
                        effectsClass += ' ring-2 ring-yellow-400 z-20 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
                    }

                    return (
                        <div
                            key={i}
                            onClick={() => isInteractive && onCellClick && onCellClick(row, col)}
                            className={`relative rounded-sm transition-all duration-300 ease-out border-[0.5px] ${bgClass} ${borderClass} ${effectsClass}`}
                        >
                            {/* Center marker */}
                            {isCenterLine && !isHit && !isHistory && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>}
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

export default React.memo(ArrowGrid);
