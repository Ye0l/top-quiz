import { generateOmegaProblem } from './omegaProblemGenerator.js';
export const getNextOmegaProblem = (prevFType, prevMType) => {
  return generateOmegaProblem(prevFType, prevMType);
};