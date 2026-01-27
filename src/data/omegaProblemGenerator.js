
import { solveOmegaProblem } from '../utils/omegaLogic.js';

const POSITIONS = ['ne', 'se', 'sw', 'nw'];
const WEAPON_F_TYPES = ['F-Staff', 'F-Legs'];
const WEAPON_M_TYPES = ['M-Sword', 'M-Shield'];

/**
 * Returns the diagonal opposite position.
 */
function getDiagonal(pos) {
  if (pos === 'ne') return 'sw';
  if (pos === 'sw') return 'ne';
  if (pos === 'se') return 'nw';
  if (pos === 'nw') return 'se';
  return 'ne'; // falback
}

/**
 * Generates a single valid Omega Problem.
 * @param {string|null} prevFType - The weapon F used in the previous round.
 * @param {string|null} prevMType - The weapon M used in the previous round.
 */
export function generateOmegaProblem(prevFType = null, prevMType = null) {
  let attempts = 0;
  while (attempts < 50) {
    attempts++;

    // 1. Randomize Configuration
    const centerType = Math.random() < 0.5 ? 'Vertical' : 'Horizontal';
    const fPos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const mPos = getDiagonal(fPos);

    const fType = WEAPON_F_TYPES[Math.floor(Math.random() * WEAPON_F_TYPES.length)];
    const mType = WEAPON_M_TYPES[Math.floor(Math.random() * WEAPON_M_TYPES.length)];

    // 2. Check Constraints
    // "Omega M and F cannot use the completely identical weapon set as previous round."
    // (Individual repetition is allowed, but the PAIR cannot be identical).
    if (prevFType && prevMType && fType === prevFType && mType === prevMType) {
      continue; // Retry
    }

    // 3. Solve for Correct Spots
    const correctSpots = solveOmegaProblem(centerType, fPos, fType, mPos, mType);

    // 4. Validate Solution (Must be exactly one answer)
    if (correctSpots.length === 1) {
      const problem = {
        id: `gen_${Date.now()}_${attempts}`,
        centerType,
        units: [
          { position: 'center', type: centerType },
          { position: fPos, type: fType },
          { position: mPos, type: mType }
        ],
        correctSpots
      };

      console.log(`[OmegaGen] Center:${centerType} | F:${fType}(${fPos}) | M:${mType}(${mPos}) -> Ans:${correctSpots.join(',')}`);
      return problem;
    }

    // If we get here, the configuration resulted in 0 or >1 answers. 
    // With current logic, this shouldn't happen for standard cases, but we retry just in case.
  }

  throw new Error("Failed to generate a valid Omega Problem after 50 attempts.");
}
