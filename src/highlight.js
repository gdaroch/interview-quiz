import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import dockerfile from "highlight.js/lib/languages/dockerfile";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("sql", sql);
// HTML is the xml grammar; it answers to the "html" alias.
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("dockerfile", dockerfile);

/**
 * Colors the code inside an element when its language is known, else leaves it plain.
 * @param {HTMLElement} element - The element whose text is code (set with textContent).
 * @param {string} language - The language name from the question bank.
 * @returns {void}
 */
export function highlightCode(element, language) {
  // Unknown languages (for example cobol) stay as plain text, with no error.
  if (!language || !hljs.getLanguage(language)) return;
  // Clear the old mark, or highlight.js skips an element it has already colored.
  delete element.dataset.highlighted;
  // Set the language so no auto-detection runs; the text stays escaped.
  element.className = `language-${language}`;
  hljs.highlightElement(element);
}

/**
 * Returns highlighted HTML for a code string, for markdown-it's highlight option.
 * @param {string} code - The raw code text.
 * @param {string} language - The language name from a fenced block.
 * @returns {string} A pre/code block, or "" for an unknown language (markdown-it then escapes it).
 */
export function highlightToHtml(code, language) {
  if (!language || !hljs.getLanguage(language)) return "";
  const { value } = hljs.highlight(code, { language, ignoreIllegals: true });
  return `<pre><code class="hljs language-${language}">${value}</code></pre>`;
}
