export const innerSequence = [
    { levels: [4], question: true },
    { levels: [1, 2, 4], question: false },
    { levels: [1, 2], question: true },
    { levels: [3], question: false },
    { levels: [], question: true },
    { levels: [2, 3], question: false },
    { levels: [], question: true },
    { levels: [1, 4], question: false },
    { levels: [], question: true },
    { levels: [4], question: false },
    { levels: [], question: true },
    { levels: [3], question: false },
    { levels: [], question: true },
    { levels: [2], question: false },
    { levels: [], question: true },
    { levels: [1], question: false }
];

export const outerSequence = [
    { levels: [1, 2], question: true },
    { levels: [1, 2, 4], question: false },
    { levels: [4], question: true },
    { levels: [3], question: false },
    { levels: [], question: true },
    { levels: [3, 4], question: false },
    { levels: [], question: true },
    { levels: [2, 4], question: false },
    { levels: [], question: true },
    { levels: [1, 3], question: false },
    { levels: [], question: true },
    { levels: [2], question: false },
    { levels: [], question: true },
    { levels: [1], question: false },
    { levels: [], question: true },
    { levels: [0], question: false }
];

export const patterns = {
    inner: innerSequence,
    outer: outerSequence
};
