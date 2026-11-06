"use client";
import { useState } from "react";
import type { ActivityContent } from "../../lib/schemas";

type Content = Extract<ActivityContent, { type: "flashcards" }>;

export default function Flashcards({ content }: { content: Content }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const total = content.cards.length;

  if (total === 0) {
    return <p className="p-6 text-center text-gray-600">No cards yet.</p>;
  }

  const card = content.cards[index];

  function go(direction: number) {
    setIndex(index + direction);
    setFlipped(false);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="h-2 w-full rounded bg-gray-200 mb-3">
        <div
          className="h-2 rounded bg-blue-600"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">Card {index + 1} of {total}</p>

      <button
        onClick={() => setFlipped(!flipped)}
        aria-label={flipped ? "Show front of card" : "Show back of card"}
        className="w-full h-56 my-3 [perspective:1000px]"
      >
        <div
          className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-white p-6 text-xl break-words [backface-visibility:hidden]">
            {card.front}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-blue-600 bg-blue-50 p-6 text-xl break-words [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            {card.back}
          </div>
        </div>
      </button>

      <p className="text-center text-sm text-gray-500 mb-3">Tap the card to flip it</p>

      <div className="flex justify-between gap-3">
        <button
          disabled={index === 0}
          onClick={() => go(-1)}
          className="px-5 py-3 min-h-[44px] rounded-xl border-2 border-gray-300 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={index === total - 1}
          onClick={() => go(1)}
          className="px-5 py-3 min-h-[44px] rounded-xl bg-blue-600 text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}