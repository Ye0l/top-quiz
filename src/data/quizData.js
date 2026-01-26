// Omega mechanic problems
export const OMEGA_QUESTIONS = [
    { id: 'o1', question: "F지팡이 M칼", answer: "영어징 밖" },
    { id: 'o2', question: "F지팡이 M방패", answer: "영어징 앞" },
    { id: 'o3', question: "F칼날다리 M칼", answer: "F쪽 파이널 오메가 안" },
    { id: 'o4', question: "F칼날다리 M방패", answer: "M쪽 파이널 오메가 안" },
];

export const ARROW_PROBLEMS = {
    // Problem frames (Frame index to show) -> User must find safe spot for Frame + 1
    inner: [2, 4, 6, 8, 10, 12, 14],
    outer: [1, 3, 5, 7, 9, 11, 13, 15]
    // Note: These are example indices, will need valid ones from patterns.js
};
