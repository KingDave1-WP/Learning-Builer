import type { GeneratedActivity } from "../lib/schemas";
import MultipleChoice from "./templates/MultipleChoice";
import TrueFalse from "./templates/TrueFalse";
import Flashcards from "./templates/Flashcards";
import MatchingPairs from "./templates/MatchingPairs";
import PutInOrder from "./templates/PutInOrder";

export default function ActivityRenderer({
  activity,
}: {
  activity: GeneratedActivity;
}) {
  switch (activity.type) {
    case "multiple-choice":
      return <MultipleChoice content={activity.content} />;
    case "true-false":
      return <TrueFalse content={activity.content} />;
    case "flashcards":
      return <Flashcards content={activity.content} />;
          case "matching-pairs":
      return <MatchingPairs content={activity.content} />;
    case "put-in-order":
      return <PutInOrder content={activity.content} />;
    default:
      return (
        <p className="p-6 text-center text-gray-600">
          This activity type isn&apos;t available yet.
        </p>
      );
  }
}