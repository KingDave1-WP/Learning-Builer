import { z } from "zod";

// 1. Multiple Choice Schema
export const MultipleChoiceSchema = z.object({
  type: z.literal("multiple_choice"),
  title: z.string(),
  instructions: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswerIndex: z.number().min(0).max(3),
      explanation: z.string(),
    })
  ),
});

// 2. True or False Schema
export const TrueFalseSchema = z.object({
  type: z.literal("true_false"),
  title: z.string(),
  instructions: z.string(),
  statements: z.array(
    z.object({
      id: z.string(),
      statement: z.string(),
      isTrue: z.boolean(),
      explanation: z.string(),
    })
  ),
});

// 3. Flashcards Schema
export const FlashcardsSchema = z.object({
  type: z.literal("flashcards"),
  title: z.string(),
  instructions: z.string(),
  cards: z.array(
    z.object({
      id: z.string(),
      front: z.string(),
      back: z.string(),
    })
  ),
});

// 4. Matching Pairs Schema
export const MatchingPairsSchema = z.object({
  type: z.literal("matching"),
  title: z.string(),
  instructions: z.string(),
  pairs: z.array(
    z.object({
      id: z.string(),
      left: z.string(),
      right: z.string(),
    })
  ),
});

// 5. Put in Order Schema
export const PutInOrderSchema = z.object({
  type: z.literal("order"),
  title: z.string(),
  instructions: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      correctOrderIndex: z.number(),
    })
  ),
});

// Combined Activity Schema union
export const ActivitySchema = z.discriminatedUnion("type", [
  MultipleChoiceSchema,
  TrueFalseSchema,
  FlashcardsSchema,
  MatchingPairsSchema,
  PutInOrderSchema,
]);

export type ActivityContent = z.infer<typeof ActivitySchema>;