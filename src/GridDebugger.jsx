import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { patterns } from './patterns';
import ArrowGrid from './ArrowGrid';
import OmegaField from './OmegaField';
import { ARROW_PROBLEMS } from './data/quizData';
import { OMEGA_MANUAL_PROBLEMS } from './data/omegaManualData';
import { getNextOmegaProblem } from './data/omegaProblems';

export default function GridDebugger() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [speed, setSpeed] = useState(800); // ms per frame
    const [patternKey, setPatternKey] = useState('inner');
    const [omegaProblem, setOmegaProblem] = useState(null); // { pIdx, fIdx, data }
    const [viewMode, setViewMode] = useState('arrow'); // 'arrow', 'omega'
    const [showMenu, setShowMenu] = useState(false);

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

    const selectOmegaProblem = (pIdx, fIdx) => {
        const problem = OMEGA_MANUAL_PROBLEMS[pIdx];
        const frame = problem.frames[fIdx];
        setOmegaProblem({
            pIdx,
            fIdx,
            title: problem.title,
            desc: problem.description,
            data: frame
        });
        setViewMode('omega');
        setShowMenu(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-2 font-sans overflow-x-hidden relative">

            {/* Menu Overlay */}
            {showMenu && (
                <div className="absolute inset-0 bg-slate-950/95 z-50 overflow-y-auto p-4 flex flex-col items-center animate-in fade-in duration-200">
                    <div className="w-full max-w-md pb-20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Select Content</h2>
                            <button onClick={() => setShowMenu(false)} className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">Close</button>
                        </div>

                        <div className="mb-8 p-4 bg-slate-900 rounded-lg border border-red-900/50">
                            <h3 className="text-red-500 font-bold mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Omega Problems
                            </h3>
                            <div className="flex flex-col gap-4">
                                {OMEGA_MANUAL_PROBLEMS.map((prob, pIdx) => (
                                    <div key={prob.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                        <div className="font-bold text-slate-200 mb-1">{prob.title}</div>
                                        <div className="text-xs text-slate-500 mb-2">{prob.description}</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {prob.frames.map((frame, fIdx) => (
                                                <button
                                                    key={fIdx}
                                                    onClick={() => selectOmegaProblem(pIdx, fIdx)}
                                                    className="px-3 py-1.5 bg-red-900/30 hover:bg-red-800/50 border border-red-800/50 rounded text-xs font-mono transition-colors"
                                                >
                                                    Frame {fIdx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-wider">Full Sequences</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => { setViewMode('arrow'); setPatternKey('inner'); setCurrentFrame(0); setShowMenu(false); }} className="p-3 bg-slate-800 rounded hover:bg-slate-700 text-left">
                                    <div className="font-bold">Inner Start</div>
                                    <div className="text-xs text-slate-500">Full Inner Sequence</div>
                                </button>
                                <button onClick={() => { setViewMode('arrow'); setPatternKey('outer'); setCurrentFrame(0); setShowMenu(false); }} className="p-3 bg-slate-800 rounded hover:bg-slate-700 text-left">
                                    <div className="font-bold">Outer Start</div>
                                    <div className="text-xs text-slate-500">Full Outer Sequence</div>
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-green-500 font-bold mb-2 uppercase text-sm tracking-wider">Inner Problems</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {ARROW_PROBLEMS.inner.map((frame, idx) => (
                                    <button
                                        key={`i-${idx}`}
                                        onClick={() => { setPatternKey('inner'); setCurrentFrame(frame); setShowMenu(false); }}
                                        className="p-2 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-700 text-center"
                                    >
                                        <div className="font-bold text-white">Q{idx + 1}</div>
                                        <div className="text-xs text-slate-500">Frame {frame}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-yellow-500 font-bold mb-2 uppercase text-sm tracking-wider">Actions</h3>
                            <button
                                onClick={() => {
                                    const prob = getNextOmegaProblem(null, null);
                                    setOmegaProblem({
                                        pIdx: -1,
                                        fIdx: -1,
                                        title: "Random Generated",
                                        desc: "Logic-based Random Problem",
                                        data: prob
                                    });
                                    setViewMode('omega');
                                    setShowMenu(false);
                                }}
                                className="w-full py-3 bg-yellow-600/20 border border-yellow-600/50 hover:bg-yellow-600/40 text-yellow-200 rounded-lg font-bold flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Generate Random Logic Problem
                            </button>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-purple-500 font-bold mb-2 uppercase text-sm tracking-wider">Outer Problems</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {ARROW_PROBLEMS.outer.map((frame, idx) => (
                                    <button
                                        key={`o-${idx}`}
                                        onClick={() => { setPatternKey('outer'); setCurrentFrame(frame); setShowMenu(false); }}
                                        className="p-2 bg-slate-800/50 border border-slate-700 rounded hover:bg-slate-700 text-center"
                                    >
                                        <div className="font-bold text-white">Q{idx + 1}</div>
                                        <div className="text-xs text-slate-500">Frame {frame}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6 text-center w-full max-w-[400px] flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-400">Arrow Patterns</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMenu(true)}
                        className="px-4 py-2 bg-slate-800 text-sm font-bold rounded-lg border border-slate-700 hover:bg-slate-700 transition"
                    >
                        MENU
                    </button>
                </div>
            </div>

            {/* Main View Switcher */}
            <div className="mb-4 w-full max-w-xl px-1 flex justify-center shrink-0">
                {viewMode === 'arrow' ? (
                    <ArrowGrid activeIndices={activeIndices} />
                ) : (
                    omegaProblem && (
                        <div className="flex flex-col items-center w-full">
                            <div className="mb-2 text-center">
                                <span className="px-2 py-1 bg-red-900/50 text-red-200 rounded text-sm font-bold border border-red-800">
                                    Prob {omegaProblem.pIdx + 1} - Frame {omegaProblem.fIdx + 1}
                                </span>
                            </div>
                            <OmegaField
                                placedUnits={omegaProblem.data.units}
                                correctSpots={omegaProblem.data.correctSpots}
                                showAnswerSpots={true}
                                showAttacks={true}
                            />
                            <div className="mt-4 text-center px-4">
                                <h3 className="font-bold text-lg mb-1">{omegaProblem.title}</h3>
                                <p className="text-slate-400 text-sm">{omegaProblem.desc}</p>

                                {omegaProblem.pIdx === -1 && (
                                    <button
                                        onClick={() => {
                                            const prob = getNextOmegaProblem(null, null);
                                            setOmegaProblem({
                                                pIdx: -1,
                                                fIdx: -1,
                                                title: "Random Generated",
                                                desc: "Logic-based Random Problem",
                                                data: prob
                                            });
                                        }}
                                        className="mt-4 px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2 mx-auto"
                                    >
                                        <RefreshCw size={18} />
                                        REGENERATE
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Controls & Info (Only show for Arrow Mode) */}
            {viewMode === 'arrow' && (
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
            )}

            {/* Sequence Timeline Strip */}
            {viewMode === 'arrow' && (
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
            )}



        </div>
    );
}
