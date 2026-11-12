import { z } from "zod";

export type ActivityType =
  | "multiple-choice"
  | "true-false"
  | "flashcards"
  | "matching-pairs"
  | "put-in-order";

// Detailed content schemas for each type
export const MultipleChoiceContentSchema = z.object({
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

export const TrueFalseContentSchema = z.object({
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

export const FlashcardsContentSchema = z.object({
  instructions: z.string(),
  cards: z.array(
    z.object({
      id: z.string(),
      front: z.string(),
      back: z.string(),
    })
  ),
});

export const MatchingPairsContentSchema = z.object({
  instructions: z.string(),
  pairs: z.array(
    z.object({
      id: z.string(),
      left: z.string(),
      right: z.string(),
    })
  ),
});

export const PutInOrderContentSchema = z.object({
  instructions: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      correctOrderIndex: z.number(),
    })
  ),
});

// Full discriminated activity structures matching the DB contract
export const MultipleChoiceActivitySchema = z.object({
  title: z.string(),
  type: z.literal("multiple-choice"),
  content: MultipleChoiceContentSchema,
  is_published: z.boolean().default(false),
});

export const TrueFalseActivitySchema = z.object({
  title: z.string(),
  type: z.literal("true-false"),
  content: TrueFalseContentSchema,
  is_published: z.boolean().default(false),
});

export const FlashcardsActivitySchema = z.object({
  title: z.string(),
  type: z.literal("flashcards"),
  content: FlashcardsContentSchema,
  is_published: z.boolean().default(false),
});

export const MatchingPairsActivitySchema = z.object({
  title: z.string(),
  type: z.literal("matching-pairs"),
  content: MatchingPairsContentSchema,
  is_published: z.boolean().default(false),
});

export const PutInOrderActivitySchema = z.object({
  title: z.string(),
  type: z.literal("put-in-order"),
  content: PutInOrderContentSchema,
  is_published: z.boolean().default(false),
});

export const ActivitySchema = z.discriminatedUnion("type", [
  MultipleChoiceActivitySchema,
  TrueFalseActivitySchema,
  FlashcardsActivitySchema,
  MatchingPairsActivitySchema,
  PutInOrderActivitySchema,
]);

export type GeneratedActivity = z.infer<typeof ActivitySchema>;
