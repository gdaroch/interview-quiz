import { QUESTIONS_PER_ROUND } from "./config.js";
import { createRound, filterByTopics, getTopics, isCorrect, countCorrect } from "./round.js";
import { highlightCode } from "./highlight.js";

/**
 * Finds an element by its id.
 * @param {string} id - The id of the element.
 * @returns {HTMLElement} The element.
 */
const $ = (id) => document.getElementById(id);

/** The whole game state. The screen is drawn from this object. */
export const state = {
  screen: "start",
  round: [],
  index: 0,
  selections: [],
  selected: null,
  submitted: false,
  score: 0,
  selectedTopics: new Set(),
};

let bank = [];

/**
 * Shows only the screen with the given name and hides the others.
 * @param {string} name - One of "start", "question", "results", "error".
 * @returns {void}
 */
function showScreen(name) {
  for (const key of ["start", "question", "results", "error"]) {
    $(`screen-${key}`).hidden = key !== name;
  }
}

/**
 * Builds one option row for the question screen.
 * @param {object} q - The current question.
 * @param {number} idx - The position of the option in the shuffled list.
 * @returns {HTMLLabelElement} The option row.
 */
function buildOption(q, idx) {
  const label = document.createElement("label");
  label.className = "option";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "option";
  input.value = idx;
  const span = document.createElement("span");
  span.textContent = q.options[idx];
  label.append(input, span);

  if (state.selected === idx) {
    input.checked = true;
    label.classList.add("selected");
  }

  if (state.submitted) {
    input.disabled = true;
    label.classList.add("locked");
    const tag = document.createElement("span");
    tag.className = "tag";
    if (isCorrect(q, idx)) {
      label.classList.add("correct");
      tag.textContent = "Correct";
      label.append(tag);
    } else if (idx === state.selected) {
      label.classList.add("incorrect");
      tag.textContent = "Your answer";
      label.append(tag);
    }
  }
  return label;
}

/**
 * Shows the code snippet of a question as text, then colors it.
 * @param {object} q - The current question.
 * @returns {void}
 */
export function renderCode(q) {
  const pre = $("q-code");
  const body = $("q-code-body");
  pre.hidden = !q.code;
  body.className = "";
  if (!q.code) {
    body.textContent = "";
    return;
  }
  // textContent keeps "<" and "&" literal; the highlighter re-reads this text.
  body.textContent = q.code.lines.join("\n");
  highlightCode(body, q.code.language);
}

/**
 * Draws the question screen: progress, text, code, options, feedback and buttons.
 * @returns {void}
 */
export function renderQuestion() {
  const q = state.round[state.index];
  const total = state.round.length;
  const last = state.index === total - 1;

  $("q-progress").textContent = `Question ${state.index + 1} of ${total}`;
  $("q-score").textContent = `Score: ${state.score}`;
  $("q-bar").style.width = `${(state.index / total) * 100}%`;
  $("q-topic").textContent = q.topic;
  $("q-text").textContent = q.question;
  renderCode(q);

  $("q-options").replaceChildren(...q.options.map((_, idx) => buildOption(q, idx)));

  $("q-feedback").hidden = !state.submitted;
  if (state.submitted) {
    const right = isCorrect(q, state.selected);
    $("q-verdict").textContent = right ? "Correct!" : "Incorrect";
    $("q-verdict").className = `verdict ${right ? "ok" : "bad"}`;
    $("q-explanation").textContent = q.explanation;
  }

  $("btn-submit").hidden = state.submitted;
  $("btn-submit").disabled = state.selected === null;
  $("btn-next").hidden = !state.submitted;
  $("btn-next").textContent = last ? "See results" : "Next";
}

/**
 * Draws the results screen with the score out of the round length.
 * @returns {void}
 */
export function renderResults() {
  const total = state.round.length;
  const score = countCorrect(state.round, state.selections);
  $("r-score").textContent = score;
  $("r-total").textContent = total;
  $("r-note").textContent = score / total >= 0.8 ? "Great work!" : "Keep practicing.";
}

/**
 * Selects every topic of the bank, so the start screen begins with all of them chosen.
 * @returns {void}
 */
function resetTopics() {
  state.selectedTopics = new Set(getTopics(bank));
}

/**
 * Switches a topic between selected and not selected, then redraws the start screen keeping focus on that topic.
 * @param {string} topic - The topic name.
 * @returns {void}
 */
export function toggleTopic(topic) {
  if (state.selectedTopics.has(topic)) state.selectedTopics.delete(topic);
  else state.selectedTopics.add(topic);
  renderStart();
  // The buttons were rebuilt, so put keyboard focus back on the one that was toggled.
  [...$("start-topics").children].find((button) => button.textContent === topic).focus();
}

/**
 * Builds one toggle button for a topic.
 * @param {string} topic - The topic name, also used as the label.
 * @returns {HTMLButtonElement} The topic button.
 */
function buildTopicButton(topic) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "topic-btn";
  button.textContent = topic;
  const on = state.selectedTopics.has(topic);
  button.setAttribute("aria-pressed", String(on));
  button.classList.toggle("selected", on);
  button.addEventListener("click", () => toggleTopic(topic));
  return button;
}

/**
 * Draws the start screen: topic buttons, the number of questions a round will have, and the Start state.
 * @returns {void}
 */
function renderStart() {
  $("start-topics").replaceChildren(...getTopics(bank).map(buildTopicButton));
  const pool = filterByTopics(bank, state.selectedTopics);
  $("start-count").textContent = Math.min(QUESTIONS_PER_ROUND, pool.length);
  $("btn-start").disabled = state.selectedTopics.size === 0;
}

/**
 * Shows the current screen and moves focus to its main control.
 * @returns {void}
 */
export function render() {
  showScreen(state.screen);
  if (state.screen === "start") {
    renderStart();
    $("btn-start").focus();
  } else if (state.screen === "question") {
    renderQuestion();
    // Keep keyboard focus after the rebuild: Next, the chosen radio, or the first radio.
    const target = state.submitted
      ? $("btn-next")
      : document.querySelector("#q-options input:checked") || document.querySelector("#q-options input");
    target.focus();
  } else {
    renderResults();
    $("btn-again").focus();
  }
}

/**
 * Starts a new round with a zero score and shows the first question.
 * @returns {void}
 */
export function startRound() {
  state.round = createRound(filterByTopics(bank, state.selectedTopics), QUESTIONS_PER_ROUND);
  state.index = 0;
  state.selections = [];
  state.selected = null;
  state.submitted = false;
  state.score = 0;
  state.screen = "question";
  render();
}

/**
 * Goes back to the start screen with all topics selected again.
 * @returns {void}
 */
export function showStart() {
  resetTopics();
  state.screen = "start";
  render();
}

/**
 * Remembers the chosen option. It can change freely until the answer is submitted.
 * @param {number} index - The position of the chosen option.
 * @returns {void}
 */
export function selectOption(index) {
  if (state.submitted) return;
  state.selected = index;
  render();
}

/**
 * Locks the chosen answer, updates the score and shows the feedback.
 * @returns {void}
 */
export function submitAnswer() {
  // Ignore a second submit, or a submit with nothing chosen.
  if (state.submitted || state.selected === null) return;
  state.submitted = true;
  state.selections[state.index] = state.selected;
  if (isCorrect(state.round[state.index], state.selected)) state.score++;
  render();
}

/**
 * Moves to the next question, or to the results after the last one.
 * @returns {void}
 */
export function nextQuestion() {
  if (!state.submitted) return;
  if (state.index === state.round.length - 1) {
    state.screen = "results";
  } else {
    state.index++;
    state.selected = null;
    state.submitted = false;
  }
  render();
}

/**
 * Builds one error row: question reference, field and message.
 * @param {{questionRef: string, field: string, message: string}} err - One validation error.
 * @returns {HTMLLIElement} The list item.
 */
function buildError(err) {
  const li = document.createElement("li");
  const ref = document.createElement("code");
  ref.textContent = err.questionRef;
  const field = document.createElement("code");
  field.textContent = err.field;
  // The separators are plain text nodes, so no innerHTML is needed.
  li.append(ref, " · field ", field, `: ${err.message}`);
  return li;
}

/**
 * Shows only the error screen with one row per validation error.
 * @param {Array<object>} errors - The validation errors to list.
 * @returns {void}
 */
export function showErrors(errors) {
  document.querySelector("#screen-error .errors").replaceChildren(...errors.map(buildError));
  showScreen("error");
}

/**
 * Stores the question bank, connects the events once and shows the start screen.
 * @param {Array<object>} questions - The validated question bank.
 * @returns {void}
 */
export function initUI(questions) {
  bank = questions;
  $("btn-start").addEventListener("click", startRound);
  $("btn-again").addEventListener("click", showStart);
  $("btn-submit").addEventListener("click", submitAnswer);
  $("btn-next").addEventListener("click", nextQuestion);
  $("q-options").addEventListener("change", (e) => selectOption(Number(e.target.value)));
  showStart();
}
