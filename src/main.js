import "./style.css";
import rawQuestions from "./data/questions.json?raw";
import { parseJson } from "./parse.js";
import { initUI, showErrors } from "./ui.js";
import { validateBank } from "./validate.js";

// With any error (bad JSON or bad questions), only the error screen is shown and no round can start.
const parsed = parseJson(rawQuestions, "questions.json");
const errors = parsed.errors ?? validateBank(parsed.data);
if (errors.length > 0) {
  showErrors(errors);
} else {
  initUI(parsed.data);
}
