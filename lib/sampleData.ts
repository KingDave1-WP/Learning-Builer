import type { GeneratedActivity } from "./schemas";

type Sample<T extends GeneratedActivity["type"]> = Extract<
  GeneratedActivity,
  { type: T }
>;

export const sampleMultipleChoice: Sample<"multiple-choice"> = {
  title: "Photosynthesis basics",
  type: "multiple-choice",
  is_published: true,
  content: {
    instructions: "Pick the best answer.",
    questions: [
      {
        id: "q1",
        question: "Which gas do plants take in for photosynthesis?",
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
        correctAnswerIndex: 1,
        explanation:
          "Plants absorb carbon dioxide through tiny pores called stomata.",
      },
      {
        id: "q2",
        question: "Where does photosynthesis mainly happen in a plant cell?",
        options: ["Nucleus", "Vacuole", "Chloroplast", "Cell wall"],
        correctAnswerIndex: 2,
        explanation: "Chloroplasts contain chlorophyll, which captures sunlight.",
      },
    ],
  },
};

export const sampleTrueFalse: Sample<"true-false"> = {
  title: "Photosynthesis: true or false?",
  type: "true-false",
  is_published: true,
  content: {
    instructions: "Decide if each statement is true or false.",
    statements: [
      {
        id: "s1",
        statement: "Plants release oxygen during photosynthesis.",
        isTrue: true,
        explanation: "Oxygen is a by-product of photosynthesis.",
      },
      {
        id: "s2",
        statement: "Photosynthesis happens only at night.",
        isTrue: false,
        explanation: "It needs light, so it happens in the day.",
      },
    ],
  },
};

export const sampleFlashcards: Sample<"flashcards"> = {
  title: "Plant cell parts",
  type: "flashcards",
  is_published: true,
  content: {
    instructions: "Tap a card to flip it.",
    cards: [
      { id: "c1", front: "Chloroplast", back: "Makes food using sunlight" },
      { id: "c2", front: "Cell wall", back: "Keeps the cell rigid" },
      { id: "c3", front: "Vacuole", back: "Stores water" },
    ],
  },
};