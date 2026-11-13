"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "../../lib/supabase";

type Row = {
  id: string;
  title: string;
  type: string;
  is_published: boolean;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  "multiple-choice": "Multiple choice",
  "true-false": "True / False",
  flashcards: "Flashcards",
  "matching-pairs": "Matching pairs",
  "put-in-order": "Put in order",
};

export default function DashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createBrowserSupabase();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/login");
      return;
    }
    const { data, error: loadError } = await supabase
      .from("activities")
      .select("id,title,type,is_published,created_at")
      .order("created_at", { ascending: false });
    if (loadError) {
      setError("Could not load your activities. Please refresh the page.");
      return;
    }
    setRows(data as Row[]);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePublish(row: Row) {
    setError(null);
    const supabase = createBrowserSupabase();
    const { error: updateError } = await supabase
      .from("activities")
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (updateError) {
      setError("Could not change the published status. Please try again.");
      return;
    }
    setRows((prev) =>
      prev
        ? prev.map((r) =>
            r.id === row.id ? { ...r, is_published: !r.is_published } : r
          )
        : prev
    );
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    setError(null);
    const supabase = createBrowserSupabase();
    const { error: deleteError } = await supabase
      .from("activities")
      .delete()
      .eq("id", row.id);
    if (deleteError) {
      setError("Could not delete the activity. Please try again.");
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r.id !== row.id) : prev));
  }

  async function copyLink(row: Row) {
    const link = `${window.location.origin}/a/${row.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt("Copy this link:", link);
    }
  }

  async function logout() {
    await createBrowserSupabase().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">My activities</h1>
          <button
            onClick={logout}
            className="min-h-[44px] rounded-xl border-2 border-gray-300 px-4 text-gray-800"
          >
            Log out
          </button>
        </div>

        <Link
          href="/new"
          className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-blue-600 px-6 text-white"
        >
          + New activity
        </Link>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        {rows === null && !error && (
          <p className="mt-6 text-gray-600">Loading…</p>
        )}

        {rows && rows.length === 0 && (
          <p className="mt-6 text-gray-600">
            You have no saved activities yet. Create your first one.
          </p>
        )}

        <ul className="mt-6 space-y-3">
          {rows?.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <p className="text-xs text-gray-500">
                {TYPE_LABELS[row.type] ?? row.type} ·{" "}
                {new Date(row.created_at).toLocaleDateString()}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900 break-words">
                {row.title}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => togglePublish(row)}
                  aria-pressed={row.is_published}
                  className={`min-h-[44px] rounded-xl px-4 ${
                    row.is_published
                      ? "bg-green-600 text-white"
                      : "border-2 border-gray-300 text-gray-800"
                  }`}
                >
                  {row.is_published ? "Published ✓" : "Publish"}
                </button>

                {row.is_published && (
                  <>
                    <button
                      onClick={() => copyLink(row)}
                      className="min-h-[44px] rounded-xl border-2 border-blue-600 px-4 text-blue-700"
                    >
                      {copiedId === row.id ? "Link copied ✓" : "Copy share link"}
                    </button>
                    <Link
                      href={`/a/${row.id}`}
                      target="_blank"
                      className="min-h-[44px] inline-flex items-center px-2 text-sm text-blue-700 underline"
                    >
                      Open
                    </Link>
                  </>
                )}

                <button
                  onClick={() => remove(row)}
                  className="ml-auto min-h-[44px] rounded-xl border-2 border-red-300 px-4 text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}