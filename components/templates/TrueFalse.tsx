"use client";
import { useState } from "react";
import type { z } from "zod";
import type { TrueFalseContentSchema } from "../../lib/schemas";

type Content = z.infer<typeof TrueFalseContentSchema>;

export default function TrueFalse({ content }: { content: Content }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const total = content.statements.length;

  if (total === 0) {
    return <p className="p-6 text-center text-gray-600">No statements yet.</p>;
  }

  if (index >= total) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">All done!</h2>
        <p className="text-xl mt-2">You scored {score} / {total}</p>
        <button
          className="mt-6 rounded-xl bg-blue-600 text-white px-6 py-3 min-h-[44px]"
          onClick={() => { setIndex(0); setScore(0); setPicked(null); }}
        >
          Try again
        </button>
      </div>
    );
  }

  const s = content.statements[index];
  const answered = picked !== null;

  function choose(value: boolean) {
    if (answered) return;
    setPicked(value);
    if (value === s.isTrue) setScore((n) => n + 1);
  }

  function buttonStyle(value: boolean) {
    if (!answered) return "border-gray-300";
    if (value === s.isTrue) return "border-green-600 bg-green-50";
    if (value === picked) return "border-red-600 bg-red-50";
    return "border-gray-200 opacity-50";
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="h-2 w-full rounded bg-gray-200 mb-3">
        <div className="h-2 rounded bg-blue-600" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <p className="text-sm text-gray-500">Statement {index + 1} of {total}</p>
      <h2 className="text-xl font-semibold my-4 break-words">{s.statement}</h2>

      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            onClick={() => choose(value)}
            className={`border-2 rounded-xl py-6 text-lg font-semibold min-h-[44px] ${buttonStyle(value)}`}
          >
            {value ? "True" : "False"}
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-4" aria-live="polite">
          <p className="font-semibold">
            {picked === s.isTrue ? "Correct!" : "Not quite."}
          </p>
          <p className="text-gray-700 mt-1 break-words">{s.explanation}</p>
          <button
            className="mt-3 rounded-xl bg-blue-600 text-white px-6 py-3 min-h-[44px]"
            onClick={() => { setIndex(index + 1); setPicked(null); }}
          >
            {index + 1 === total ? "See score" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}