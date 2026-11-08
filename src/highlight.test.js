import { describe, it, expect } from 'vitest';
import { highlightCode } from './highlight.js';

// Minimal fake element: the node environment has no DOM.
// highlight.js uses only these fields on the element.
const fakeElement = (text) => {
  const el = { textContent: text, innerHTML: '', className: '', dataset: {}, children: [] };
  // highlight.js adds classes through classList; keep them in className
  el.classList = {
    contains: (name) => el.className.split(/\s+/).includes(name),
    add: (name) => {
      if (!el.classList.contains(name)) el.className = `${el.className} ${name}`.trim();
    },
  };
  return el;
};

describe('highlightCode', () => {
  it('colors a sql snippet with hljs token spans and keeps the text unchanged', () => {
    const code = "SELECT name, COUNT(*) FROM users WHERE age > 18 AND city = 'Paris';";
    const el = fakeElement(code);
    highlightCode(el, 'sql');

    expect(el.className).toContain('language-sql');
    expect(el.innerHTML).toMatch(/<span class="hljs-keyword">SELECT<\/span>/);
    expect(el.innerHTML).toMatch(/<span class="hljs-string">/);
    // Removing the tags and decoding entities gives back the original text
    const text = el.innerHTML
      .replace(/<[^>]+>/g, '')
      .replace(/&#x27;/g, "'")
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&');
    expect(text).toBe(code);
  });

  it('leaves an unsupported language as plain text without throwing', () => {
    const el = fakeElement('DISPLAY "HELLO".');
    expect(() => highlightCode(el, 'cobol')).not.toThrow();
    expect(el.textContent).toBe('DISPLAY "HELLO".');
    expect(el.innerHTML).toBe('');
    expect(el.className).toBe('');
  });
});
