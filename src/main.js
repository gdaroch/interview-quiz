import './style.css';

// Dummy data. Real questions will come from questions.json.
const QUESTIONS = [
  {
    topic: "javascript",
    question: "What does this code log?",
    code: [
      "for (var i = 0; i < 3; i++) {",
      "  setTimeout(() => console.log(i), 0);",
      "}",
      "",
      "// edge: if (a < b && c > d) { ... }"
    ],
    // Wireframe only: hand-colored approximation of what highlight.js will produce.
    // The real app sets plain text and lets highlight.js add the spans.
    codeHtml:
      '<span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>; i &lt; <span class="hljs-number">3</span>; i++) {\n' +
      '  <span class="hljs-built_in">setTimeout</span>(() =&gt; <span class="hljs-variable">console</span>.<span class="hljs-title">log</span>(i), <span class="hljs-number">0</span>);\n' +
      '}\n\n' +
      '<span class="hljs-comment">// edge: if (a &lt; b &amp;&amp; c &gt; d) { ... }</span>',
    options: ["0 1 2", "3 3 3", "undefined undefined undefined", "It throws a ReferenceError"],
    answer: 1,
    explanation: "var is function-scoped, so all three callbacks share the same i. By the time they run, the loop has finished and i is 3."
  },
  {
    topic: "architecture",
    question: "A service must keep working when one of its downstream dependencies becomes slow or unavailable, without letting the failure cascade to every caller and exhaust its own thread pool or connection limits while waiting. Which pattern is designed for exactly this situation?",
    options: [
      "Circuit breaker, which stops calling a failing dependency for a period and fails fast instead of waiting on timeouts that pile up",
      "Singleton",
      "Observer",
      "Adapter, which converts the interface of a dependency into the one the clients expect to use in their own code"
    ],
    answer: 0,
    explanation: "A circuit breaker tracks failures and, once a threshold is crossed, short-circuits calls so callers fail fast. Combined with timeouts it prevents a slow dependency from consuming all resources."
  },
  {
    topic: "algorithms",
    question: "What is the average time complexity of looking up a key in a hash table?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 0,
    explanation: "With a good hash function and a bounded load factor, lookups take constant time on average. Worst case with many collisions degrades to O(n)."
  }
];
const DEMO_TOTAL = 15;       // used by the "Results" shortcut only
const DEMO_SCORE = 12;

const $ = (id) => document.getElementById(id);
const screens = { start: $("screen-start"), question: $("screen-question"), results: $("screen-results"), error: $("screen-error") };
let state = { i: 0, score: 0, selected: null, submitted: false };

function show(name) {
  for (const key in screens) screens[key].hidden = key !== name;
}

function renderQuestion() {
  const q = QUESTIONS[state.i];
  const last = state.i === QUESTIONS.length - 1;

  $("q-progress").textContent = "Question " + (state.i + 1) + " of " + QUESTIONS.length;
  $("q-score").textContent = "Score: " + state.score;
  $("q-bar").style.width = (state.i / QUESTIONS.length * 100) + "%";
  $("q-topic").textContent = q.topic;
  $("q-text").textContent = q.question;

  // textContent keeps "<" and "&" literal and never parses markup
  $("q-code").hidden = !q.code;
  if (q.code) {
    if (q.codeHtml) $("q-code-body").innerHTML = q.codeHtml;   // wireframe preview of colored output
    else $("q-code-body").textContent = q.code.join("\n");
  }

  const box = $("q-options");
  box.replaceChildren();
  q.options.forEach((text, idx) => {
    const label = document.createElement("label");
    label.className = "option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option";
    input.value = idx;
    const span = document.createElement("span");
    span.textContent = text;
    label.append(input, span);
    box.append(label);

    if (state.selected === idx) { input.checked = true; label.classList.add("selected"); }

    if (state.submitted) {
      input.disabled = true;
      label.classList.add("locked");
      const tag = document.createElement("span");
      tag.className = "tag";
      if (idx === q.answer) { label.classList.add("correct"); tag.textContent = "Correct"; label.append(tag); }
      else if (idx === state.selected) { label.classList.add("incorrect"); tag.textContent = "Your answer"; label.append(tag); }
    }
  });

  const verdict = $("q-verdict");
  $("q-feedback").hidden = !state.submitted;
  if (state.submitted) {
    const right = state.selected === q.answer;
    verdict.textContent = right ? "Correct!" : "Incorrect";
    verdict.className = "verdict " + (right ? "ok" : "bad");
    $("q-explanation").textContent = q.explanation;
  }

  $("btn-submit").hidden = state.submitted;
  $("btn-submit").disabled = state.selected === null;
  $("btn-next").hidden = !state.submitted;
  $("btn-next").textContent = last ? "See results" : "Next";
}

function showResults(score, total) {
  $("r-score").textContent = score;
  $("r-total").textContent = total;
  $("r-note").textContent = score / total >= 0.8 ? "Great work!" : "Keep practicing.";
  show("results");
}

function startRound() {
  state = { i: 0, score: 0, selected: null, submitted: false };
  renderQuestion();
  show("question");
}

// Real flow
$("btn-start").addEventListener("click", startRound);
$("btn-again").addEventListener("click", startRound);

$("q-options").addEventListener("change", (e) => {
  if (state.submitted) return;
  state.selected = Number(e.target.value);
  renderQuestion();
  // keep keyboard focus on the chosen radio after the re-render
  document.querySelector('#q-options input:checked').focus();
});

$("btn-submit").addEventListener("click", () => {
  if (state.selected === null) return;
  state.submitted = true;
  if (state.selected === QUESTIONS[state.i].answer) state.score++;
  renderQuestion();
});

$("btn-next").addEventListener("click", () => {
  if (state.i === QUESTIONS.length - 1) { showResults(state.score, QUESTIONS.length); return; }
  state.i++;
  state.selected = null;
  state.submitted = false;
  renderQuestion();
});

// Wireframe shortcuts
$("start-count").textContent = QUESTIONS.length;
document.querySelector(".wf-bar").addEventListener("click", (e) => {
  const go = e.target.dataset.go;
  if (!go) return;
  if (go === "start") show("start");
  else if (go === "error") show("error");
  else if (go === "results") showResults(DEMO_SCORE, DEMO_TOTAL);
  else if (go === "question") startRound();
  else {
    state = { i: 0, score: 0, selected: go === "ok" ? QUESTIONS[0].answer : 0, submitted: true };
    if (go === "ok") state.score = 1;
    renderQuestion();
    show("question");
  }
});
