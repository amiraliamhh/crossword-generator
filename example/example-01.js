const { generateCrossword, formatCrosswordForTerminal } = require('../dist');
const words = require('./random_words.json');

const result = generateCrossword(words, {
  wordCount: 20,
  maxAttempts: 1000,
  maxGridSize: 15,
  validationLevel: 'lenient'
});

console.log(formatCrosswordForTerminal(result));