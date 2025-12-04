import quizzes from "@/data/quizzes.json";
import Link from "next/link";

export default function Quizzes() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Select Game</h1>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((q) => (
          <Link
            key={q.id}
            href={`/quizzes/${q.id}`}
            className="p-4 gap-6 bg-white/10 text-orange-500 border rounded-xl hover:bg-gray-50 hover:text-blue-600 flex flex-col items-center justify-center"
          >
            <div className="text-2xl font-semibold">{q.name}</div>
            <div className="text-base text-gray-500">{q.category}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
