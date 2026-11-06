import MultipleChoice from "../../components/templates/MultipleChoice";
import TrueFalse from "../../components/templates/TrueFalse";
import Flashcards from "../../components/templates/Flashcards";
import {
  sampleMultipleChoice,
  sampleTrueFalse,
  sampleFlashcards,
} from "../../lib/sampleData";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <h1 className="text-center text-2xl font-bold mb-6">Activity templates demo</h1>

      <section className="mb-10">
        <h2 className="text-center text-lg font-semibold text-gray-600">
          {sampleMultipleChoice.title}
        </h2>
        <MultipleChoice content={sampleMultipleChoice.content} />
      </section>

      <section className="mb-10">
        <h2 className="text-center text-lg font-semibold text-gray-600">
          {sampleTrueFalse.title}
        </h2>
        <TrueFalse content={sampleTrueFalse.content} />
      </section>

      <section className="mb-10">
        <h2 className="text-center text-lg font-semibold text-gray-600">
          {sampleFlashcards.title}
        </h2>
        <Flashcards content={sampleFlashcards.content} />
      </section>
    </main>
  );
}