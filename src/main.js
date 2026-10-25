import "./style.css";
import rawQuestions from "./questions.json?raw";
import { parseBank } from "./parse.js";
import { initUI, showErrors } from "./ui.js";
import { validateBank } from "./validate.js";

// With any error (bad JSON or bad questions), only the error screen is shown and no round can start.
const parsed = parseBank(rawQuestions);
const errors = parsed.errors ?? validateBank(parsed.data);
if (errors.length > 0) {
  showErrors(errors);
} else {
  initUI(parsed.data);
}
