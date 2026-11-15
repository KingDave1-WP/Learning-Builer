import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ActivitySchema, type GeneratedActivity } from "@/lib/schemas";
import { validateActivityContent } from "@/lib/Validator";
import {
  sampleMultipleChoice,
  sampleTrueFalse,
  sampleFlashcards,
} from "@/lib/sampleData";
import { createPublicSupabase } from "@/lib/supabase";
export const maxDuration = 60;

const MODEL = "claude-sonnet-5-5";

const TYPES = [
  "multiple-choice",
  "true-false",
  "flashcards",
  "matching-pairs",
  "put-in-order",
];

const SHAPES: Record<string, string> = {
  "multiple-choice": `{"instructions":"...","questions":[{"id":"q1","question":"...","options":["A","B","C","D"],"correctAnswerIndex":0,"explanation":"..."}]}`,
  "true-false": `{"instructions":"...","statements":[{"id":"s1","statement":"...","isTrue":true,"explanation":"..."}]}`,
  flashcards: `{"instructions":"...","cards":[{"id":"c1","front":"...","back":"..."}]}`,
  "matching-pairs": `{"instructions":"...","pairs":[{"id":"p1","left":"...","right":"..."}]}`,
  "put-in-order": `{"instructions":"...","items":[{"id":"i1","text":"...","correctOrderIndex":0}]}`,
};

type Message = { role: "user" | "assistant"; content: string };

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function getFakeActivity(type: string): GeneratedActivity {
  switch (type) {
    case "true-false":
      return { ...sampleTrueFalse, is_published: false };
    case "flashcards":
      return { ...sampleFlashcards, is_published: false };
    default:
      return { ...sampleMultipleChoice, is_published: false };
  }
}

function systemPrompt(type: string) {
  return `You write learning activities for school teachers. Reply with ONE JSON object and nothing else: no markdown, no code fences, no commentary.
The object must look exactly like this:
{"title":"...","type":"${type}","is_published":false,"content": ${SHAPES[type]}}
Rules:
- "type" must be exactly "${type}".
- Write plain text only. No HTML tags.
- Give every item a short unique "id".
- Keep each text under 300 characters, so it fits on a phone.
- Match the teacher's grade level, topic, tone and number of items. If no number is given, write 8 items.
- Multiple choice: exactly 4 different options, and correctAnswerIndex is 0 to 3.`;
}

function userMessage(prompt: string, current: unknown) {
  if (current) {
    return `Here is the current activity:\n${JSON.stringify(current)}\n\nThe teacher asks for this change: ${prompt}\n\nReturn the complete updated activity as one JSON object.`;
  }
  return `Teacher's request:\n${prompt}`;
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no json");
  return JSON.parse(text.slice(start, end + 1));
}

function sanityCheck(activity: GeneratedActivity): string | null {
  const list = Object.values(activity.content).find(Array.isArray) as
    | unknown[]
    | undefined;
  if (!list || list.length < 1 || list.length > 30) {
    return "The activity must have between 1 and 30 items.";
  }
  const tooLong = (v: unknown): boolean => {
    if (typeof v === "string") return v.length > 400;
    if (v && typeof v === "object") return Object.values(v).some(tooLong);
    return false;
  };
  if (tooLong(activity.content)) {
    return "Some text is longer than 400 characters. Shorten it.";
  }
  return null;
}

type Checked =
  | { ok: true; data: GeneratedActivity }
  | { ok: false; problem: string };

function check(raw: string, type: string): Checked {
  let parsed: unknown;
  try {
    parsed = extractJson(raw);
  } catch {
    return { ok: false, problem: "Your reply was not valid JSON." };
  }
  if (parsed && typeof parsed === "object") {
    (parsed as Record<string, unknown>).is_published = false;
  }
  const result = ActivitySchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
      .join("; ");
    return {
      ok: false,
      problem: `The JSON did not match the format (${issues}).`,
    };
  }
  if (result.data.type !== type) {
    return { ok: false, problem: `The type must be exactly "${type}".` };
  }
  const content = validateActivityContent(result.data);
  if (!content.isValid) {
    return {
      ok: false,
      problem: content.message ?? "The content failed validation.",
    };
  }
  const sanity = sanityCheck(result.data);
  if (sanity) return { ok: false, problem: sanity };
  return { ok: true, data: result.data };
}

async function ask(
  system: string,
  messages: Message[],
  deadline: number
): Promise<string> {
  // Claude if an Anthropic key is set, otherwise Gemini.
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const client = new Anthropic({ apiKey: anthropicKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system,
      messages,
    });
    return response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("");
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  // If the first model is overloaded or unavailable, try the next one.
    const models = [
    process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ];

  let lastError = "";
  for (const model of models) {
    const remaining = deadline - Date.now();
    if (remaining < 5000) break;

    // Gemini 3 models think a lot by default, which is slow. Ask for less.
    const generationConfig: Record<string, unknown> = {
      responseMimeType: "application/json",
    };
    if (model.startsWith("gemini-3")) {
      generationConfig.thinkingConfig = { thinkingLevel: "low" };
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig,
          }),
          signal: AbortSignal.timeout(Math.min(20000, remaining)),
        }
      );
      if (res.ok) {
        const json = await res.json();
        const parts = json?.candidates?.[0]?.content?.parts ?? [];
        return parts.map((p: { text?: string }) => p.text ?? "").join("");
      }
      const detail = await res.text().catch(() => "");
      lastError = `Gemini ${res.status} (${model}): ${detail.slice(0, 200)}`;
      console.warn(`[generate] ${lastError}`);
      // A rejected key won't be fixed by another model.
      if (![400, 404, 429, 500, 503].includes(res.status)) break;
    } catch (err) {
      lastError = `Gemini request failed (${model}): ${String(err)}`;
      console.warn(`[generate] ${lastError}`);
    }
  }
  throw new Error(lastError || "Gemini did not answer in time");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const type = typeof body?.type === "string" ? body.type : "";
    const currentActivity = body?.currentActivity ?? null;

    if (!prompt || prompt.length > 8000) {
      return fail("Please describe the activity (up to 8,000 characters).", 400);
    }
    if (!TYPES.includes(type)) {
      return fail("Unknown activity type.", 400);
    }

    if (process.env.FAKE_MODE !== "false") {
      return NextResponse.json({
        success: true,
        data: getFakeActivity(type),
        isFakeMode: true,
      });
    }

        if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
      return fail("The AI is not set up yet.", 500);
    }

    // Only logged-in teachers may spend AI credit.
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");
    if (!token) return fail("Please log in to generate activities.", 401);
    const { data: userData, error: userError } =
      await createPublicSupabase().auth.getUser(token);
    if (userError || !userData.user) {
      return fail("Please log in to generate activities.", 401);
    }

    const messages: Message[] = [
      { role: "user", content: userMessage(prompt, currentActivity) },
    ];

        const deadline = Date.now() + 55000;
    // One automatic retry: tell the AI what was wrong and ask again.
    for (let attempt = 1; attempt <= 2; attempt++) {
            const reply = await ask(systemPrompt(type), messages, deadline);
      const result = check(reply, type);
      if (result.ok) {
        return NextResponse.json({
          success: true,
          data: result.data,
          isFakeMode: false,
        });
      }
      console.warn(`[generate] attempt ${attempt} failed: ${result.problem}`);
      messages.push(
        { role: "assistant", content: reply },
        {
          role: "user",
          content: `There is a problem: ${result.problem} Fix it and return the complete corrected JSON object only.`,
        }
      );
    }

    return fail("The AI could not make a valid activity. Please try again.", 422);
  } catch (err) {
    console.error("[generate] error", err);
    return fail("Something went wrong while generating. Please try again.", 500);
  }
}