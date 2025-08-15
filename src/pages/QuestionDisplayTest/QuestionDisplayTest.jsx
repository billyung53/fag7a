import React, { useState } from "react";
import QuestionDisplay from "../../components/game/QuestionDisplay/QuestionDisplay";

// Manually edit this object to test various scenarios
const initialQuestion = {
  question: "Who painted the Mona Lisa?",
  correct_answer: "Leonardo da Vinci",
  incorrect_answers: ["Michelangelo", "Raphael", "Donatello"],
  category: "Art",
  type: "emoji",
  value: 200,
};

function buildAllAnswers(q) {
  // Ensure correct + incorrect combined & random order each reset
  const all = [q.correct_answer, ...q.incorrect_answers];
  return all.sort(() => Math.random() - 0.5);
}

export default function QuestionDisplayTest() {
  const [questionData, setQuestionData] = useState(() => {
    const base = { ...initialQuestion };
    return { ...base, allAnswers: buildAllAnswers(base) };
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerClick = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const reset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionData((prev) => {
      const base = { ...prev, allAnswers: buildAllAnswers(prev) };
      return base;
    });
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ marginBottom: 12 }}>QuestionDisplay Test Harness</h2>
      <p style={{ marginTop: 0, fontSize: 14 }}>
        Edit the object in <code>QuestionDisplayTest.jsx</code> to try different
        questions / answers. Use Reset to reshuffle answers.
      </p>
      <QuestionDisplay
        currentQuestion={questionData}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        onAnswerClick={handleAnswerClick}
      />
      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <button onClick={reset}>Reset / Reshuffle</button>
        <button
          onClick={() => {
            // Example alternate question
            const alt = {
              question: "What is the capital of Japan?",
              correct_answer: "Tokyo",
              incorrect_answers: ["Osaka", "Kyoto", "Nagoya"],
              category: "Geography",
              value: 300,
            };
            setQuestionData({ ...alt, allAnswers: buildAllAnswers(alt) });
            setSelectedAnswer(null);
            setShowResult(false);
          }}
        >
          Load Sample 2
        </button>
      </div>
    </div>
  );
}
