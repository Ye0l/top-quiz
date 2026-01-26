
// Omega Logic Helper

const UNIT_TYPES = {
    F: ['F-Staff', 'F-Legs'],
    M: ['M-Sword', 'M-Shield']
};

const POSITIONS = {
    center: 'center',
    slots: ['ne', 'se', 'sw', 'nw']
};

// Map diagonal slots to their primary axes
const SLOT_AXES = {
    ne: { vertical: 'n', horizontal: 'e' },
    se: { vertical: 's', horizontal: 'e' },
    sw: { vertical: 's', horizontal: 'w' },
    nw: { vertical: 'n', horizontal: 'w' }
};

export const generateOmegaProblem = () => {
    // 1. Center Type
    const centerType = Math.random() > 0.5 ? 'Vertical' : 'Horizontal';
    const centerUnit = { position: 'center', type: centerType };

    // 2. F and M Positions (Opposite Diagonals)
    const diagonals = [['ne', 'sw'], ['nw', 'se']];
    const selectedDiag = diagonals[Math.floor(Math.random() * diagonals.length)];

    // Shuffle F vs M placement
    const isFFirst = Math.random() > 0.5;
    const fPos = selectedDiag[isFFirst ? 0 : 1];
    const mPos = selectedDiag[isFFirst ? 1 : 0];

    // 3. Types
    const fType = UNIT_TYPES.F[Math.floor(Math.random() * UNIT_TYPES.F.length)];
    const mType = UNIT_TYPES.M[Math.floor(Math.random() * UNIT_TYPES.M.length)];

    const units = [
        centerUnit,
        { position: fPos, type: fType },
        { position: mPos, type: mType }
    ];

    return {
        id: Date.now(),
        units: units,
        // Calculate correct spots immediately
        correctSpots: calculateSafeSpots(units)
    };
};

export const calculateSafeSpots = (units) => {
    // Decode State
    const center = units.find(u => u.position === 'center');
    const fUnit = units.find(u => u.type.startsWith('F'));
    const mUnit = units.find(u => u.type.startsWith('M'));

    if (!center || !fUnit || !mUnit) return [];

    const isVertical = center.type === 'Vertical'; // Safe: North/South
    const safeAxis = isVertical ? 'vertical' : 'horizontal';

    const fIsStaff = fUnit.type === 'F-Staff'; // Out
    const fIsLegs = fUnit.type === 'F-Legs';   // In

    const mIsSword = mUnit.type === 'M-Sword'; // Out
    const mIsShield = mUnit.type === 'M-Shield'; // In

    // Logic Rules
    // 1. F-Staff + M-Sword (Out + Out) -> Outer Markers
    if (fIsStaff && mIsSword) {
        // Safe spots are Outer Markers aligned with Safe Axis
        // If Vertical (Safe N/S) -> Out-N, Out-S
        // If Horizontal (Safe E/W) -> Out-E, Out-W
        if (isVertical) return ['m_out_n', 'm_out_s'];
        return ['m_out_e', 'm_out_w'];
    }

    // 2. F-Staff + M-Shield (Out + In) -> Inner Markers
    if (fIsStaff && mIsShield) {
        // Safe spots are Inner Markers aligned with Safe Axis
        if (isVertical) return ['m_in_n', 'm_in_s'];
        return ['m_in_e', 'm_in_w'];
    }

    // 3. F-Legs + M-Sword (In + Out) -> F-Side Center
    if (fIsLegs && mIsSword) {
        // Center Inner Spot closer to F, on Safe Axis
        const fPos = fUnit.position; // e.g. 'ne'
        const dir = SLOT_AXES[fPos][safeAxis]; // e.g. ne + vertical -> 'n'
        return [`c_${dir}`]; // 'c_n'
    }

    // 4. F-Legs + M-Shield (In + In) -> M-Side Center
    if (fIsLegs && mIsShield) {
        // Center Inner Spot closer to M, on Safe Axis
        const mPos = mUnit.position;
        const dir = SLOT_AXES[mPos][safeAxis];
        return [`c_${dir}`];
    }

    return [];
};
