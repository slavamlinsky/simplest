import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-5xl font-bold text-gray-800">Mini Kahoot</h1>
        <p className="text-xl text-gray-600">Fun quizzes for kids!</p>

        <div className="flex flex-col gap-4 mt-8">
          <Link
            href="/quizzes"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Play Quizzes
          </Link>
        </div>
      </main>
    </div>
  );
}
