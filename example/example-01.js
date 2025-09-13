const { generateCrossword, formatCrosswordForTerminal } = require('../dist');
const words = require('./random_words.json');

const result = generateCrossword(words, {
  wordCount: 10,
  maxAttempts: 1000,
  maxGridSize: 10,
  validationLevel: 'lenient'
});

console.log(result);
console.log(formatCrosswordForTerminal(result));