/**
 * Tells if a value is an object that is not null and not an array.
 * @param {unknown} v - The value to check.
 * @returns {boolean} True when the value is a plain object.
 */
const isPlainObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Builds one validation error record.
 * @param {string} questionRef - The question id, or its position when it has no id.
 * @param {string} field - The name of the field with the problem.
 * @param {string} message - What is wrong.
 * @returns {{questionRef: string, field: string, message: string}} The error record.
 */
function error(questionRef, field, message) {
  return { questionRef, field, message };
}

/**
 * Checks that one field of a question is a string.
 * @param {object} q - The question to check.
 * @param {string} field - The name of the field to check.
 * @param {string} ref - The question id, or its position when it has no id.
 * @returns {Array<object>} A list with one error, or an empty list when the field is valid.
 */
function checkString(q, field, ref) {
  if (typeof q[field] !== "string") return [error(ref, field, `"${field}" must be a string`)];
  return [];
}

/**
 * Checks that the options are a list of at least 2 non-empty strings.
 * @param {object} q - The question to check.
 * @param {string} ref - The question id, or its position when it has no id.
 * @returns {Array<object>} The errors found, empty when the options are valid.
 */
function checkOptions(q, ref) {
  if (!Array.isArray(q.options)) return [error(ref, "options", '"options" must be an array')];
  const errors = [];
  if (q.options.length < 2) errors.push(error(ref, "options", '"options" must have at least 2 entries'));
  q.options.forEach((opt, i) => {
    if (typeof opt !== "string" || opt.trim() === "") {
      errors.push(error(ref, `options[${i}]`, "option must be a non-empty string"));
    }
  });
  return errors;
}

/**
 * Checks that the answer is a whole number that points to an existing option.
 * @param {object} q - The question to check.
 * @param {string} ref - The question id, or its position when it has no id.
 * @returns {Array<object>} The errors found, empty when the answer is valid.
 */
function checkAnswer(q, ref) {
  if (!Number.isInteger(q.answer)) return [error(ref, "answer", '"answer" must be an integer')];
  if (Array.isArray(q.options) && (q.answer < 0 || q.answer >= q.options.length)) {
    return [error(ref, "answer", `"answer" must be between 0 and ${q.options.length - 1}`)];
  }
  return [];
}

/**
 * Checks the optional code snippet: a language name and a list of text lines.
 * @param {object} q - The question to check.
 * @param {string} ref - The question id, or its position when it has no id.
 * @returns {Array<object>} The errors found, empty when the snippet is valid or missing.
 */
function checkCode(q, ref) {
  if (q.code === undefined) return [];
  if (!isPlainObject(q.code)) return [error(ref, "code", '"code" must be an object')];
  const errors = [];
  const { language, lines } = q.code;
  if (typeof language !== "string" || language.trim() === "") {
    errors.push(error(ref, "code.language", '"code.language" must be a non-empty string'));
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    errors.push(error(ref, "code.lines", '"code.lines" must be a non-empty array'));
  } else {
    lines.forEach((line, i) => {
      if (typeof line !== "string") errors.push(error(ref, `code.lines[${i}]`, "code line must be a string"));
    });
  }
  return errors;
}

/**
 * Checks the whole question bank and lists every problem found.
 * @param {unknown} data - The parsed content of questions.json.
 * @returns {Array<object>} The errors found, empty when the bank is valid.
 */
export function validateBank(data) {
  if (!Array.isArray(data)) return [error("bank", "(root)", "The question bank must be a list of questions")];
  if (data.length === 0) return [error("bank", "(root)", "The question bank is empty")];

  const errors = [];
  const seen = new Set();
  const reportedDuplicates = new Set();

  data.forEach((q, index) => {
    // Name the question by its id; without a usable id, use its 1-based position.
    const hasId = isPlainObject(q) && typeof q.id === "string" && q.id !== "";
    const ref = hasId ? q.id : `question #${index + 1}`;

    if (!isPlainObject(q)) {
      errors.push(error(ref, "(question)", "question must be an object"));
      return;
    }

    for (const field of ["id", "topic", "question", "explanation"]) errors.push(...checkString(q, field, ref));
    errors.push(...checkOptions(q, ref));
    errors.push(...checkAnswer(q, ref));
    errors.push(...checkCode(q, ref));

    // Report each repeated id once, however many times it appears.
    if (hasId) {
      if (seen.has(q.id) && !reportedDuplicates.has(q.id)) {
        reportedDuplicates.add(q.id);
        errors.push(error(ref, "id", `duplicate id "${q.id}"`));
      }
      seen.add(q.id);
    }
  });

  return errors;
}
