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

export const sampleMatching: Sample<"matching-pairs"> = {
  title: "Parts of a plant cell",
  type: "matching-pairs",
  is_published: true,
  content: {
    instructions: "Match each part to what it does.",
    pairs: [
      { id: "m1", left: "Chloroplast", right: "Makes food using sunlight" },
      { id: "m2", left: "Cell wall", right: "Keeps the cell rigid" },
      { id: "m3", left: "Vacuole", right: "Stores water" },
      { id: "m4", left: "Nucleus", right: "Controls the cell" },
    ],
  },
};

export const sampleOrdering: Sample<"put-in-order"> = {
  title: "Steps of photosynthesis",
  type: "put-in-order",
  is_published: true,
  content: {
    instructions: "Put the steps in the right order.",
    items: [
      { id: "o1", text: "Sunlight hits the leaf and chlorophyll absorbs it", correctOrderIndex: 0 },
      { id: "o2", text: "Roots take in water and leaves take in carbon dioxide", correctOrderIndex: 1 },
      { id: "o3", text: "Light energy turns them into glucose", correctOrderIndex: 2 },
      { id: "o4", text: "Oxygen is released into the air", correctOrderIndex: 3 },
    ],
  },
};