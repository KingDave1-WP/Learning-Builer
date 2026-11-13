import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ActivitySchema, GeneratedActivity } from "@/lib/schemas";
import { sampleTrueFalse, sampleFlashcards } from "@/lib/sampleData";

function validateActivityContent(activity: GeneratedActivity): { isValid: boolean; message?: string } {
  const inspect = (value: unknown, key = ""): string | undefined => {
    if (typeof value === "string") {
      if (/<\/?[a-z][\w:-]*(?:\s[^<>]*)?\/?>/i.test(value)) {
        return "HTML tags are not allowed in activity content.";
      }
      return;
    }

    if (Array.isArray(value)) {
      if (key === "options" && value.every((item) => typeof item === "string")) {
        const normalized = value.map((item) => item.trim().toLowerCase());
        if (new Set(normalized).size !== normalized.length) {
          return "Answer options must not contain duplicates.";
        }
      }
      for (const item of value) {
        const error = inspect(item);
        if (error) return error;
      }
      return;
    }

    if (value && typeof value === "object") {
      for (const [childKey, childValue] of Object.entries(value)) {
        const error = inspect(childValue, childKey);
        if (error) return error;
      }
    }
  };

  const message = inspect(activity.content);
  return message ? { isValid: false, message } : { isValid: true };
}

// Initialize the Anthropic client using your server environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mock response for FAKE_MODE testing matching the new database contract
const MOCK_MULTIPLE_CHOICE_ACTIVITY: GeneratedActivity = {
  title: "Photosynthesis Overview",
  type: "multiple-choice",
  is_published: false,
  content: {
    instructions: "Select the correct answer for each question.",
    questions: [
      {
        id: "q1",
        question: "What primary gas do plants absorb during photosynthesis?",
        options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correctAnswerIndex: 0,
        explanation: "Plants absorb Carbon Dioxide (CO2) from the air to make sugars."
      },
      {
        id: "q2",
        question: "Where in plant cells does photosynthesis take place?",
        options: ["Mitochondria", "Nucleus", "Chloroplasts", "Cell Wall"],
        correctAnswerIndex: 2,
        explanation: "Photosynthesis occurs inside chloroplasts, which contain chlorophyll."
      }
    ]
  }
};

function getFakeActivity(type: string): GeneratedActivity {
  switch (type) {
    case "true-false":
      return { ...sampleTrueFalse, is_published: false };
    case "flashcards":
      return { ...sampleFlashcards, is_published: false };
    default:
      return MOCK_MULTIPLE_CHOICE_ACTIVITY;
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, currentActivity, type } = body;

    // Check if FAKE_MODE is enabled (defaults to true if not set to "false")[cite: 6]
    const isFakeMode = process.env.FAKE_MODE !== "false";

    if (isFakeMode) {
      console.log("[FAKE MODE] Returning mock activity data matching database contract.");
      return NextResponse.json({
        success: true,
                data: getFakeActivity(type),
        isFakeMode: true,
      });
    }

    // Ensure API key is present before calling Claude
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    // Call Claude for real generation matching the requested hyphenated type
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: `You are an expert educational AI. Generate a JSON object with fields: "title", "type" (must be exactly "${type}"), "is_published" (set to false), and "content" containing the structural details for this activity type. Ensure valid JSON output with zero HTML tags.`,
      messages: [
        {
          role: "user",
          content: `Teacher request: "${prompt}". Current activity state (if refining): ${JSON.stringify(currentActivity)}`
        }
      ],
    });

    // Extract text content from Claude's response
    const responseText = response.content[0].type === 'text' ? response.content[0].text : "";
    
    // Parse JSON safely
    const parsedData = JSON.parse(responseText);

    // 1. Validate the output shape and default values using Zod[cite: 3]
    const schemaValidation = ActivitySchema.safeParse(parsedData);
    if (!schemaValidation.success) {
      return NextResponse.json(
        { error: "AI generated invalid schema shape", details: schemaValidation.error.format() },
        { status: 400 }
      );
    }

    const activityData = schemaValidation.data;

    // 2. Run custom business logic validation (HTML checks, duplicate options, etc.)[cite: 3]
    const contentValidation = validateActivityContent(activityData);
    if (!contentValidation.isValid) {
      return NextResponse.json(
        { error: "Content validation failed", message: contentValidation.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activityData,
      isFakeMode: false,
    });

  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during generation." },
      { status: 500 }
    );
  }
}
