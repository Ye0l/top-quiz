import React, { useState } from 'react';

// Radius Calculations
// Box is 100% x 100%. Center is 50%, 50%. Radius R is 50%.
// Markers: 2/3 of Radius from Center = 0.666 * 50% = 33.33% distance.
// Slots: 1/2 of Radius from Center = 0.5 * 50% = 25% distance.

// Cardinals (A,B,C,D): On axes. simple offset.
// Top: 50% - 33.3% = 16.7%
// Marker A: top: 16.7%

// Intercardinals (1,2,3,4): On diagonals (45 deg).
// Distance 33.33%. X/Y offset = 33.33 * cos(45) = 33.33 * 0.7071 = 23.57%
// Top-Right (1): Top (50 - 23.57) = 26.43%, Right (50 - 23.57) = 26.43%

// Slots (NE, SE, SW, NW): On diagonals.
// Distance 25%. X/Y offset = 25 * 0.7071 = 17.68%
// Top-Right (NE): Top (50 - 17.68) = 32.32%, Right 32.32%

const MARKERS = [
    // Cardinals (A, B, C, D) at 2/3 Radius
    { label: 'A', color: 'bg-red-500', pos: 'top-[16.7%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { label: 'B', color: 'bg-yellow-500', pos: 'top-1/2 right-[16.7%] translate-x-1/2 -translate-y-1/2' },
    { label: 'C', color: 'bg-blue-500', pos: 'bottom-[16.7%] left-1/2 -translate-x-1/2 translate-y-1/2' },
    { label: 'D', color: 'bg-purple-500', pos: 'top-1/2 left-[16.7%] -translate-x-1/2 -translate-y-1/2' },

    // Intercardinals (1, 2, 3, 4) at 2/3 Radius
    { label: '1', color: 'bg-red-500', pos: 'top-[26.4%] right-[26.4%] translate-x-1/2 -translate-y-1/2' },
    { label: '2', color: 'bg-yellow-500', pos: 'bottom-[26.4%] right-[26.4%] translate-x-1/2 translate-y-1/2' },
    { label: '3', color: 'bg-blue-500', pos: 'bottom-[26.4%] left-[26.4%] -translate-x-1/2 translate-y-1/2' },
    { label: '4', color: 'bg-purple-500', pos: 'top-[26.4%] left-[26.4%] -translate-x-1/2 -translate-y-1/2' },
];

const SLOTS = [
    // Center
    { id: 'center', pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    // Diagonals at 1/2 Radius
    { id: 'ne', pos: 'top-[32.3%] right-[32.3%] translate-x-1/2 -translate-y-1/2' },
    { id: 'se', pos: 'bottom-[32.3%] right-[32.3%] translate-x-1/2 translate-y-1/2' },
    { id: 'sw', pos: 'bottom-[32.3%] left-[32.3%] -translate-x-1/2 translate-y-1/2' },
    { id: 'nw', pos: 'top-[32.3%] left-[32.3%] -translate-x-1/2 -translate-y-1/2' },
];

export default function OmegaField({ placedUnits = [], onSlotClick }) {
    return (
        <div className="relative w-[400px] h-[400px] m-8">
            {/* Field Boundary Circle */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-600 bg-slate-900/50 shadow-2xl"></div>

            {/* Inscribed Circle Helper (Optional Visual Guide for Marker line?) */}
            {/* <div className="absolute inset-[16.7%] rounded-full border border-dashed border-slate-700 pointer-events-none"></div> */}

            {/* Markers */}
            {MARKERS.map((m) => (
                <div key={m.label} className={`absolute w-10 h-10 rounded-full ${m.color} flex items-center justify-center text-black font-bold text-xl shadow-lg border-2 border-white/20 ${m.pos}`}>
                    {m.label}
                </div>
            ))}

            {/* Placement Slots & Units */}
            {SLOTS.map((slot) => {
                const unit = placedUnits.find(u => u.position === slot.id);
                return (
                    <div
                        key={slot.id}
                        onClick={() => onSlotClick && onSlotClick(slot.id)}
                        className={`absolute w-16 h-16 rounded-lg border-2 border-dashed border-slate-600/50 
                            hover:border-white/50 transition-colors cursor-pointer flex items-center justify-center
                            ${slot.pos} ${unit ? 'border-solid bg-slate-800' : ''}`}
                    >
                        {unit ? (
                            <span className={`text-xs text-center font-bold ${unit.type.includes('F') ? 'text-pink-400' : 'text-blue-400'}`}>
                                {unit.type}
                            </span>
                        ) : (
                            <span className="text-slate-700 text-xs">+</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
