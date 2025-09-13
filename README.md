# Crossword Generator

A TypeScript library for generating crossword puzzles from a list of words. The library creates clean, properly intersecting crossword grids with intelligent word placement and validation.

## Features

- ✅ **Smart Word Placement**: Uses intersection-based algorithm to place words naturally
- ✅ **Randomization**: Each generation produces different puzzles from the same word list
- ✅ **Clean Validation**: Prevents accidental word formations and invalid letter sequences
- ✅ **Flexible Grid Sizing**: Configurable maximum grid dimensions
- ✅ **Multiple Output Formats**: Terminal display, JSON, and various formatting options
- ✅ **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install crossword-generator
```

## Quick Start

```typescript
import { generateCrossword } from 'crossword-generator';

const words = ['ARTIST', 'OCTAGON', 'ANGLE', 'DESERT', 'FORCE', 'RENDER', 'PUZZLE'];
const result = generateCrossword(words, { 
  wordCount: 7,
  maxGridSize: 15 
});

console.log(result.grid);
// [
//   [null, null, null, null, null, 'D'],
//   ['P', 'U', 'Z', 'Z', 'L', 'E'],
//   [null, null, null, null, null, 'S'],
//   [null, 'F', 'O', 'R', 'C', 'E'],
//   [null, null, 'C', null, null, 'R'],
//   ['A', 'R', 'T', 'I', 'S', 'T'],
//   [null, null, 'A', null, null, null],
//   ['A', 'N', 'G', 'L', 'E', null],
//   [null, null, 'O', null, null, null],
//   ['R', 'E', 'N', 'D', 'E', 'R']
// ]
```

## API Reference

### `generateCrossword(words, options?)`

Generates a crossword puzzle from an array of words.

**Parameters:**
- `words: string[]` - Array of words to use for the crossword
- `options?: CrosswordOptions` - Configuration options (optional)

**Returns:** `CrosswordResult`

### CrosswordOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wordCount` | `number` | `10` | Target number of words to include. The library **tries** to achieve this count, but may place fewer words if intersections cannot be found or grid constraints prevent placement. |
| `maxGridSize` | `number` | `15` | Maximum grid dimensions (both width and height). Only words shorter than this length will be considered. |
| `maxAttempts` | `number` | `1000` | Maximum number of generation attempts to find the best crossword. |
| `validationLevel` | `'strict' \| 'normal' \| 'lenient'` | `'normal'` | Word placement validation strictness. |
| `minWordLength` | `number` | `3` | Minimum word length to consider. |
| `maxWordLength` | `number` | `maxGridSize` | Maximum word length to consider. |

### CrosswordResult

```typescript
{
  grid: (string | null)[][];     // 2D array representing the crossword
  placedWords: PlacedWord[];     // Information about placed words
  stats: {
    wordsUsed: number;           // Actual number of words placed
    gridSize: { width: number; height: number };
    totalIntersections: number;
    attempts: number;
  };
}
```

### PlacedWord

```typescript
{
  word: string;                  // The word text
  startRow: number;              // Starting row position
  startCol: number;              // Starting column position
  direction: 'horizontal' | 'vertical';
  endRow: number;                // Ending row position
  endCol: number;                // Ending column position
}
```

## Display Functions

The library includes several formatting functions for displaying crosswords:

### Terminal Display

```typescript
import { generateCrossword, formatCrosswordForTerminal } from 'crossword-generator';

const result = generateCrossword(words, { wordCount: 10 });
console.log(formatCrosswordForTerminal(result));
```

Output:
```
    0  1  2  3  4  5 
 0  ·  ·  ·  ·  ·  D 
 1  P  U  Z  Z  L  E 
 2  ·  ·  ·  ·  ·  S 
 3  ·  F  O  R  C  E 
 4  ·  ·  C  ·  ·  R 
 5  A  R  T  I  S  T 
 6  ·  ·  A  ·  ·  · 
 7  A  N  G  L  E  · 
 8  ·  ·  O  ·  ·  · 
 9  R  E  N  D  E  R 

Words used:
1. ARTIST → (5, 0)
2. OCTAGON ↓ (3, 2)
3. ANGLE → (7, 0)
4. DESERT ↓ (0, 5)
5. FORCE → (3, 1)
6. RENDER → (9, 0)
7. PUZZLE → (1, 0)
```

### Other Display Options

```typescript
import { 
  formatCompact,
  formatDetailed,
  formatClean,
  printCrossword
} from 'crossword-generator';

// Print directly to console
printCrossword(result);

// Get formatted strings
const compact = formatCompact(result);      // Minified JSON
const detailed = formatDetailed(result);    // Full details with stats
const clean = formatClean(result);          // Clean array format
```

## Examples

### Basic Usage

```typescript
import { generateCrossword } from 'crossword-generator';

const words = ['CAT', 'DOG', 'BIRD', 'FISH'];
const crossword = generateCrossword(words, {
  wordCount: 4,
  maxGridSize: 10
});

console.log(`Generated crossword with ${crossword.stats.wordsUsed} words`);
```

### Large Word List

```typescript
import { generateCrossword } from 'crossword-generator';

const words = [
  'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'NODE', 'EXPRESS',
  'DATABASE', 'API', 'FRONTEND', 'BACKEND', 'FULLSTACK',
  // ... 200+ more words
];

const crossword = generateCrossword(words, {
  wordCount: 25,        // Try to place 25 words
  maxGridSize: 20,      // Allow larger grid
  maxAttempts: 2000,    // More attempts for complex puzzles
  validationLevel: 'normal'
});

// Note: Actual words placed might be less than 25 if intersections can't be found
console.log(`Placed ${crossword.stats.wordsUsed} out of ${words.length} available words`);
```

### Custom Configuration

```typescript
const crossword = generateCrossword(words, {
  wordCount: 15,           // Target 15 words (may place fewer)
  maxGridSize: 12,         // Compact 12x12 maximum grid
  minWordLength: 4,        // Only words with 4+ letters
  maxWordLength: 10,       // No words longer than 10 letters
  validationLevel: 'strict', // Strictest validation
  maxAttempts: 500         // Fewer attempts for faster generation
});
```

## Algorithm Details

The crossword generation algorithm:

1. **Word Selection**: Randomly selects words from the input array based on length constraints
2. **First Placement**: Places the first word randomly in the center area of the grid
3. **Intersection Finding**: For each subsequent word, finds all possible intersection points with existing words
4. **Validation**: Ensures new word placement doesn't create invalid letter sequences or accidental words
5. **Optimization**: Tries multiple attempts to find the best crossword configuration
6. **Grid Trimming**: Removes empty rows and columns for a compact final result

## Important Notes

- **Word Count**: The `wordCount` option represents a target that the library tries to achieve. The actual number of words placed may be lower if:
  - No valid intersections can be found
  - Grid size constraints prevent placement
  - Validation rules reject potential placements
- **Grid Output**: The returned grid is a 2D array where `string` represents letters and `null` represents empty cells
- **Word Selection**: Words longer than `maxGridSize` are automatically filtered out
- **Randomization**: Each call produces different results even with identical inputs

## TypeScript Support

The library is written in TypeScript and includes full type definitions. All types are exported for use in your projects:

```typescript
import { 
  CrosswordOptions, 
  CrosswordResult, 
  PlacedWord,
  CrosswordGrid,
  Direction 
} from 'crossword-generator';
```

## License

MIT

## Contributing

Issues and pull requests are welcome! Please ensure all tests pass and follow the existing code style.
