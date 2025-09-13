/**
 * Crossword Library
 *
 * A TypeScript library for generating crossword puzzles from a list of words.
 *
 * @example
 * ```typescript
 * import { generateCrossword } from 'crossword-library';
 *
 * const words = ['HELLO', 'WORLD', 'CROSSWORD', 'PUZZLE'];
 * const result = generateCrossword(words, { wordCount: 4 });
 *
 * console.log(result.grid);
 * // [
 * //   ['H', 'E', 'L', 'L', 'O'],
 * //   ['W', null, null, null, null],
 * //   ['O', null, null, null, null],
 * //   ['R', null, null, null, null],
 * //   ['L', null, null, null, null],
 * //   ['D', null, null, null, null]
 * // ]
 * ```
 */

// Export main function
export { generateCrossword } from './generator';

// Export types
export type {
  CrosswordCell,
  CrosswordGrid,
  Direction,
  PlacedWord,
  Intersection,
  CrosswordOptions,
  CrosswordResult,
  GenerationState
} from './types';

// Export utility functions for advanced usage
export {
  createEmptyGrid,
  shuffleArray,
  selectRandomWords,
  canPlaceWord,
  placeWord,
  findIntersections,
  calculateMinGridSize,
  trimGrid,
  adjustWordCoordinatesForTrimmedGrid
} from './utils';

// Export display functions
export {
  formatCrosswordForTerminal,
  printCrossword,
  formatCompact,
  formatDetailed,
  formatClean,
  exportAsSimpleArray
} from './display';
