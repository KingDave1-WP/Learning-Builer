import { GeneratedActivity } from "./schemas";

export interface ValidationError {
  isValid: boolean;
  message?: string;
}

// Helper to check for raw HTML tags in text fields
function containsHtml(str: string): boolean {
  const htmlRegex = /<\/?[a-z][\s\S]*>/i;
  return htmlRegex.test(str);
}

// Recursive helper to scan all string values in an object for HTML
function scanForHtml(obj: any): boolean {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string" && containsHtml(val)) {
      return true;
    } else if (val !== null && typeof val === "object") {
      if (scanForHtml(val)) return true;
    }
  }
  return false;
}

export function validateActivityContent(activity: GeneratedActivity): ValidationError {
  // 1. Check for HTML injection inside content
  if (scanForHtml(activity.content)) {
    return { isValid: false, message: "Generated content contains forbidden HTML tags." };
  }

  // 2. Type-specific validation rules
  if (activity.type === "multiple-choice") {
    const content = activity.content;
    for (let i = 0; i < content.questions.length; i++) {
      const q = content.questions[i];
      
      if (!q.options || q.options.length !== 4) {
        return { isValid: false, message: `Question ${i + 1} must have exactly 4 options.` };
      }

      const uniqueOptions = new Set(q.options);
      if (uniqueOptions.size !== q.options.length) {
        return { isValid: false, message: `Question ${i + 1} contains duplicate option choices.` };
      }

      if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
        return { isValid: false, message: `Question ${i + 1} has an invalid correct answer index bounds.` };
      }
    }
  }

  // Additional validators for true-false, flashcards, matching-pairs, put-in-order can go here...

  return { isValid: true };
}
