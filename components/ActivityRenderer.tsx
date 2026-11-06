import type { ActivityContent } from "../lib/schemas";
import MultipleChoice from "./templates/MultipleChoice";
import TrueFalse from "./templates/TrueFalse";
import Flashcards from "./templates/Flashcards";

export default function ActivityRenderer({
  activity,
}: {
  activity: ActivityContent;
}) {
  switch (activity.type) {
    case "multiple_choice":
      return <MultipleChoice content={activity} />;
    case "true_false":
      return <TrueFalse content={activity} />;
    case "flashcards":
      return <Flashcards content={activity} />;
    default:
      return (
        <p className="p-6 text-center text-gray-600">
          This activity type isn&apos;t available yet.
        </p>
      );
  }
}