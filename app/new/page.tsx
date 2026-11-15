"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ActivityRenderer from "../../components/ActivityRenderer";
import type { GeneratedActivity } from "../../lib/schemas";
import { createBrowserSupabase } from "../../lib/supabase";

const TYPES = [
  { value: "multiple-choice", label: "Multiple choice" },
  { value: "true-false", label: "True / False" },
  { value: "flashcards", label: "Flashcards" },
];

const GENERIC_ERROR =
  "Sorry, that didn't work. Please try again with a slightly different request.";

type ChatMessage = { role: "teacher" | "assistant"; text: string };

type RequestResult =
  | { ok: true; data: GeneratedActivity; isFake: boolean }
  | { ok: false; message: string; needsLogin?: boolean };

async function requestActivity(body: object): Promise<RequestResult> {
  try {
    const { data: sessionData } =
      await createBrowserSupabase().auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      return {
        ok: false,
        message: "Please log in to generate activities.",
        needsLogin: true,
      };
    }
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { ok: false, message: json?.error ?? GENERIC_ERROR };
    }
    return {
      ok: true,
      data: json.data as GeneratedActivity,
      isFake: Boolean(json.isFakeMode),
    };
  } catch {
    return {
      ok: false,
      message: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export default function NewActivityPage() {
  const router = useRouter();

  const [type, setType] = useState("multiple-choice");
  const [prompt, setPrompt] = useState("");
  const [activity, setActivity] = useState<GeneratedActivity | null>(null);
  const [version, setVersion] = useState(0);
  const [isFake, setIsFake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [changeText, setChangeText] = useState("");
  const [refining, setRefining] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    createBrowserSupabase()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) router.replace("/login");
      });
  }, [router]);

  async function generate() {
    if (!prompt.trim()) {
      setError("Tell me what the activity should be about.");
      return;
    }
    setLoading(true);
    setError(null);
    setActionError(null);
    setNeedsLogin(false);

    const result = await requestActivity({ prompt, type, currentActivity: null });
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      setNeedsLogin(Boolean(result.needsLogin));
      return;
    }
    setActivity(result.data);
    setIsFake(result.isFake);
    setVersion((v) => v + 1);
    setSaved(false);
    setSavedId(null);
    setChat([]);
  }

  async function refine() {
    const change = changeText.trim();
    if (!activity || !change) return;
    setRefining(true);
    setActionError(null);
    setNeedsLogin(false);

    const result = await requestActivity({
      prompt: change,
      type: activity.type,
      currentActivity: activity,
    });
    setRefining(false);

    if (!result.ok) {
      // Keep the previous version on screen.
      setActionError(result.message);
      setNeedsLogin(Boolean(result.needsLogin));
      return;
    }

    if (result.isFake) {
      setChat((prev) => [
        ...prev,
        { role: "teacher", text: change },
        {
          role: "assistant",
          text: "Fake mode is on, so the AI didn't change anything.",
        },
      ]);
      setChangeText("");
      return;
    }

    setChat((prev) => [
      ...prev,
      { role: "teacher", text: change },
      { role: "assistant", text: "Done. I've updated the activity above." },
    ]);
    setActivity(result.data);
    setVersion((v) => v + 1);
    setChangeText("");
    setSaved(false);
  }

  async function save() {
    if (!activity) return;
    setSaving(true);
    setActionError(null);
    setNeedsLogin(false);

    const supabase = createBrowserSupabase();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      setNeedsLogin(true);
      setActionError("Please log in to save your activity.");
      return;
    }

    if (savedId) {
      const { error: updateError } = await supabase
        .from("activities")
        .update({
          title: activity.title,
          content: activity.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", savedId);
      setSaving(false);
      if (updateError) {
        setActionError("Could not save your changes. Please try again.");
        return;
      }
      setSaved(true);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("activities")
      .insert({
        title: activity.title,
        type: activity.type,
        content: activity.content,
        is_published: false,
      })
      .select("id")
      .single();
    setSaving(false);
    if (insertError || !data) {
      setActionError("Could not save the activity. Please try again.");
      return;
    }
    setSavedId(data.id);
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">New activity</h1>
          <Link href="/dashboard" className="text-sm text-blue-700 underline">
            My activities
          </Link>
        </div>

        <p className="mt-6 text-sm font-medium text-gray-700">1. Pick a type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              aria-pressed={type === t.value}
              className={`min-h-[44px] rounded-xl border-2 px-4 py-2 ${
                type === t.value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label
          htmlFor="prompt"
          className="mt-6 block text-sm font-medium text-gray-700"
        >
          2. Describe it, or paste your notes
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Grade 7 photosynthesis, 10 questions, mostly easy"
          className="mt-2 w-full rounded-xl border-2 border-gray-300 bg-white p-3 text-gray-900"
        />

        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 min-h-[44px] rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
        {loading && (
          <p className="mt-2 text-sm text-gray-500">
            Writing your activity… this can take up to a minute.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">
            {error}{" "}
            {needsLogin && (
              <Link href="/login" className="underline">
                Log in
              </Link>
            )}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          {!activity ? (
            <p className="mt-2 text-gray-600">Your activity will appear here.</p>
          ) : (
            <>
              <div className="mt-2 rounded-2xl border border-gray-200 bg-white py-4">
                {isFake && (
                  <p className="px-4 text-xs text-gray-500">
                    Fake mode: showing sample content.
                  </p>
                )}
                <h3 className="px-4 text-center text-xl font-bold break-words">
                  {activity.title}
                </h3>
                <p className="px-4 text-center text-gray-600 break-words">
                  {activity.content.instructions}
                </p>
                <ActivityRenderer key={version} activity={activity} />
              </div>

              <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ask for changes
                </h2>
                <p className="text-sm text-gray-600">
                  For example: &quot;make question 3 harder&quot; or &quot;add
                  five more&quot;.
                </p>

                {chat.length > 0 && (
                  <ul aria-live="polite" className="mt-3 space-y-2">
                    {chat.map((m, i) => (
                      <li
                        key={i}
                        className={`rounded-xl px-3 py-2 text-sm break-words ${
                          m.role === "teacher"
                            ? "ml-8 bg-blue-50 text-blue-900"
                            : "mr-8 border border-gray-200 bg-white text-gray-800"
                        }`}
                      >
                        {m.text}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex gap-2">
                  <label htmlFor="change" className="sr-only">
                    Describe the change
                  </label>
                  <input
                    id="change"
                    value={changeText}
                    onChange={(e) => setChangeText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && refine()}
                    disabled={refining}
                    placeholder="make question 3 harder"
                    className="min-h-[44px] flex-1 rounded-xl border-2 border-gray-300 bg-white px-3 text-gray-900 disabled:opacity-50"
                  />
                  <button
                    onClick={refine}
                    disabled={refining || !changeText.trim()}
                    className="min-h-[44px] rounded-xl bg-blue-600 px-5 text-white disabled:opacity-50"
                  >
                    {refining ? "Updating…" : "Send"}
                  </button>
                </div>
                {refining && (
                  <p className="mt-2 text-sm text-gray-500">
                    Updating your activity… this can take up to a minute.
                  </p>
                )}
              </section>

              {actionError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-3 text-red-700"
                >
                  {actionError}{" "}
                  {needsLogin && (
                    <Link href="/login" className="underline">
                      Log in
                    </Link>
                  )}
                </p>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving || saved}
                  className="min-h-[44px] rounded-xl bg-green-600 px-6 py-3 text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving…"
                    : saved
                    ? "Saved ✓"
                    : savedId
                    ? "Save changes"
                    : "Save activity"}
                </button>
                {saved && (
                  <Link
                    href="/dashboard"
                    className="text-sm text-blue-700 underline"
                  >
                    Go to my activities
                  </Link>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}