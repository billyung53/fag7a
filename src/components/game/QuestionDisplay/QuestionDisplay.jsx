import React, { useState } from "react";
import "./QuestionDisplay.css";

// Extracted from Game.jsx; styling and class names unchanged
export default function QuestionDisplay({
  currentQuestion,
  selectedAnswer,
  showResult,
  onAnswerClick,
}) {
  if (!currentQuestion) return null;

  const [showAnswer, setShowAnswer] = useState(false); // for 'qa' type
  const type = (currentQuestion.type || "").toLowerCase();
  const isQA = type === "qa";
  const isMCQ = type === "mcq" || type === "multiple" || !type; // default to MCQ if type missing
  const isEmoji = type === "emoji";

  console.log("Question:", currentQuestion);

  // Debug log (non-blocking)
  // console.log("Question:", currentQuestion);

  return (
    <div className="question-display">
      <div className="question-header">{/* Timer handled externally */}</div>
      <div className="question-text">
        <h3>{currentQuestion.question}</h3>
        {isEmoji && (
          <div className="emoji">{currentQuestion.incorrect_answers?.[0]}</div>
        )}
      </div>

      {isMCQ && (
        <div className="answers-grid">
          {currentQuestion.allAnswers.map((answer, index) => {
            let buttonClass = "answer-btn";
            if (showResult) {
              if (answer === currentQuestion.correct_answer) {
                buttonClass += " correct";
              } else if (
                answer === selectedAnswer &&
                answer !== currentQuestion.correct_answer
              ) {
                buttonClass += " incorrect";
              }
            }
            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => onAnswerClick(answer)}
                disabled={showResult}
              >
                {answer}
              </button>
            );
          })}
        </div>
      )}

      {isEmoji && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            alignItems: "center",
          }}
        >
          {!showAnswer && !showResult && (
            <button
              className="answer-btn"
              onClick={() => setShowAnswer(true)}
              disabled={showResult}
            >
              Show Answer
            </button>
          )}
          {showAnswer && (
            <div
              className="answers-grid"
              style={{ gridTemplateColumns: "1fr" }}
            >
              <div className="answer-btn correct" style={{ cursor: "default" }}>
                {currentQuestion.correct_answer}
              </div>
            </div>
          )}
          {showAnswer && !showResult && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="answer-btn"
                onClick={() => onAnswerClick(currentQuestion.correct_answer)}
              >
                Correct
              </button>
              <button
                className="answer-btn"
                onClick={() => onAnswerClick("__incorrect__")}
              >
                Incorrect
              </button>
            </div>
          )}
        </div>
      )}

      {isQA && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            alignItems: "center",
          }}
        >
          {!showAnswer && !showResult && (
            <button
              className="answer-btn"
              onClick={() => setShowAnswer(true)}
              disabled={showResult}
            >
              Show Answer
            </button>
          )}
          {showAnswer && (
            <div
              className="answers-grid"
              style={{ gridTemplateColumns: "1fr" }}
            >
              <div className="answer-btn correct" style={{ cursor: "default" }}>
                {currentQuestion.correct_answer}
              </div>
            </div>
          )}
          {showAnswer && !showResult && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="answer-btn"
                onClick={() => onAnswerClick(currentQuestion.correct_answer)}
              >
                Correct
              </button>
              <button
                className="answer-btn"
                onClick={() => onAnswerClick("__incorrect__")}
              >
                Incorrect
              </button>
            </div>
          )}
        </div>
      )}
      {/* {showResult && (
        <div className="result-section">
          <p
            className={
              selectedAnswer === currentQuestion.correct_answer
                ? "correct-msg"
                : "incorrect-msg"
            }
          >
            {selectedAnswer === currentQuestion.correct_answer
              ? "Correct!"
              : "Time's up or Wrong Answer!"}
          </p>
        </div>
      )} */}
    </div>
  );
}
