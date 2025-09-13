/**
 * Main crossword generation algorithm
 */

import {
  CrosswordGrid,
  CrosswordOptions,
  CrosswordResult,
  PlacedWord,
  Direction,
  GenerationState
} from './types';

import {
  createEmptyGrid,
  selectRandomWords,
  shuffleArray,
  canPlaceWord,
  placeWord,
  findIntersections,
  trimGrid,
  adjustWordCoordinatesForTrimmedGrid,
  calculateMinGridSize
} from './utils';

/**
 * Default options for crossword generation
 */
const DEFAULT_OPTIONS: Required<CrosswordOptions> = {
  wordCount: 10,
  maxAttempts: 1000,
  maxGridSize: 15,
  validationLevel: 'normal',
  minWordLength: 3,
  maxWordLength: 15
};

/**
 * Generates a crossword puzzle from an array of words
 */
export function generateCrossword(
  words: string[],
  options: CrosswordOptions = {}
): CrosswordResult {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // Ensure maxWordLength doesn't exceed maxGridSize
  config.maxWordLength = Math.min(config.maxWordLength, config.maxGridSize);

  let bestResult: CrosswordResult | null = null;
  let bestScore = 0;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      const result = attemptGeneration(words, config, attempt);
      const score = calculateScore(result);
      
      if (score > bestScore) {
        bestScore = score;
        bestResult = result;
        
        // If we achieved the target word count, we can stop early
        if (result.placedWords.length >= config.wordCount) {
          break;
        }
      }
    } catch (error) {
      // Continue with next attempt if this one fails
      continue;
    }
  }

  if (!bestResult) {
    // Return a minimal result if no crossword could be generated
    const selectedWords = selectRandomWords(words, { ...config, wordCount: 1 });
    const grid = createEmptyGrid(Math.min(selectedWords[0]?.length || 5, config.maxGridSize));
    
    if (selectedWords.length > 0) {
      const placedWord = placeWord(grid, selectedWords[0]!, 0, 0, 'horizontal');
      const trimmedGrid = trimGrid(grid);
      const adjustedWords = adjustWordCoordinatesForTrimmedGrid([placedWord], grid, trimmedGrid);
      
      return {
        grid: trimmedGrid,
        placedWords: adjustedWords,
        stats: {
          wordsUsed: 1,
          gridSize: calculateMinGridSize(adjustedWords),
          totalIntersections: 0,
          attempts: config.maxAttempts
        }
      };
    }
    
    return {
      grid: [],
      placedWords: [],
      stats: {
        wordsUsed: 0,
        gridSize: { width: 0, height: 0 },
        totalIntersections: 0,
        attempts: config.maxAttempts
      }
    };
  }

  return bestResult;
}

/**
 * Attempts to generate a single crossword
 */
function attemptGeneration(
  words: string[],
  config: Required<CrosswordOptions>,
  attemptNumber: number
): CrosswordResult {
  // Select and shuffle words for this attempt
  const selectedWords = selectRandomWords(words, config);
  const shuffledWords = shuffleArray(selectedWords);

  if (shuffledWords.length === 0) {
    throw new Error('No valid words available');
  }

  // Initialize generation state
  const state: GenerationState = {
    grid: createEmptyGrid(config.maxGridSize),
    placedWords: [],
    availableWords: shuffledWords,
    gridSize: config.maxGridSize,
    attempts: attemptNumber + 1
  };

  // Place the first word randomly
  placeFirstWord(state, config);

  // Place remaining words
  placeRemainingWords(state, config);

  // Trim and adjust the final grid
  const trimmedGrid = trimGrid(state.grid);
  const adjustedWords = adjustWordCoordinatesForTrimmedGrid(
    state.placedWords,
    state.grid,
    trimmedGrid
  );

  return {
    grid: trimmedGrid,
    placedWords: adjustedWords,
    stats: {
      wordsUsed: adjustedWords.length,
      gridSize: calculateMinGridSize(adjustedWords),
      totalIntersections: countIntersections(adjustedWords),
      attempts: state.attempts
    }
  };
}

/**
 * Places the first word in the crossword
 */
function placeFirstWord(state: GenerationState, config: Required<CrosswordOptions>): void {
  if (state.availableWords.length === 0) return;

  const firstWord = state.availableWords.shift()!;
  const direction: Direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
  
  // Place in the center area of the grid
  const centerOffset = Math.floor(config.maxGridSize / 4);
  const maxStart = config.maxGridSize - firstWord.length - centerOffset;
  const startPos = centerOffset + Math.floor(Math.random() * Math.max(1, maxStart - centerOffset));
  
  const startRow = direction === 'horizontal' ? centerOffset + Math.floor(Math.random() * (config.maxGridSize - centerOffset * 2)) : startPos;
  const startCol = direction === 'vertical' ? centerOffset + Math.floor(Math.random() * (config.maxGridSize - centerOffset * 2)) : startPos;

  const placedWord = placeWord(state.grid, firstWord, startRow, startCol, direction);
  state.placedWords.push(placedWord);
}

/**
 * Places remaining words by finding intersections
 */
function placeRemainingWords(state: GenerationState, config: Required<CrosswordOptions>): void {
  const maxWordsToPlace = Math.min(config.wordCount - 1, state.availableWords.length);
  let wordsPlaced = 0;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 20;

  while (wordsPlaced < maxWordsToPlace && 
         state.availableWords.length > 0 && 
         consecutiveFailures < maxConsecutiveFailures) {
    
    const wordIndex = Math.floor(Math.random() * state.availableWords.length);
    const word = state.availableWords[wordIndex];
    
    if (tryPlaceWord(state, word!, config)) {
      state.availableWords.splice(wordIndex, 1);
      wordsPlaced++;
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      
      // Remove the word if we've failed too many times
      if (consecutiveFailures >= 5) {
        state.availableWords.splice(wordIndex, 1);
        consecutiveFailures = 0;
      }
    }
  }
}

/**
 * Tries to place a word by finding valid intersections
 */
function tryPlaceWord(
  state: GenerationState,
  word: string,
  config: Required<CrosswordOptions>
): boolean {
  const intersections = findIntersections(word, state.placedWords);
  
  // Shuffle intersections for randomness
  const shuffledIntersections = shuffleArray(intersections);
  
  for (const intersection of shuffledIntersections) {
    const { row, col, direction } = intersection;
    
    // Check bounds
    if (row < 0 || col < 0) continue;
    
    const endRow = direction === 'vertical' ? row + word.length - 1 : row;
    const endCol = direction === 'horizontal' ? col + word.length - 1 : col;
    
    if (endRow >= state.gridSize || endCol >= state.gridSize) continue;
    
    // Check if word can be placed
    if (canPlaceWord(
      state.grid,
      word,
      row,
      col,
      direction,
      state.placedWords,
      config.validationLevel
    )) {
      const placedWord = placeWord(state.grid, word, row, col, direction);
      state.placedWords.push(placedWord);
      return true;
    }
  }
  
  return false;
}

/**
 * Calculates a score for the crossword quality
 */
function calculateScore(result: CrosswordResult): number {
  const { placedWords, stats } = result;
  
  if (placedWords.length === 0) return 0;
  
  // Factors for scoring
  const wordsScore = placedWords.length * 100;
  const intersectionScore = stats.totalIntersections * 50;
  const compactScore = calculateCompactness(result) * 30;
  const gridEfficiency = calculateGridEfficiency(result) * 20;
  
  return wordsScore + intersectionScore + compactScore + gridEfficiency;
}

/**
 * Calculates how compact the crossword is (lower is better)
 */
function calculateCompactness(result: CrosswordResult): number {
  const { grid } = result;
  if (grid.length === 0) return 0;
  
  const totalCells = grid.length * grid[0]!.length;
  const filledCells = grid.flat().filter(cell => cell !== null).length;
  
  return filledCells / totalCells * 100;
}

/**
 * Calculates grid efficiency
 */
function calculateGridEfficiency(result: CrosswordResult): number {
  const { stats } = result;
  if (stats.gridSize.width === 0 || stats.gridSize.height === 0) return 0;
  
  const gridArea = stats.gridSize.width * stats.gridSize.height;
  const wordsArea = result.placedWords.reduce((sum, word) => sum + word.word.length, 0);
  
  return (wordsArea / gridArea) * 100;
}

/**
 * Counts the number of intersections between words
 */
function countIntersections(placedWords: PlacedWord[]): number {
  let count = 0;
  
  for (let i = 0; i < placedWords.length; i++) {
    for (let j = i + 1; j < placedWords.length; j++) {
      if (wordsIntersect(placedWords[i]!, placedWords[j]!)) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Checks if two words intersect
 */
function wordsIntersect(word1: PlacedWord, word2: PlacedWord): boolean {
  // Words can only intersect if they have different directions
  if (word1.direction === word2.direction) return false;
  
  if (word1.direction === 'horizontal' && word2.direction === 'vertical') {
    return (
      word1.startRow >= word2.startRow &&
      word1.startRow <= word2.endRow &&
      word2.startCol >= word1.startCol &&
      word2.startCol <= word1.endCol
    );
  } else {
    return (
      word2.startRow >= word1.startRow &&
      word2.startRow <= word1.endRow &&
      word1.startCol >= word2.startCol &&
      word1.startCol <= word2.endCol
    );
  }
}
