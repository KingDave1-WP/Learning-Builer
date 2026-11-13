"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ActivityRenderer from "../../components/ActivityRenderer";
import type { GeneratedActivity } from "../../lib/schemas";
import { createBrowserSupabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const TYPES = [
  { value: "multiple-choice", label: "Multiple choice" },
  { value: "true-false", label: "True / False" },
  { value: "flashcards", label: "Flashcards" },
];

export default function NewActivityPage() {
  const [type, setType] = useState("multiple-choice");
  const [prompt, setPrompt] = useState("");
  const [activity, setActivity] = useState<GeneratedActivity | null>(null);
  const [version, setVersion] = useState(0);
  const [isFake, setIsFake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
    const router = useRouter();

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
    setSaved(false);
    setNeedsLogin(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type, currentActivity: null }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(
          "Sorry, that didn't work. Please try again with a slightly different request."
        );
        return;
      }
      setActivity(json.data as GeneratedActivity);
      setIsFake(Boolean(json.isFakeMode));
      setVersion((v) => v + 1);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!activity) return;
    setSaving(true);
    setError(null);
    setNeedsLogin(false);

    const supabase = createBrowserSupabase();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      setNeedsLogin(true);
      setError("Please log in to save your activity.");
      return;
    }

    const { error: insertError } = await supabase.from("activities").insert({
      title: activity.title,
      type: activity.type,
      content: activity.content,
      is_published: false,
    });

    setSaving(false);
    if (insertError) {
      setError("Could not save the activity. Please try again.");
      return;
    }
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
            <p className="mt-2 text-gray-600">
              Your activity will appear here.
            </p>
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

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving || saved}
                  className="min-h-[44px] rounded-xl bg-green-600 px-6 py-3 text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save activity"}
                </button>
                {saved && (
                  <Link href="/dashboard" className="text-sm text-blue-700 underline">
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