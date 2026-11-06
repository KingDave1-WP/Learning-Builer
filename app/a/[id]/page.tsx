import ActivityRenderer from "../../../components/ActivityRenderer";
import type { ActivityContent } from "../../../lib/schemas";
import {
  sampleMultipleChoice,
  sampleTrueFalse,
  sampleFlashcards,
} from "../../../lib/sampleData";

// Temporary: swap this for a Supabase fetch (published activities only) later.
async function getActivity(id: string): Promise<ActivityContent | null> {
  const samples: Record<string, ActivityContent> = {
    "sample-mc": sampleMultipleChoice,
    "sample-tf": sampleTrueFalse,
    "sample-flash": sampleFlashcards,
  };
  return samples[id] ?? null;
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
        {activity.instructions}
      </p>
      <ActivityRenderer activity={activity} />
    </main>
  );
}