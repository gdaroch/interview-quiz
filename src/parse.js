/**
 * Parses the raw text of a JSON data file.
 * @param {string} text - The raw content of the file.
 * @param {string} fileName - The name of the file, used to name it in the error.
 * @returns {{data: unknown} | {errors: Array<object>}} The data, or one error if not JSON.
 */
export function parseJson(text, fileName) {
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return {
      errors: [{ questionRef: fileName, field: "(file)", message: "Invalid JSON: " + error.message }],
    };
  }
}
