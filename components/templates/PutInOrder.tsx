"use client";

import { useState } from "react";
import type { z } from "zod";
import type { PutInOrderContentSchema } from "../../lib/schemas";

type Content = z.infer<typeof PutInOrderContentSchema>;

// The same shuffle on the server and in the browser, so the page doesn't mismatch.
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

function correctOrder(content: Content): string[] {
  return [...content.items]
    .sort((a, b) => a.correctOrderIndex - b.correctOrderIndex)
    .map((i) => i.id);
}

function startingOrder(content: Content, round: number): string[] {
  const correct = correctOrder(content);
  if (correct.length < 2) return correct;
  let seed = round * 7919 + correct.length;
  let order = seededShuffle(correct, seed);
  // Never start with the answer already in place.
  for (
    let tries = 0;
    tries < 10 && order.every((id, i) => id === correct[i]);
    tries++
  ) {
    seed += 1;
    order = seededShuffle(correct, seed);
  }
  return order;
}

export default function PutInOrder({ content }: { content: Content }) {
  const [round, setRound] = useState(1);
  const [order, setOrder] = useState<string[]>(() => startingOrder(content, 1));
  const [checked, setChecked] = useState(false);

  const total = content.items.length;

  if (total === 0) {
    return <p className="p-6 text-center text-gray-600">No items yet.</p>;
  }

  const correct = correctOrder(content);
  const textById = new Map(content.items.map((i) => [i.id, i.text]));
  const rightCount = order.filter((id, i) => id === correct[i]).length;
  const perfect = rightCount === total;

  function move(from: number, to: number) {
    if (checked || to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
  }

  function startAgain() {
    const nextRound = round + 1;
    setRound(nextRound);
    setOrder(startingOrder(content, nextRound));
    setChecked(false);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <p className="text-sm text-gray-500">{total} items</p>
      <p className="mt-1 text-sm text-gray-700">
        Use the arrows to put the items in the right order, then press Check.
      </p>

      <ol className="mt-3 space-y-2">
        {order.map((id, i) => {
          let style = "border-gray-300 bg-white";
          if (checked) {
            style =
              id === correct[i]
                ? "border-green-600 bg-green-50"
                : "border-red-600 bg-red-50";
          }
          return (
            <li
              key={id}
              className={`flex items-center gap-2 rounded-xl border-2 p-2 ${style}`}
            >
              <span className="w-6 text-center text-sm text-gray-500">
                {i + 1}
              </span>
              <span className="flex-1 break-words">{textById.get(id)}</span>
              <button
                aria-label={`Move item ${i + 1} up`}
                disabled={checked || i === 0}
                onClick={() => move(i, i - 1)}
                className="min-h-[44px] min-w-[44px] rounded-lg border border-gray-300 disabled:opacity-40"
              >
                ▲
              </button>
              <button
                aria-label={`Move item ${i + 1} down`}
                disabled={checked || i === order.length - 1}
                onClick={() => move(i, i + 1)}
                className="min-h-[44px] min-w-[44px] rounded-lg border border-gray-300 disabled:opacity-40"
              >
                ▼
              </button>
            </li>
          );
        })}
      </ol>

      {!checked ? (
        <button
          onClick={() => setChecked(true)}
          className="mt-4 min-h-[44px] rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          Check my order
        </button>
      ) : (
        <div className="mt-4" aria-live="polite">
          <p className="text-lg font-semibold">
            {perfect ? "Perfect! " : ""}You scored {rightCount} / {total}
          </p>
          <p className="text-sm text-gray-600">Items in the right place.</p>
          <div className="mt-3 flex gap-3">
            {!perfect && (
              <button
                onClick={() => setChecked(false)}
                className="min-h-[44px] rounded-xl border-2 border-gray-300 px-5 py-3"
              >
                Keep trying
              </button>
            )}
            <button
              onClick={startAgain}
              className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-3 text-white"
            >
              Start again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}