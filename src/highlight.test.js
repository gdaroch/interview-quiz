import { describe, it, expect } from 'vitest';
import { highlightCode, highlightToHtml } from './highlight.js';

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

  it('colors yaml and keeps the text unchanged', () => {
    const code = 'name: app\nreplicas: 3\nenabled: true';
    const el = fakeElement(code);
    highlightCode(el, 'yaml');

    expect(el.className).toContain('language-yaml');
    expect(el.innerHTML).toMatch(/<span class="hljs-/);
    expect(el.innerHTML.replace(/<[^>]+>/g, '')).toBe(code);
  });

  it('colors a dockerfile and keeps the text unchanged', () => {
    const code = 'FROM node:20\nRUN npm install\nCMD ["node", "index.js"]';
    const el = fakeElement(code);
    highlightCode(el, 'dockerfile');

    expect(el.className).toContain('language-dockerfile');
    expect(el.innerHTML).toMatch(/<span class="hljs-keyword">FROM<\/span>/);
    const text = el.innerHTML.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"');
    expect(text).toBe(code);
  });
});

describe('highlightToHtml', () => {
  const wrapper = (lang) => new RegExp(`^<pre><code class="hljs language-${lang}">[\\s\\S]*</code></pre>$`);

  it('wraps a known language in pre/code with hljs token spans', () => {
    const html = highlightToHtml('SELECT name FROM users;', 'sql');
    expect(html).toMatch(wrapper('sql'));
    expect(html).toMatch(/<span class="hljs-keyword">SELECT<\/span>/);
  });

  it('highlights yaml', () => {
    const html = highlightToHtml('name: app\nenabled: true', 'yaml');
    expect(html).toMatch(wrapper('yaml'));
    expect(html).toMatch(/<span class="hljs-/);
  });

  it('highlights dockerfile', () => {
    const html = highlightToHtml('FROM node:20\nRUN npm install', 'dockerfile');
    expect(html).toMatch(wrapper('dockerfile'));
    expect(html).toMatch(/<span class="hljs-keyword">FROM<\/span>/);
  });

  it.each(['js', 'jsx', 'ts'])('accepts the %s alias', (alias) => {
    const html = highlightToHtml('const x = 1;', alias);
    expect(html).toMatch(wrapper(alias));
    expect(html).toMatch(/<span class="hljs-keyword">const<\/span>/);
  });

  it('returns an empty string for an unknown language', () => {
    expect(highlightToHtml('DISPLAY "HELLO".', 'cobol')).toBe('');
  });

  it.each(['', undefined])('returns an empty string for an empty language (%s)', (lang) => {
    expect(highlightToHtml('const x = 1;', lang)).toBe('');
  });

  it('escapes <, > and & as text instead of tags', () => {
    const html = highlightToHtml('const a = 1 < 2 && 3 > 2; // <b>', 'javascript');
    expect(html).toContain('&lt;');
    expect(html).toContain('&gt;');
    expect(html).toContain('&amp;&amp;');
    expect(html).not.toContain('<b>');
  });
});
