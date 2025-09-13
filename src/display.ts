/**
 * Display and formatting functions for crossword output
 */

import { CrosswordGrid, CrosswordResult, PlacedWord } from './types';

/**
 * Formats the crossword grid for terminal display
 */
export function formatCrosswordForTerminal(result: CrosswordResult): string {
  const { grid, placedWords } = result;
  
  if (grid.length === 0) {
    return 'Empty crossword';
  }

  let output = '\n';
  
  // Add column numbers
  output += '   ';
  for (let col = 0; col < grid[0]!.length; col++) {
    output += (col % 10).toString().padStart(2, ' ') + ' ';
  }
  output += '\n';

  // Add grid with row numbers
  for (let row = 0; row < grid.length; row++) {
    output += (row % 10).toString().padStart(2, ' ') + ' ';
    
    for (let col = 0; col < grid[row]!.length; col++) {
      const cell = grid[row]![col];
      const cellStr = cell || '·';
      output += cellStr.padStart(2, ' ') + ' ';
    }
    output += '\n';
  }

  // Add word list
  output += '\nWords used:\n';
  placedWords.forEach((word, index) => {
    const direction = word.direction === 'horizontal' ? '→' : '↓';
    output += `${index + 1}. ${word.word} ${direction} (${word.startRow}, ${word.startCol})\n`;
  });

  return output;
}

/**
 * Prints the crossword to console
 */
export function printCrossword(result: CrosswordResult): void {
  // eslint-disable-next-line no-console
  console.log(formatCrosswordForTerminal(result));
}

/**
 * Formats the crossword in a compact JSON-like format
 */
export function formatCompact(result: CrosswordResult): string {
  return JSON.stringify(result.grid, null, 0);
}

/**
 * Formats the crossword with detailed information
 */
export function formatDetailed(result: CrosswordResult): string {
  const { grid, placedWords, stats } = result;
  
  let output = 'Crossword Puzzle\n';
  output += '================\n\n';
  
  // Grid
  output += 'Grid:\n';
  output += formatGridAsTable(grid);
  output += '\n';
  
  // Statistics
  output += 'Statistics:\n';
  output += `-----------\n`;
  output += `Words used: ${stats.wordsUsed}\n`;
  output += `Grid size: ${stats.gridSize.width} x ${stats.gridSize.height}\n`;
  output += `Total intersections: ${stats.totalIntersections}\n`;
  output += `Generation attempts: ${stats.attempts}\n\n`;
  
  // Word details
  output += 'Word Placement:\n';
  output += '---------------\n';
  placedWords.forEach((word, index) => {
    const direction = word.direction === 'horizontal' ? 'Horizontal' : 'Vertical';
    output += `${index + 1}. ${word.word}\n`;
    output += `   Direction: ${direction}\n`;
    output += `   Position: (${word.startRow}, ${word.startCol}) to (${word.endRow}, ${word.endCol})\n\n`;
  });
  
  return output;
}

/**
 * Formats the crossword in a clean, simple format
 */
export function formatClean(result: CrosswordResult): string {
  const { grid } = result;
  
  if (grid.length === 0) {
    return '[]';
  }

  let output = '[\n';
  
  for (let row = 0; row < grid.length; row++) {
    output += '  [';
    
    for (let col = 0; col < grid[row]!.length; col++) {
      const cell = grid[row]![col];
      const cellStr = cell ? `'${cell}'` : 'null';
      output += cellStr;
      
      if (col < grid[row]!.length - 1) {
        output += ', ';
      }
    }
    
    output += ']';
    if (row < grid.length - 1) {
      output += ',';
    }
    output += '\n';
  }
  
  output += ']';
  return output;
}

/**
 * Helper function to format grid as a table
 */
function formatGridAsTable(grid: CrosswordGrid): string {
  if (grid.length === 0) {
    return 'Empty grid\n';
  }

  let output = '';
  
  // Top border
  output += '┌';
  for (let col = 0; col < grid[0]!.length; col++) {
    output += '───';
    if (col < grid[0]!.length - 1) {
      output += '┬';
    }
  }
  output += '┐\n';

  // Rows
  for (let row = 0; row < grid.length; row++) {
    output += '│';
    
    for (let col = 0; col < grid[row]!.length; col++) {
      const cell = grid[row]![col];
      const cellStr = cell ? ` ${cell} ` : '   ';
      output += cellStr;
      
      if (col < grid[row]!.length - 1) {
        output += '│';
      }
    }
    
    output += '│\n';
    
    // Middle border (except for last row)
    if (row < grid.length - 1) {
      output += '├';
      for (let col = 0; col < grid[0]!.length; col++) {
        output += '───';
        if (col < grid[0]!.length - 1) {
          output += '┼';
        }
      }
      output += '┤\n';
    }
  }

  // Bottom border
  output += '└';
  for (let col = 0; col < grid[0]!.length; col++) {
    output += '───';
    if (col < grid[0]!.length - 1) {
      output += '┴';
    }
  }
  output += '┘\n';

  return output;
}

/**
 * Exports the crossword as a simple 2D array (matching the user's requested format)
 */
export function exportAsSimpleArray(result: CrosswordResult): (string | null)[][] {
  return result.grid;
}
