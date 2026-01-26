import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { patterns } from './patterns';
import ArrowGrid from './ArrowGrid';

export default function GridDebugger() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [speed, setSpeed] = useState(800); // ms per frame
    const [patternKey, setPatternKey] = useState('inner');

    const sequence = patterns[patternKey];

    // 인덱스는 0부터 시작, 4가 맵의 한가운데(중앙)
    // 입력값 i에 대해 대칭되는 9-i도 함께 활성화 (10x10 격자)
    // 0 -> [0, 9] (Edge/Outer)
    // 1 -> [1, 8]
    // 2 -> [2, 7]
    // 3 -> [3, 6]
    // 4 -> [4, 5] (Middle/Center)
    // 5 -> [5, 4] (Middle/Center - 4와 동일)
    const mapLevelToIndices = (level) => {
        // 유효 범위 0~9 (안전을 위해)
        if (level < 0 || level > 9) return [];
        return [level, 9 - level];
    };

    // 타이머 로직
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentFrame((prev) => (prev + 1) % sequence.length);
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, speed, sequence.length]);

    const activeStep = sequence[currentFrame] || { levels: [], note: "Error" };
    const activeIndices = activeStep.levels.flatMap(mapLevelToIndices);

    const handleNext = () => setCurrentFrame((prev) => (prev + 1) % sequence.length);
    const handlePrev = () => setCurrentFrame((prev) => (prev - 1 + sequence.length) % sequence.length);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4 font-sans">

            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-blue-400 mb-2">세계의 화살 패턴 디버거</h1>
                <div className="flex gap-2 justify-center mb-2">
                    <button
                        onClick={() => { setPatternKey('inner'); setCurrentFrame(0); }}
                        className={`px-3 py-1 rounded text-sm font-bold transition-colors ${patternKey === 'inner' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Inner Start
                    </button>
                    <button
                        onClick={() => { setPatternKey('outer'); setCurrentFrame(0); }}
                        className={`px-3 py-1 rounded text-sm font-bold transition-colors ${patternKey === 'outer' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Outer Start
                    </button>
                </div>
                <p className="text-slate-500 text-sm">0=Outer, 4=Center Logic Applied</p>
            </div>

            {/* Main Grid View */}
            <div className="mb-8">
                <ArrowGrid activeIndices={activeIndices} />
            </div>

            {/* Controls & Info */}
            <div className="w-full max-w-[400px] bg-slate-900 p-6 rounded-xl border border-slate-800">

                {/* Current Info */}
                <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-4">
                    <div>
                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Current Pattern</div>
                        <div className="text-3xl font-black text-white font-mono">
                            {activeStep.levels.length > 0 ? activeStep.note : <span className="text-slate-600">BLANK</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Frame</div>
                        <div className="text-2xl font-bold text-yellow-400 font-mono">
                            {currentFrame + 1} <span className="text-slate-600 text-sm">/ {sequence.length}</span>
                        </div>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-blue-600
                  hover:bg-blue-500 flex items-center justify-center transition-colors">
                        {isPlaying ?
                            <Pause className="fill-white" /> :
                            <Play className="fill-white ml-1" />}
                    </button>

                    <div className="flex gap-2">
                        <button onClick={handlePrev}
                            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleNext}
                            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button onClick={() => setCurrentFrame(0)} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700
                  text-slate-300 ml-auto">
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-bold w-12">SPEED</span>
                    <input type="range" min="200" max="2000" step="100" value={speed} onChange={(e) =>
                        setSpeed(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-mono w-12 text-right">{speed}ms</span>
                </div>

            </div>

            {/* Sequence Timeline Strip */}
            <div className="mt-8 w-full max-w-[600px] overflow-x-auto pb-4">
                <div className="flex gap-1">
                    {sequence.map((step, idx) => (
                        <div key={idx} className={` flex-shrink-0 w-8 h-12 rounded flex items-center justify-center text-xs
                  font-bold font-mono transition-all ${idx === currentFrame
                                ? 'bg-yellow-500 text-black scale-110 shadow-lg border-2 border-yellow-200'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'} `}>
                            {step.levels.length > 0 ? step.levels.join(',') : '-'}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
