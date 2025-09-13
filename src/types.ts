/**
 * Type definitions for the crossword library
 */

/** 
 * Represents a cell in the crossword grid
 * - string: contains a letter
 * - null: empty cell
 */
export type CrosswordCell = string | null;

/**
 * Represents the crossword grid as a 2D array
 */
export type CrosswordGrid = CrosswordCell[][];

/**
 * Direction for word placement
 */
export type Direction = 'horizontal' | 'vertical';

/**
 * Represents a placed word in the crossword
 */
export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: Direction;
  endRow: number;
  endCol: number;
}

/**
 * Represents an intersection between two words
 */
export interface Intersection {
  row: number;
  col: number;
  letter: string;
  word1Index: number;
  word2Index: number;
  word1LetterIndex: number;
  word2LetterIndex: number;
}

/**
 * Options for crossword generation
 */
export interface CrosswordOptions {
  /** Number of words to include in the final crossword */
  wordCount?: number;
  /** Maximum number of attempts to generate a valid crossword */
  maxAttempts?: number;
  /** Maximum grid size (both width and height) */
  maxGridSize?: number;
  /** Validation level for word placement */
  validationLevel?: 'strict' | 'normal' | 'lenient';
  /** Minimum word length to consider */
  minWordLength?: number;
  /** Maximum word length to consider */
  maxWordLength?: number;
}

/**
 * Result of crossword generation
 */
export interface CrosswordResult {
  /** The generated crossword grid */
  grid: CrosswordGrid;
  /** Words that were placed in the crossword */
  placedWords: PlacedWord[];
  /** Statistics about the generation process */
  stats: {
    wordsUsed: number;
    gridSize: { width: number; height: number };
    totalIntersections: number;
    attempts: number;
  };
}

/**
 * Internal state during crossword generation
 */
export interface GenerationState {
  grid: CrosswordGrid;
  placedWords: PlacedWord[];
  availableWords: string[];
  gridSize: number;
  attempts: number;
}
