import ActivityRenderer from "../../../components/ActivityRenderer";
import type { GeneratedActivity } from "../../../lib/schemas";
import {
  sampleMultipleChoice,
  sampleTrueFalse,
  sampleFlashcards,
} from "../../../lib/sampleData";

// Temporary: swap this for a Supabase fetch later.
// Keep the published-only rule when you do (is_published = true).
async function getActivity(id: string): Promise<GeneratedActivity | null> {
  const samples: Record<string, GeneratedActivity> = {
    "sample-mc": sampleMultipleChoice,
    "sample-tf": sampleTrueFalse,
    "sample-flash": sampleFlashcards,
  };
  const activity = samples[id] ?? null;
  if (!activity || !activity.is_published) return null;
  return activity;
}

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-center">
        <h1 className="text-xl font-semibold">Activity not found</h1>
        <p className="mt-2 text-gray-600">
          This link may be wrong, or the activity hasn&apos;t been published.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <h1 className="text-center text-2xl font-bold px-4 break-words">
        {activity.title}
      </h1>
      <p className="text-center text-gray-600 mt-1 px-4 break-words">
        {activity.content.instructions}
      </p>
      <ActivityRenderer activity={activity} />
    </main>
  );
}