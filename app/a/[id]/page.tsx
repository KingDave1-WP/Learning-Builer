import { Suspense } from "react";
import ActivityRenderer from "../../../components/ActivityRenderer";
import { ActivitySchema, type GeneratedActivity } from "../../../lib/schemas";
import { createPublicSupabase } from "../../../lib/supabase";
import {
  sampleMultipleChoice,
  sampleTrueFalse,
  sampleFlashcards,
} from "../../../lib/sampleData";

const SAMPLES: Record<string, GeneratedActivity> = {
  "sample-mc": sampleMultipleChoice,
  "sample-tf": sampleTrueFalse,
  "sample-flash": sampleFlashcards,
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Published activities only. Students are never logged in.
async function getActivity(id: string): Promise<GeneratedActivity | null> {
  const sample = SAMPLES[id];
  if (sample) return sample.is_published ? sample : null;

  if (!UUID.test(id)) return null;

  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("activities")
    .select("title,type,content,is_published")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;

  const parsed = ActivitySchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

async function ActivityView({ params }: { params: Promise<{ id: string }> }) {
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

export default function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Loading activity…</p>
        </main>
      }
    >
      <ActivityView params={params} />
    </Suspense>
  );
}