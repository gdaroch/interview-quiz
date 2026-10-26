/**
 * Returns a shuffled copy of an array, leaving the original unchanged.
 * @param {Array} items - The values to shuffle.
 * @param {() => number} [random=Math.random] - Gives a number from 0 up to (not including) 1.
 * @returns {Array} A new array with the same values in random order.
 */
export function shuffle(items, random = Math.random) {
  const result = [...items];
  // Walk from the end: pick a random spot at or before i and swap it with i.
  // After each step, the item at i is final and is not moved again.
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    // Swap the two items without a temporary variable.
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns a copy of a question with its options in random order.
 * @param {{options: string[], answer: number}} question - The question to copy and shuffle.
 * @param {() => number} random - Gives a number from 0 up to (not including) 1.
 * @returns {object} A new question whose answer index points to the moved correct option.
 */
function shuffleOptions(question, random) {
  // Shuffle the option positions (0, 1, 2...) instead of the texts, so we can track the moves.
  const order = shuffle(question.options.map((_, i) => i), random);
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    // The new answer is the spot where the old correct position ended up.
    answer: order.indexOf(question.answer),
  };
}

/**
 * Lists the distinct topics of a bank, in order of first appearance.
 * @param {Array<{topic: string}>} bank - The questions to read the topics from.
 * @returns {string[]} The topic names, without repeats.
 */
export function getTopics(bank) {
  // A Set drops repeats and keeps the order in which values were added.
  return [...new Set(bank.map((question) => question.topic))];
}

/**
 * Keeps only the questions whose topic is one of the given topics.
 * @param {Array<{topic: string}>} bank - The questions to filter.
 * @param {Iterable<string>} topics - The topic names to keep.
 * @returns {Array<object>} A new array with the matching questions; the bank is unchanged.
 */
export function filterByTopics(bank, topics) {
  const wanted = new Set(topics);
  return bank.filter((question) => wanted.has(question.topic));
}

/**
 * Builds a round of random questions, each with its options in random order.
 * @param {Array<object>} bank - All the questions to pick from.
 * @param {number} size - How many questions the round should have.
 * @param {() => number} [random=Math.random] - Gives a number from 0 up to (not including) 1.
 * @returns {Array<object>} The chosen questions, at most as many as the bank holds.
 */
export function createRound(bank, size, random = Math.random) {
  const count = Math.min(size, bank.length);
  return shuffle(bank, random)
    .slice(0, count)
    .map((question) => shuffleOptions(question, random));
}

/**
 * Checks if the selected option is the right answer.
 * @param {{answer: number}} question - The question being answered.
 * @param {number} selectedIndex - The index of the option the player chose.
 * @returns {boolean} True if the choice matches the answer.
 */
export function isCorrect(question, selectedIndex) {
  return selectedIndex === question.answer;
}

/**
 * Counts how many selections are right answers.
 * @param {Array<object>} round - The questions of the round.
 * @param {Array<number>} selections - The chosen option index for each question, in order.
 * @returns {number} The number of correct answers.
 */
export function countCorrect(round, selections) {
  // Add 1 to the total for each correct answer, and 0 for each wrong one.
  return round.reduce((total, question, i) => total + (isCorrect(question, selections[i]) ? 1 : 0), 0);
}
