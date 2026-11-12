import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold">AI Learning Builder</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Create quizzes and learning activities for your class in minutes.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-blue-600 px-6 py-3 min-h-[44px] text-white"
        >
          Teacher login
        </Link>
        <Link
          href="/demo"
          className="rounded-xl border-2 border-gray-300 px-6 py-3 min-h-[44px]"
        >
          See a demo
        </Link>
      </div>
    </main>
  );
}