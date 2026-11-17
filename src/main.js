import "./style.css";
import rawGuide from "./data/guide.json?raw";
import rawQuestions from "./data/questions.json?raw";
import { buildGuideIndex, validateGuide } from "./guide.js";
import { parseJson } from "./parse.js";
import { initUI, showErrors } from "./ui.js";
import { validateBank } from "./validate.js";

// With any error (bad JSON, bad guide or bad questions) in either file, only the error screen is shown
// and no round can start. The errors of both files are listed together.
const parsedGuide = parseJson(rawGuide, "guide.json");
const guideErrors = parsedGuide.errors ?? validateGuide(parsedGuide.data);
const guideUsable = guideErrors.length === 0;
const guideIndex = guideUsable ? buildGuideIndex(parsedGuide.data) : new Map();

// Without a usable guide the guideId existence check is skipped: it would only give misleading errors.
const parsedBank = parseJson(rawQuestions, "questions.json");
const bankErrors = parsedBank.errors ?? validateBank(parsedBank.data, guideUsable ? new Set(guideIndex.keys()) : undefined);

const errors = [...guideErrors, ...bankErrors];
if (errors.length > 0) {
  showErrors(errors);
} else {
  initUI(parsedBank.data, guideIndex);
}
