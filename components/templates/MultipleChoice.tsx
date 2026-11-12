"use client";
import { useState } from "react";
import type { z } from "zod";
import type { MultipleChoiceContentSchema } from "../../lib/schemas";

type Content = z.infer<typeof MultipleChoiceContentSchema>;

export default function MultipleChoice({ content }: { content: Content }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const total = content.questions.length;

  if (total === 0) {
    return <p className="p-6 text-center text-gray-600">No questions yet.</p>;
  }

  if (index >= total) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">All done!</h2>
        <p className="text-xl mt-2">You scored {score} / {total}</p>
        <button
          className="mt-6 rounded-xl bg-blue-600 text-white px-6 py-3 min-h-[44px]"
          onClick={() => { setIndex(0); setScore(0); setSelected(null); }}
        >
          Try again
        </button>
      </div>
    );
  }

  const q = content.questions[index];
  const answered = selected !== null;

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === q.correctAnswerIndex) setScore((s) => s + 1);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="h-2 w-full rounded bg-gray-200 mb-3">
        <div className="h-2 rounded bg-blue-600" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <p className="text-sm text-gray-500">Question {index + 1} of {total}</p>
      <h2 className="text-xl font-semibold my-3 break-words">{q.question}</h2>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let style = "border-gray-300";
          if (answered && i === q.correctAnswerIndex) style = "border-green-600 bg-green-50";
          else if (answered && i === selected) style = "border-red-600 bg-red-50";
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`w-full text-left border-2 rounded-xl p-4 min-h-[44px] break-words ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-4" aria-live="polite">
          <p className="font-semibold">
            {selected === q.correctAnswerIndex ? "Correct!" : "Not quite."}
          </p>
          <p className="text-gray-700 mt-1">{q.explanation}</p>
          <button
            className="mt-3 rounded-xl bg-blue-600 text-white px-6 py-3 min-h-[44px]"
            onClick={() => { setIndex(index + 1); setSelected(null); }}
          >
            {index + 1 === total ? "See score" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}