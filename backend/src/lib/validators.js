export function validateQuizQuestions(raw) {
  if (!Array.isArray(raw)) {
    throw new Error("Quiz questions must be an array.");
  }

  if (raw.length < 3 || raw.length > 15) {
    throw new Error("Quiz must have between 3 and 15 questions.");
  }

  return raw.map((item, index) => {
    const prompt = typeof item.prompt === "string" ? item.prompt.trim() : "";
    const options = Array.isArray(item.options)
      ? item.options.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean)
      : [];

    if (!prompt) {
      throw new Error(`Question ${index + 1} is missing a prompt.`);
    }
    if (options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options.`);
    }

    const correctIndex = Number(item.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      throw new Error(`Question ${index + 1} has an invalid correctIndex.`);
    }

    const explanation =
      typeof item.explanation === "string" ? item.explanation.trim() : undefined;

    return {
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `q${index + 1}`,
      prompt,
      options,
      correctIndex,
      explanation: explanation || undefined
    };
  });
}

export function validateQuizAnswers(questions, rawAnswers) {
  if (!Array.isArray(rawAnswers)) {
    throw new Error("answers must be an array.");
  }

  const questionIds = new Set(questions.map((q) => q.id));
  const seen = new Set();

  return rawAnswers.map((answer, index) => {
    const questionId =
      typeof answer.questionId === "string" ? answer.questionId.trim() : "";
    const selectedIndex = Number(answer.selectedIndex);

    if (!questionId || !questionIds.has(questionId)) {
      throw new Error(`Answer ${index + 1} references an unknown question.`);
    }
    if (seen.has(questionId)) {
      throw new Error(`Duplicate answer for question ${questionId}.`);
    }
    seen.add(questionId);

    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
      throw new Error(`Answer ${index + 1} has an invalid selectedIndex.`);
    }

    return { questionId, selectedIndex };
  });
}

export function scoreQuizAttempt(questions, answers) {
  const validatedAnswers = validateQuizAnswers(questions, answers);
  const answerMap = new Map(validatedAnswers.map((a) => [a.questionId, a.selectedIndex]));

  const breakdown = questions.map((question) => {
    const selectedIndex = answerMap.get(question.id);
    const answered = selectedIndex !== undefined;
    const correct = answered && selectedIndex === question.correctIndex;

    return {
      questionId: question.id,
      selectedIndex: answered ? selectedIndex : null,
      correctIndex: question.correctIndex,
      correct,
      explanation: question.explanation
    };
  });

  const answeredCount = breakdown.filter((b) => b.selectedIndex !== null).length;
  const correctCount = breakdown.filter((b) => b.correct).length;
  const total = questions.length;
  const scorePercent =
    total === 0 ? 0 : Math.round((correctCount / total) * 10000) / 100;

  return {
    scorePercent,
    correctCount,
    total,
    answeredCount,
    breakdown
  };
}

export function stripQuizAnswers(questions) {
  return questions.map(({ id, prompt, options }) => ({ id, prompt, options }));
}
