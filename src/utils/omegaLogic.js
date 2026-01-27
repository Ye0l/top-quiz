
// Constants
const POSITIONS = ['center', 'ne', 'se', 'sw', 'nw'];
const WEAPON_F = ['F-Staff', 'F-Legs'];
const WEAPON_M = ['M-Sword', 'M-Shield'];

/**
 * Calculates safe spots based on the 6 Omega Rules.
 * 
 * Rules:
 * 1. Center Direction (V/H) -> 6 Candidates (N/S or E/W).
 * 2. F-Side Ban -> Remove In/Out on F's side relative to Center.
 * 3. F-Staff -> Ban Center.
 * 4. F-Legs -> Ban Outer.
 * 5. M-Sword -> Ban Inner.
 * 6. M-Shield -> Ban Outer.
 * 
 * Tie-Breakers (derived from manual data):
 * - If Legs + Sword: Center on F-Side.
 * - If Legs + Shield: Center on M-Side.
 */
export function solveOmegaProblem(centerType, fPos, fType, mPos, mType) {
  // 1. Initial Candidates based on Center Type
  let candidates = [];
  if (centerType === 'Vertical') { // N/S
    candidates = [
      { id: 'm_out_n', side: 'n', type: 'out' },
      { id: 'm_in_n', side: 'n', type: 'in' },
      { id: 'c_n', side: 'n', type: 'center' },
      { id: 'c_s', side: 's', type: 'center' },
      { id: 'm_in_s', side: 's', type: 'in' },
      { id: 'm_out_s', side: 's', type: 'out' },
    ];
  } else { // Horizontal (E/W)
    candidates = [
      { id: 'm_out_e', side: 'e', type: 'out' },
      { id: 'm_in_e', side: 'e', type: 'in' },
      { id: 'c_e', side: 'e', type: 'center' },
      { id: 'c_w', side: 'w', type: 'center' },
      { id: 'm_in_w', side: 'w', type: 'in' },
      { id: 'm_out_w', side: 'w', type: 'out' },
    ];
  }

  // Determine F-Side relative to Center Orientation
  const fSide = getSide(centerType, fPos);

  // 2. F-Side Ban (Ban In/Out on F-Side)
  // "1의 조건에서 남은 원중 오메가 F쪽의 두 원은 어느 경우든 사용할 수 없음."
  // Interpretation: The "Two Circles" usually refers to standard In/Out circles. Center is separate.
  candidates = candidates.filter(c => {
    if (c.side === fSide) {
      // If filter returns false, it is removed.
      // Remove 'in' and 'out' on F-Side.
      return c.type === 'center';
    }
    return true;
  });

  // 3. F-Staff -> Ban Center
  if (fType === 'F-Staff') {
    candidates = candidates.filter(c => c.type !== 'center');
  }

  // 4. F-Legs -> Ban Outer
  if (fType === 'F-Legs') {
    candidates = candidates.filter(c => c.type !== 'out');
  }

  // 5. M-Sword -> Ban Inner
  if (mType === 'M-Sword') {
    candidates = candidates.filter(c => c.type !== 'in');
  }

  // 6. M-Shield -> Ban Outer
  if (mType === 'M-Shield') {
    candidates = candidates.filter(c => c.type !== 'out');
  }

  // --- Tie-Breakers / Special Constraints for Unique Answer ---

  // Case 3 & 7: Legs + Sword => Candidate usually Center N & S.
  // Manual Data says "Center (F Side)".
  if (fType === 'F-Legs' && mType === 'M-Sword') {
    // Prefer F-Side Center
    const fSideCandidates = candidates.filter(c => c.side === fSide);
    if (fSideCandidates.length > 0) return fSideCandidates.map(c => c.id);
  }

  // Case 4 & 8: Legs + Shield => Candidate usually In/Center (but derived 'Center M-Side').
  // Manual Data says "Center (M Side)".
  if (fType === 'F-Legs' && mType === 'M-Shield') {
    // Prefer M-Side Center (M-Side is opposite of F-Side)
    const mSide = getOppositeSide(fSide);
    const mSideCenter = candidates.filter(c => c.side === mSide && c.type === 'center');
    if (mSideCenter.length > 0) return mSideCenter.map(c => c.id);
  }

  return candidates.map(c => c.id);
}

function getSide(centerType, pos) {
  // Map NE/SE/SW/NW to N/S/E/W based on CenterType
  if (centerType === 'Vertical') { // N or S
    if (pos === 'ne' || pos === 'nw') return 'n';
    if (pos === 'se' || pos === 'sw') return 's';
  } else { // Horizontal (E or W)
    if (pos === 'ne' || pos === 'se') return 'e';
    if (pos === 'nw' || pos === 'sw') return 'w';
  }
  return null;
}

function getOppositeSide(side) {
  if (side === 'n') return 's';
  if (side === 's') return 'n';
  if (side === 'e') return 'w';
  if (side === 'w') return 'e';
  return null;
}
