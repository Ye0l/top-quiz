export const innerSequence = [
    { levels: [4], note: "4 (Center)" }, // F0
    { levels: [1, 2, 4], note: "1, 2, 4" }, // F1
    { levels: [1, 2], note: "1, 2" }, // F2
    { levels: [3], note: "3" }, // F5
    { levels: [], note: "Blank" }, // F6
    { levels: [2, 3], note: "2, 3" }, // F7
    { levels: [], note: "Blank" }, // F8
    { levels: [1, 4], note: "1, 4" }, // F9
    { levels: [], note: "Blank" }, // F10
    { levels: [4], note: "4" }, // F11
    { levels: [], note: "Blank" }, // F12
    { levels: [3], note: "3" }, // F13
    { levels: [], note: "Blank" }, // F14
    { levels: [2], note: "2" }, // F15
    { levels: [], note: "Blank" }, // F16
    { levels: [1], note: "1" } // F17
];

export const outerSequence = [
    { levels: [1, 2], note: "1,2" }, // F0
    { levels: [1, 2, 4], note: "1, 2, 4" }, // F1
    { levels: [4], note: "4" }, // F2
    { levels: [3], note: "3" }, // F5
    { levels: [], note: "Blank" }, // F6
    { levels: [3, 4], note: "3, 4" }, // F7
    { levels: [], note: "Blank" }, // F8
    { levels: [2, 4], note: "2, 4" }, // F9
    { levels: [], note: "Blank" }, // F10
    { levels: [1, 3], note: "1, 3" }, // F11
    { levels: [], note: "Blank" }, // F12
    { levels: [2], note: "2" }, // F13
    { levels: [], note: "Blank" }, // F14
    { levels: [1], note: "1" }, // F15
    { levels: [], note: "Blank" }, // F16
    { levels: [0], note: "1" } // F17
];

export const patterns = {
    inner: innerSequence,
    outer: outerSequence
};
