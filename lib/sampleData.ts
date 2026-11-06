import type { ActivityContent } from "./schemas";

type Content<T extends ActivityContent["type"]> = Extract<ActivityContent, { type: T }>;

export const sampleMultipleChoice: Content<"multiple_choice"> = {
  type: "multiple_choice",
  title: "Photosynthesis basics",
  instructions: "Pick the best answer.",
  questions: [
    {
      id: "q1",
      question: "Which gas do plants take in for photosynthesis?",
      options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
      correctAnswerIndex: 1,
      explanation: "Plants absorb carbon dioxide through tiny pores called stomata.",
    },
    {
      id: "q2",
      question: "Where does photosynthesis mainly happen in a plant cell?",
      options: ["Nucleus", "Vacuole", "Chloroplast", "Cell wall"],
      correctAnswerIndex: 2,
      explanation: "Chloroplasts contain chlorophyll, which captures sunlight.",
    },
  ],
};

export const sampleTrueFalse: Content<"true_false"> = {
  type: "true_false",
  title: "Photosynthesis: true or false?",
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
};

export const sampleFlashcards: Content<"flashcards"> = {
  type: "flashcards",
  title: "Plant cell parts",
  instructions: "Tap a card to flip it.",
  cards: [
    { id: "c1", front: "Chloroplast", back: "Makes food using sunlight" },
    { id: "c2", front: "Cell wall", back: "Keeps the cell rigid" },
    { id: "c3", front: "Vacuole", back: "Stores water" },
  ],
};