import MarkdownIt from "markdown-it";
import { highlightToHtml } from "./highlight.js";
import { error, isPlainObject } from "./validate.js";

// Raw HTML is disabled (escaped as text): the app's only innerHTML receives this output,
// so a guide line can never inject a tag or script.
const md = new MarkdownIt({ html: false, highlight: highlightToHtml });

/** Matches the target of a link to a section, such as `](#js-scope)`. */
const SECTION_LINK = /\]\(#([^)\s]*)\)/g;

/**
 * Lists the section ids linked from a list of lines, skipping fenced code blocks.
 * @param {Array<string>} lines - The lines of one section.
 * @returns {Array<string>} The linked ids, in order of appearance.
 */
function findLinks(lines) {
  const ids = [];
  let inFence = false;
  for (const line of lines) {
    if (typeof line !== "string") continue;
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    for (const match of line.matchAll(SECTION_LINK)) ids.push(match[1]);
  }
  return ids;
}

/**
 * Checks the shape of one section and reports its repeated id.
 * @param {unknown} section - The section to check.
 * @param {number} index - The 0-based position of the section in its chapter.
 * @param {Map<string, number>} counts - How many times each section id was seen; updated here.
 * @param {Set<string>} reported - The duplicated ids already reported; updated here.
 * @returns {Array<object>} The errors found, empty when the section is valid.
 */
function checkSection(section, index, counts, reported) {
  const hasId = isPlainObject(section) && typeof section.id === "string" && section.id !== "";
  const ref = hasId ? section.id : `section #${index + 1}`;
  if (!isPlainObject(section)) return [error(ref, "(section)", "section must be an object")];

  const errors = [];
  for (const field of ["id", "title"]) {
    if (typeof section[field] !== "string") errors.push(error(ref, field, `"${field}" must be a string`));
  }
  if (!Array.isArray(section.lines)) {
    errors.push(error(ref, "lines", '"lines" must be an array'));
  } else {
    section.lines.forEach((line, i) => {
      if (typeof line !== "string") errors.push(error(ref, `lines[${i}]`, "line must be a string"));
    });
  }

  // Report each repeated id once, however many times it appears.
  if (typeof section.id === "string") {
    const count = (counts.get(section.id) ?? 0) + 1;
    counts.set(section.id, count);
    if (count > 1 && !reported.has(section.id)) {
      reported.add(section.id);
      errors.push(error(ref, "id", `duplicate id "${section.id}"`));
    }
  }
  return errors;
}

/**
 * Checks the whole study guide and lists every problem found.
 * @param {unknown} data - The parsed content of guide.json.
 * @returns {Array<object>} The errors found, empty when the guide is valid.
 */
export function validateGuide(data) {
  if (!isPlainObject(data) || !Array.isArray(data.chapters)) {
    return [error("guide", "(root)", 'The guide must be an object with a "chapters" array')];
  }

  const errors = [];
  const counts = new Map();
  const reported = new Set();
  const sections = [];

  data.chapters.forEach((chapter, ci) => {
    const hasId = isPlainObject(chapter) && typeof chapter.id === "string" && chapter.id !== "";
    const ref = hasId ? chapter.id : `chapter #${ci + 1}`;
    if (!isPlainObject(chapter)) {
      errors.push(error(ref, "(chapter)", "chapter must be an object"));
      return;
    }
    for (const field of ["id", "title"]) {
      if (typeof chapter[field] !== "string") errors.push(error(ref, field, `"${field}" must be a string`));
    }
    if (!Array.isArray(chapter.sections)) {
      errors.push(error(ref, "sections", '"sections" must be an array'));
      return;
    }
    chapter.sections.forEach((section, si) => {
      errors.push(...checkSection(section, si, counts, reported));
      if (isPlainObject(section)) sections.push({ section, si });
    });
  });

  // Links are checked against every well-formed section, once all are collected.
  const ids = new Set(counts.keys());
  for (const { section, si } of sections) {
    if (!Array.isArray(section.lines)) continue;
    const ref = typeof section.id === "string" && section.id !== "" ? section.id : `section #${si + 1}`;
    for (const target of findLinks(section.lines)) {
      if (!ids.has(target)) errors.push(error(ref, "lines", `link to unknown section "${target}"`));
    }
  }

  return errors;
}

/**
 * Indexes the sections of a valid guide by id.
 * @param {object} data - The parsed and already validated content of guide.json.
 * @returns {Map<string, {title: string, chapterTitle: string, lines: Array<string>}>} The sections by id.
 */
export function buildGuideIndex(data) {
  const index = new Map();
  for (const chapter of data.chapters) {
    for (const section of chapter.sections) {
      index.set(section.id, { title: section.title, chapterTitle: chapter.title, lines: section.lines });
    }
  }
  return index;
}

/**
 * Renders the markdown lines of a section as an HTML string.
 * @param {{lines: Array<string>}} section - The section to render.
 * @returns {string} The HTML; raw HTML in the lines is escaped.
 */
export function renderSection(section) {
  return md.render(section.lines.join("\n"));
}
