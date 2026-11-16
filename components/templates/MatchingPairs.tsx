"use client";

import { useState } from "react";
import type { z } from "zod";
import type { MatchingPairsContentSchema } from "../../lib/schemas";

type Content = z.infer<typeof MatchingPairsContentSchema>;

// Same shuffle on the server and in the browser, so the page doesn't mismatch.
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed || 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MatchingPairs({ content }: { content: Content }) {
  const [round, setRound] = useState(1);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [wrongRight, setWrongRight] = useState<string | null>(null);

  const total = content.pairs.length;

  if (total === 0) {
    return <p className="p-6 text-center text-gray-600">No pairs yet.</p>;
  }

  const rights = seededShuffle(
    content.pairs.map((p) => ({ id: p.id, text: p.right })),
    round * 7919 + total
  );

  const finished = matched.length === total;

  if (finished) {
    const score = total - mistakes.length;
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">All matched!</h2>
        <p className="text-xl mt-2">
          You scored {score} / {total}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Pairs you matched on the first try.
        </p>
        <button
          className="mt-6 rounded-xl bg-blue-600 text-white px-6 py-3 min-h-[44px]"
          onClick={() => {
            setRound((r) => r + 1);
            setMatched([]);
            setMistakes([]);
            setSelectedLeft(null);
            setWrongRight(null);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  function chooseLeft(id: string) {
    if (matched.includes(id)) return;
    setWrongRight(null);
    setSelectedLeft(selectedLeft === id ? null : id);
  }

  function chooseRight(id: string) {
    if (!selectedLeft || matched.includes(id)) return;
    if (id === selectedLeft) {
      setMatched((m) => [...m, id]);
      setSelectedLeft(null);
      setWrongRight(null);
      return;
    }
    const leftId = selectedLeft;
    setMistakes((m) => (m.includes(leftId) ? m : [...m, leftId]));
    setWrongRight(id);
    setSelectedLeft(null);
    setTimeout(() => setWrongRight(null), 700);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="h-2 w-full rounded bg-gray-200 mb-3">
        <div
          className="h-2 rounded bg-blue-600"
          style={{ width: `${(matched.length / total) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">
        {matched.length} of {total} matched
      </p>
      <p aria-live="polite" className="mt-1 text-sm text-gray-700">
        {selectedLeft
          ? "Now tap the match on the right."
          : "Tap a term on the left, then its match on the right."}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {content.pairs.map((p) => {
            const done = matched.includes(p.id);
            const selected = selectedLeft === p.id;
            let style = "border-gray-300 bg-white";
            if (done) style = "border-green-600 bg-green-50";
            else if (selected) style = "border-blue-600 bg-blue-50";
            return (
              <button
                key={p.id}
                onClick={() => chooseLeft(p.id)}
                disabled={done}
                aria-pressed={selected}
                className={`w-full min-h-[44px] rounded-xl border-2 p-3 text-left break-words ${style}`}
              >
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rights.map((r) => {
            const done = matched.includes(r.id);
            let style = "border-gray-300 bg-white";
            if (done) style = "border-green-600 bg-green-50";
            else if (wrongRight === r.id) style = "border-red-600 bg-red-50";
            return (
              <button
                key={r.id}
                onClick={() => chooseRight(r.id)}
                disabled={done || !selectedLeft}
                className={`w-full min-h-[44px] rounded-xl border-2 p-3 text-left break-words ${style}`}
              >
                {r.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}