"use client";

import quizzes from "@/data/quizzes.json";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Leaderboard from "@/components/Leaderboard";

export default function Quiz() {
  const params = useParams();
  const id = params.id as string;
  const quiz = quizzes.find((q) => q.id === id);

  // Settings state with defaults
  const [playerName, setPlayerName] = useState("");
  const [numQuestions, setNumQuestions] = useState(15);
  const [timePerQuestion, setTimePerQuestion] = useState(20);

  // Update defaults when quiz loads
  useEffect(() => {
    if (quiz) {
      setTimePerQuestion(quiz.timePerQuestion || 20);
      // Set max questions to available questions
      const maxQuestions = Math.min(15, quiz.questions.length);
      setNumQuestions(maxQuestions);
    }
  }, [quiz]);

  if (!quiz) {
    return (
      <div className="p-6">
        <div>Quiz not found</div>
        <div className="mt-4 text-sm text-gray-500">Looking for ID: {id}</div>
        <div className="mt-2 text-sm text-gray-500">
          Available IDs: {quizzes.map((q) => q.id).join(", ")}
        </div>
        <Link
          href="/quizzes"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/quizzes"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to all quizzes
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">{quiz.name}</h1>
          <p className="text-xl text-gray-600 mb-6">{quiz.category}</p>

          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Total questions available:
                </span>
                <span>{quiz.questions.length}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4 grid grid-cols-4 gap-4">
              <div className="space-y-2 col-span-4">
                <label
                  htmlFor="playerName"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Your name:
                </label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label
                  htmlFor="numQuestions"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Number of questions to play:
                </label>
                <input
                  id="numQuestions"
                  type="number"
                  min={10}
                  step={5}
                  max={quiz.questions.length}
                  value={numQuestions}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setNumQuestions(
                      Math.min(Math.max(10, value), quiz.questions.length)
                    );
                  }}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900"
                />
                <p className="text-xs text-gray-500">
                  (Max: {quiz.questions.length})
                </p>
              </div>

              {quiz.useTimer && (
                <div className="space-y-2 col-span-2">
                  <label
                    htmlFor="timePerQuestion"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Time per question (seconds):
                  </label>
                  <input
                    id="timePerQuestion"
                    type="number"
                    min="5"
                    step={5}
                    max="30"
                    value={timePerQuestion}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 5;
                      setTimePerQuestion(Math.min(Math.max(5, value), 300));
                    }}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900"
                  />
                  <p className="text-xs text-gray-500">
                    (Default: {quiz.timePerQuestion} seconds)
                  </p>
                </div>
              )}

              {!quiz.useTimer && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Timer:</span> Disabled for
                  this quiz
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/quizzes/${id}/play?questions=${numQuestions}&time=${timePerQuestion}&name=${encodeURIComponent(
              playerName
            )}`}
            className={`block w-full text-center px-8 py-4 text-xl font-semibold rounded-xl transition-colors shadow-lg ${
              playerName.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!playerName.trim()) {
                e.preventDefault();
              }
            }}
          >
            Start Game
          </Link>
        </div>

        <div className="mt-8">
          <Leaderboard quizId={id} />
        </div>
      </div>
    </div>
  );
}
