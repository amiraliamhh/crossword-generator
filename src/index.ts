/**
 * Crossword Library
 *
 * A TypeScript library for generating crossword puzzles from a list of words.
 *
 * @example
 * ```typescript
 * import { generateCrossword } from 'crossword-generator';
 *
 * const words = ['ARTIST', 'OCTAGON', 'ANGLE', 'DESERT', 'FORCE', 'RENDER', 'PUZZLE'];
 * const result = generateCrossword(words, { wordCount: 7 });
 *
 * console.log(result.grid);
 * // [
 * //   [null, null, null, null, null, 'D'],
 * //   ['P', 'U', 'Z', 'Z', 'L', 'E'],
 * //   [null, null, null, null, null, 'S'],
 * //   [null, 'F', 'O', 'R', 'C', 'E'],
 * //   [null, null, 'C', null, null, 'R'],
 * //   ['A', 'R', 'T', 'I', 'S', 'T'],
 * //   [null, null, 'A', null, null, null],
 * //   ['A', 'N', 'G', 'L', 'E', null],
 * //   [null, null, 'O', null, null, null],
 * //   ['R', 'E', 'N', 'D', 'E', 'R']
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
