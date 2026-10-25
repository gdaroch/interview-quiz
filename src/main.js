import "./style.css";
import questions from "./questions.json";
import { initUI } from "./ui.js";

// Validation and the error screen come later; for now the game starts directly.
initUI(questions);
