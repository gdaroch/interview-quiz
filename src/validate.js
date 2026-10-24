const isPlainObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

function error(questionRef, field, message) {
  return { questionRef, field, message };
}

function checkString(q, field, ref) {
  if (typeof q[field] !== "string") return [error(ref, field, `"${field}" must be a string`)];
  return [];
}

function checkOptions(q, ref) {
  if (!Array.isArray(q.options)) return [error(ref, "options", '"options" must be an array')];
  const errors = [];
  if (q.options.length < 2) errors.push(error(ref, "options", '"options" must have at least 2 entries'));
  q.options.forEach((opt, i) => {
    if (typeof opt !== "string" || opt.trim() === "") {
      errors.push(error(ref, `options[${i}]`, "option must be a non-empty string"));
    }
  });
  return errors;
}

function checkAnswer(q, ref) {
  if (!Number.isInteger(q.answer)) return [error(ref, "answer", '"answer" must be an integer')];
  if (Array.isArray(q.options) && (q.answer < 0 || q.answer >= q.options.length)) {
    return [error(ref, "answer", `"answer" must be between 0 and ${q.options.length - 1}`)];
  }
  return [];
}

function checkCode(q, ref) {
  if (q.code === undefined) return [];
  if (!isPlainObject(q.code)) return [error(ref, "code", '"code" must be an object')];
  const errors = [];
  const { language, lines } = q.code;
  if (typeof language !== "string" || language.trim() === "") {
    errors.push(error(ref, "code.language", '"code.language" must be a non-empty string'));
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    errors.push(error(ref, "code.lines", '"code.lines" must be a non-empty array'));
  } else {
    lines.forEach((line, i) => {
      if (typeof line !== "string") errors.push(error(ref, `code.lines[${i}]`, "code line must be a string"));
    });
  }
  return errors;
}

export function validateBank(data) {
  if (!Array.isArray(data)) return [error("bank", "(root)", "The question bank must be a list of questions")];
  if (data.length === 0) return [error("bank", "(root)", "The question bank is empty")];

  const errors = [];
  const seen = new Set();
  const reportedDuplicates = new Set();

  data.forEach((q, index) => {
    const hasId = isPlainObject(q) && typeof q.id === "string" && q.id !== "";
    const ref = hasId ? q.id : `question #${index + 1}`;

    if (!isPlainObject(q)) {
      errors.push(error(ref, "(question)", "question must be an object"));
      return;
    }

    for (const field of ["id", "topic", "question", "explanation"]) errors.push(...checkString(q, field, ref));
    errors.push(...checkOptions(q, ref));
    errors.push(...checkAnswer(q, ref));
    errors.push(...checkCode(q, ref));

    if (hasId) {
      if (seen.has(q.id) && !reportedDuplicates.has(q.id)) {
        reportedDuplicates.add(q.id);
        errors.push(error(ref, "id", `duplicate id "${q.id}"`));
      }
      seen.add(q.id);
    }
  });

  return errors;
}
