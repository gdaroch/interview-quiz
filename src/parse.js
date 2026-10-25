/**
 * Parses the raw text of the question bank as JSON.
 * @param {string} text - The raw content of questions.json.
 * @returns {{data: unknown} | {errors: Array<object>}} The data, or one error if not JSON.
 */
export function parseBank(text) {
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return {
      errors: [{ questionRef: "questions.json", field: "(file)", message: "Invalid JSON: " + error.message }],
    };
  }
}
