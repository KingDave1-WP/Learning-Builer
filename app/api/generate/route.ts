import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ActivitySchema } from "../../../lib/schemas";

// Initialize the Anthropic client using your server environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mock response for FAKE_MODE testing
const MOCK_MULTIPLE_CHOICE = {
  type: "multiple_choice",
  title: "Photosynthesis Overview",
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
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, currentActivity, type } = body;

    // Check if FAKE_MODE is enabled (defaults to true if not set to "false")[cite: 6]
    const isFakeMode = process.env.FAKE_MODE !== "false";

    if (isFakeMode) {
      console.log("[FAKE MODE] Returning mock activity data.");
      return NextResponse.json({
        success: true,
        data: MOCK_MULTIPLE_CHOICE,
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

    // Call Claude Sonnet 5.5 for real generation
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Update to claude-sonnet-5-5 as specified in brief
      max_tokens: 2000,
      system: `You are an expert educational AI. Generate JSON content for activity type: "${type}". Ensure the output strictly conforms to the requested format.`,
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

    // Validate the output against your Zod schema[cite: 3]
    const validationResult = ActivitySchema.safeParse(parsedData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "AI generated invalid schema shape", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: validationResult.data,
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