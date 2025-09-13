/**
 * Utility functions for crossword generation
 */

import { 
  CrosswordGrid, 
  CrosswordCell, 
  Direction, 
  PlacedWord, 
  Intersection,
  CrosswordOptions 
} from './types';

/**
 * Creates an empty crossword grid of specified size
 */
export function createEmptyGrid(size: number): CrosswordGrid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Selects random words from the input array based on options
 */
export function selectRandomWords(
  words: string[], 
  options: CrosswordOptions
): string[] {
  const {
    wordCount = 10,
    minWordLength = 3,
    maxWordLength = options.maxGridSize || 15
  } = options;

  // Filter words by length constraints
  const validWords = words.filter(word => 
    word.length >= minWordLength && 
    word.length <= maxWordLength
  );

  // Shuffle and select the requested number of words
  const shuffled = shuffleArray(validWords);
  return shuffled.slice(0, Math.min(wordCount, shuffled.length));
}

/**
 * Checks if a word can be placed at the specified position
 */
export function canPlaceWord(
  grid: CrosswordGrid,
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  placedWords: PlacedWord[] = [],
  validationLevel: 'strict' | 'normal' | 'lenient' = 'normal'
): boolean {
  const endRow = direction === 'vertical' ? startRow + word.length - 1 : startRow;
  const endCol = direction === 'horizontal' ? startCol + word.length - 1 : startCol;

  // Check bounds
  if (endRow >= grid.length || endCol >= grid[0]!.length) {
    return false;
  }

  // Check each position
  for (let i = 0; i < word.length; i++) {
    const row = direction === 'vertical' ? startRow + i : startRow;
    const col = direction === 'horizontal' ? startCol + i : startCol;
    const cell = grid[row]![col];
    const letter = word[i]!.toUpperCase();

    // If cell is not empty, it must match the letter
    if (cell !== null && cell !== letter) {
      return false;
    }

    // For strict validation, check surrounding cells
    if (validationLevel === 'strict') {
      if (!checkSurroundingCells(grid, row, col, letter, direction, placedWords)) {
        return false;
      }
    }
  }

  // Always check word boundaries to prevent accidental words, regardless of validation level
  if (!checkWordBoundaries(grid, word, startRow, startCol, endRow, endCol, direction)) {
    return false;
  }

  return true;
}

/**
 * Checks surrounding cells for strict validation
 */
function checkSurroundingCells(
  grid: CrosswordGrid,
  row: number,
  col: number,
  letter: string,
  direction: Direction,
  placedWords: PlacedWord[]
): boolean {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  for (const [dr, dc] of directions) {
    // Skip checking in the direction of the word being placed
    if ((direction === 'vertical' && dc === 0) || (direction === 'horizontal' && dr === 0)) {
      continue;
    }

    const newRow = row + dr!;
    const newCol = col + dc!;

    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0]!.length) {
      const adjacentCell = grid[newRow]![newCol];
      
      // If there's an adjacent letter, ensure it forms a valid intersection
      if (adjacentCell !== null) {
        const hasValidIntersection = placedWords.some(placedWord => {
          return isPartOfWord(newRow, newCol, placedWord);
        });
        
        if (!hasValidIntersection) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Checks if a position is part of a placed word
 */
function isPartOfWord(row: number, col: number, word: PlacedWord): boolean {
  if (word.direction === 'horizontal') {
    return row === word.startRow && col >= word.startCol && col <= word.endCol;
  } else {
    return col === word.startCol && row >= word.startRow && row <= word.endRow;
  }
}

/**
 * Checks word boundaries to prevent invalid extensions and accidental words
 */
function checkWordBoundaries(
  grid: CrosswordGrid,
  word: string,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  direction: Direction
): boolean {
  // Check before and after the word to prevent extending existing words
  if (direction === 'horizontal') {
    // Check cell before the word
    if (startCol > 0 && grid[startRow]![startCol - 1] !== null) {
      return false;
    }
    // Check cell after the word
    if (endCol < grid[0]!.length - 1 && grid[startRow]![endCol + 1] !== null) {
      return false;
    }
    
    // Check cells above and below each letter to prevent accidental vertical words
    for (let i = 0; i < (endCol - startCol + 1); i++) {
      const col = startCol + i;
      const row = startRow;
      const currentLetter = word[i]!.toUpperCase();
      
      // Check above
      if (row > 0 && grid[row - 1]![col] !== null) {
        // Only allow if this is an intersection (existing letter matches the new word's letter)
        if (grid[row]![col] !== null && grid[row]![col] !== currentLetter) {
          return false;
        }
        // If placing here would create an adjacent letter sequence, reject
        if (grid[row]![col] === null) {
          return false;
        }
      }
      
      // Check below  
      if (row < grid.length - 1 && grid[row + 1]![col] !== null) {
        // Only allow if this is an intersection (existing letter matches the new word's letter)
        if (grid[row]![col] !== null && grid[row]![col] !== currentLetter) {
          return false;
        }
        // If placing here would create an adjacent letter sequence, reject
        if (grid[row]![col] === null) {
          return false;
        }
      }
    }
  } else {
    // Check cell above the word
    if (startRow > 0 && grid[startRow - 1]![startCol] !== null) {
      return false;
    }
    // Check cell below the word
    if (endRow < grid.length - 1 && grid[endRow + 1]![startCol] !== null) {
      return false;
    }
    
    // Check cells left and right of each letter to prevent accidental horizontal words
    for (let i = 0; i < (endRow - startRow + 1); i++) {
      const row = startRow + i;
      const col = startCol;
      const currentLetter = word[i]!.toUpperCase();
      
      // Check left
      if (col > 0 && grid[row]![col - 1] !== null) {
        // Only allow if this is an intersection (existing letter matches the new word's letter)
        if (grid[row]![col] !== null && grid[row]![col] !== currentLetter) {
          return false;
        }
        // If placing here would create an adjacent letter sequence, reject
        if (grid[row]![col] === null) {
          return false;
        }
      }
      
      // Check right
      if (col < grid[0]!.length - 1 && grid[row]![col + 1] !== null) {
        // Only allow if this is an intersection (existing letter matches the new word's letter)
        if (grid[row]![col] !== null && grid[row]![col] !== currentLetter) {
          return false;
        }
        // If placing here would create an adjacent letter sequence, reject
        if (grid[row]![col] === null) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Checks if two adjacent cells are part of a valid intersection (not an accidental word)
 */
function isPartOfValidIntersection(
  grid: CrosswordGrid,
  row1: number,
  col1: number,
  row2: number,
  col2: number,
  direction: Direction
): boolean {
  // If either cell is empty, no issue
  const letter1 = grid[row1]![col1];
  const letter2 = grid[row2]![col2];
  
  if (letter1 === null || letter2 === null) {
    return true;
  }
  
  // Both cells have letters - this could create an accidental word
  // Only allow this if the current position we're checking is an intersection point
  // where a word is supposed to cross through
  
  // For now, be conservative and don't allow adjacent letters
  // This prevents formations like "TBAN", "NPHY", etc.
  return false;
}

/**
 * Places a word on the grid
 */
export function placeWord(
  grid: CrosswordGrid,
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): PlacedWord {
  const upperWord = word.toUpperCase();
  
  for (let i = 0; i < upperWord.length; i++) {
    const row = direction === 'vertical' ? startRow + i : startRow;
    const col = direction === 'horizontal' ? startCol + i : startCol;
    grid[row]![col] = upperWord[i]!;
  }

  const endRow = direction === 'vertical' ? startRow + word.length - 1 : startRow;
  const endCol = direction === 'horizontal' ? startCol + word.length - 1 : startCol;

  return {
    word: upperWord,
    startRow,
    startCol,
    direction,
    endRow,
    endCol
  };
}

/**
 * Finds all possible intersections between a new word and existing placed words
 */
export function findIntersections(
  newWord: string,
  placedWords: PlacedWord[]
): Array<{
  placedWord: PlacedWord;
  newWordIndex: number;
  placedWordIndex: number;
  row: number;
  col: number;
  direction: Direction;
}> {
  const intersections: Array<{
    placedWord: PlacedWord;
    newWordIndex: number;
    placedWordIndex: number;
    row: number;
    col: number;
    direction: Direction;
  }> = [];

  const upperNewWord = newWord.toUpperCase();

  for (const placedWord of placedWords) {
    for (let i = 0; i < upperNewWord.length; i++) {
      for (let j = 0; j < placedWord.word.length; j++) {
        if (upperNewWord[i] === placedWord.word[j]) {
          // Calculate position for intersection
          let row: number, col: number, direction: Direction;

          if (placedWord.direction === 'horizontal') {
            // New word will be vertical
            direction = 'vertical';
            row = placedWord.startRow - i;
            col = placedWord.startCol + j;
          } else {
            // New word will be horizontal
            direction = 'horizontal';
            row = placedWord.startRow + j;
            col = placedWord.startCol - i;
          }

          intersections.push({
            placedWord,
            newWordIndex: i,
            placedWordIndex: j,
            row,
            col,
            direction
          });
        }
      }
    }
  }

  return intersections;
}

/**
 * Calculates the minimum grid size needed for the placed words
 */
export function calculateMinGridSize(placedWords: PlacedWord[]): { width: number; height: number } {
  if (placedWords.length === 0) {
    return { width: 0, height: 0 };
  }

  let maxRow = 0;
  let maxCol = 0;

  for (const word of placedWords) {
    maxRow = Math.max(maxRow, word.endRow);
    maxCol = Math.max(maxCol, word.endCol);
  }

  return { width: maxCol + 1, height: maxRow + 1 };
}

/**
 * Trims empty rows and columns from the grid
 */
export function trimGrid(grid: CrosswordGrid): CrosswordGrid {
  if (grid.length === 0) return grid;

  // Find bounds
  let minRow = grid.length;
  let maxRow = -1;
  let minCol = grid[0]!.length;
  let maxCol = -1;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row]!.length; col++) {
      if (grid[row]![col] !== null) {
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
      }
    }
  }

  // If no letters found, return empty grid
  if (minRow === grid.length) {
    return [];
  }

  // Extract the trimmed portion
  const trimmed: CrosswordGrid = [];
  for (let row = minRow; row <= maxRow; row++) {
    const newRow: CrosswordCell[] = [];
    for (let col = minCol; col <= maxCol; col++) {
      newRow.push(grid[row]![col]!);
    }
    trimmed.push(newRow);
  }

  return trimmed;
}

/**
 * Adjusts word coordinates after grid trimming
 */
export function adjustWordCoordinatesForTrimmedGrid(
  placedWords: PlacedWord[],
  originalGrid: CrosswordGrid,
  trimmedGrid: CrosswordGrid
): PlacedWord[] {
  if (originalGrid.length === 0 || trimmedGrid.length === 0) {
    return placedWords;
  }

  // Find the offset
  let minRow = originalGrid.length;
  let minCol = originalGrid[0]!.length;

  for (let row = 0; row < originalGrid.length; row++) {
    for (let col = 0; col < originalGrid[row]!.length; col++) {
      if (originalGrid[row]![col] !== null) {
        minRow = Math.min(minRow, row);
        minCol = Math.min(minCol, col);
      }
    }
  }

  // Adjust coordinates
  return placedWords.map(word => ({
    ...word,
    startRow: word.startRow - minRow,
    startCol: word.startCol - minCol,
    endRow: word.endRow - minRow,
    endCol: word.endCol - minCol
  }));
}
