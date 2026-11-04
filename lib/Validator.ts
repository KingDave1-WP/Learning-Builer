import { ActivityContent } from "./schemas";

export interface ValidationError {
  isValid: boolean;
  message?: string;
}

export function validateActivityContent(content: ActivityContent): ValidationError {
  if (content.type === "multiple_choice") {
    for (let i = 0; i < content.questions.length; i++) {
      const q = content.questions[i];
      
      // Check for 4 options
      if (!q.options || q.options.length !== 4) {
        return { isValid: false, message: `Question ${i + 1} does not have exactly 4 options.` };
      }

      // Check for duplicate options within the same question
      const uniqueOptions = new Set(q.options);
      if (uniqueOptions.size !== q.options.length) {
        return { isValid: false, message: `Question ${i + 1} contains duplicate options.` };
      }

      // Check correct answer bounds
      if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
        return { isValid: false, message: `Question ${i + 1} has an invalid correct answer index.` };
      }
    }
  }

  // Add validation checks for other types (True/False, Flashcards, Matching, Order) as needed

  return { isValid: true };
}