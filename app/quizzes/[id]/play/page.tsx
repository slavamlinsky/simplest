"use client";

import quizzes from "@/data/quizzes.json";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Timer from "@/components/Timer";
import AnswerButton from "@/components/AnswerButton";
import Leaderboard from "@/components/Leaderboard";
import Link from "next/link";
import Image from "next/image";

interface AnswerResult {
  correct: boolean;
  timeSpent: number; // in seconds
}

export default function PlayQuiz() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const quiz = quizzes.find((q) => q.id === id);

  // Get custom settings from URL params, with defaults
  const numQuestionsParam = searchParams.get("questions");
  const timePerQuestionParam = searchParams.get("time");
  const playerNameParam = searchParams.get("name");
  const numQuestions = numQuestionsParam ? parseInt(numQuestionsParam, 10) : 15;
  const customTimePerQuestion = timePerQuestionParam
    ? parseInt(timePerQuestionParam, 10)
    : quiz?.timePerQuestion || 20;
  const playerName = playerNameParam ? decodeURIComponent(playerNameParam) : "";

  // Quiz state - selected questions type
  type QuestionType = {
    title: string;
    image?: string;
    answers: Array<{ text: string; correct: boolean }>;
    shuffle?: boolean;
  };
  const [selectedQuestions, setSelectedQuestions] = useState<
    QuestionType[] | null
  >(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Current question state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionAnswers, setQuestionAnswers] = useState<
    Array<{ text: string; correct: boolean }>
  >([]);

  // Add modal state
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);

  // Initialize: Select 15 random questions and shuffle them (only once)
  useEffect(() => {
    if (!selectedQuestions && quiz && quiz.questions.length > 0) {
      const allQuestions = [...quiz.questions];
      // Shuffle all questions
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      // Take specified number of questions (or all if less)
      const selected = shuffled.slice(
        0,
        Math.min(numQuestions, shuffled.length)
      );
      // Shuffle the selected 15 again for random order
      const finalShuffled = selected.sort(() => Math.random() - 0.5);
      setSelectedQuestions(finalShuffled);
    }
  }, [quiz, selectedQuestions, numQuestions]);

  // Initialize question answers when question changes
  useEffect(() => {
    if (
      selectedQuestions &&
      selectedQuestions[currentQuestionIndex] &&
      !showResult
    ) {
      const currentQuestion = selectedQuestions[currentQuestionIndex];
      // Reset question state
      setSelectedAnswer(null);
      setFeedback(null);
      setTimerActive(true);
      setQuestionStartTime(Date.now());

      // Prepare answers: 1 correct + 3 random incorrect
      const correctAnswer = currentQuestion.answers.find((a) => a.correct);
      const incorrectAnswers = currentQuestion.answers.filter(
        (a) => !a.correct
      );

      // Shuffle incorrect answers and take 3 random ones
      const shuffledIncorrect = [...incorrectAnswers].sort(
        () => Math.random() - 0.5
      );
      const selectedIncorrect = shuffledIncorrect.slice(0, 3);

      // Combine: 1 correct + 3 incorrect
      const selectedAnswers = correctAnswer
        ? [correctAnswer, ...selectedIncorrect]
        : selectedIncorrect;

      // Shuffle the final 4 answers if shuffle is enabled
      const finalAnswers = currentQuestion.shuffle
        ? [...selectedAnswers].sort(() => Math.random() - 0.5)
        : selectedAnswers;

      setQuestionAnswers(finalAnswers);
    }
  }, [currentQuestionIndex, showResult, selectedQuestions]);

  // Early returns after all hooks
  if (!quiz) {
    return (
      <div className="p-6">
        <div>Quiz not found</div>
        <div className="mt-4 text-sm text-gray-500">Looking for ID: {id}</div>
        <div className="mt-2 text-sm text-gray-500">
          Available IDs: {quizzes.map((q) => q.id).join(", ")}
        </div>
      </div>
    );
  }

  // Wait for questions to be selected
  if (!selectedQuestions) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === selectedQuestions.length - 1;

  const handleAnswer = (index: number, correct: boolean) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(index);
    setFeedback(correct ? "correct" : "wrong");
    setTimerActive(false);

    // Calculate time spent on this question (in seconds)
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    // Save answer result
    const newAnswer: AnswerResult = {
      correct,
      timeSpent,
    };

    setAnswers((prev) => [...prev, newAnswer]);

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      if (isLastQuestion) {
        setShowResult(true);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 1500);
  };

  const handleTimerComplete = () => {
    if (selectedAnswer !== null) return;

    // Auto-select first answer (wrong) when timer runs out
    const firstIncorrectIndex = questionAnswers.findIndex((a) => !a.correct);
    const indexToSelect = firstIncorrectIndex >= 0 ? firstIncorrectIndex : 0;
    handleAnswer(indexToSelect, false);
  };

  const handlePlayAgain = () => {
    if (!quiz) return;
    // Reselect random questions for a new game (using same number)
    const allQuestions = [...quiz.questions];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));
    const finalShuffled = selected.sort(() => Math.random() - 0.5);
    setSelectedQuestions(finalShuffled);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedAnswer(null);
    setFeedback(null);
    setTimerActive(true);
  };

  // Calculate results
  const correctCount = answers.filter((a) => a.correct).length;
  const totalQuestions = selectedQuestions.length;
  const totalTimeSeconds = answers.reduce((sum, a) => sum + a.timeSpent, 0);
  const totalMinutes = Math.floor(totalTimeSeconds / 60);
  const totalSeconds = totalTimeSeconds % 60;
  const wrongQuestions = answers
    .map((answer, index) => (!answer.correct ? index : null))
    .filter((index) => index !== null) as number[];
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const emoji =
    percentage === 100
      ? "🎉"
      : percentage >= 80
      ? "😊"
      : percentage >= 60
      ? "👍"
      : "💪";

  // Show result screen
  if (showResult) {
    const selectedQuestion =
      selectedQuestionIndex !== null
        ? selectedQuestions[selectedQuestionIndex]
        : null;
    const correctAnswer = selectedQuestion?.answers.find((a) => a.correct);

    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-4xl font-bold mb-2 text-gray-800">
            Quiz Completed!
          </h1>
          <h2 className="text-2xl font-semibold mb-8 text-gray-600">
            {quiz.name}
          </h2>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {correctCount}/{totalQuestions}
            </div>
            <div className="text-xl text-gray-600 mb-4">
              {percentage}% Correct
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-lg text-gray-700">
                <span className="font-semibold">Total time:</span>{" "}
                {totalMinutes > 0
                  ? `${totalMinutes} min ${totalSeconds} sec`
                  : `${totalSeconds} sec`}
              </div>
            </div>

            {wrongQuestions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Questions to review:
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {wrongQuestions.map((qIndex) => (
                    <button
                      key={qIndex}
                      onClick={() => setSelectedQuestionIndex(qIndex)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      Question {qIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Play Again
            </button>
            <Link
              href="/quizzes"
              className="px-8 py-4 bg-gray-200 text-gray-800 text-lg font-semibold rounded-xl hover:bg-gray-300 transition-colors shadow-lg"
            >
              Back to Quizzes
            </Link>
          </div>

          {playerName && (
            <div className="mt-6">
              <Leaderboard
                quizId={id}
                currentResult={{
                  name: playerName,
                  correctCount: correctCount,
                  totalQuestions: totalQuestions,
                  time: totalTimeSeconds,
                }}
              />
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedQuestionIndex !== null && selectedQuestion && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedQuestionIndex(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Question {selectedQuestionIndex + 1}
                  </h3>
                  <button
                    onClick={() => setSelectedQuestionIndex(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {selectedQuestion.image && (
                  <div className="mb-4 relative">
                    <Image
                      src={selectedQuestion.image}
                      width={1000}
                      height={1000}
                      className="w-full h-[300px] object-cover rounded-xl shadow-lg"
                      alt="question"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-700 mb-4">
                    {selectedQuestion.title}
                  </h4>

                  {correctAnswer && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                      <div className="text-sm font-semibold text-green-700 mb-2">
                        Correct Answer:
                      </div>
                      <div className="text-lg text-green-800 font-medium">
                        {correctAnswer.text}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show question screen
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {selectedQuestions.length}
        </div>

        {quiz.useTimer && (
          <Timer
            duration={customTimePerQuestion}
            onComplete={handleTimerComplete}
            active={timerActive}
          />
        )}

        {currentQuestion.image && (
          <div className="mb-6 relative">
            <Image
              src={currentQuestion.image}
              width={1000}
              height={1000}
              className="w-full h-[450px] object-cover mx-auto rounded-xl shadow-lg"
              alt="question"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-slate-700 bg-opacity-60 text-white p-4 rounded-b-xl">
              <h2 className="text-xl text-center font-bold">
                {currentQuestion.title}
              </h2>
            </div>
          </div>
        )}

        {!currentQuestion.image && (
          <div className="h-[320px] flex items-center justify-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center leading-10 px-6">
              {currentQuestion.title}
            </h2>
          </div>
        )}

        <div
          className={`grid ${
            quiz.longAnswers ? "grid-cols-1" : "grid-cols-2"
          } gap-x-12 gap-y-6`}
        >
          {questionAnswers.map((a, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = selectedAnswer === i;
            const answerFeedback = isSelected
              ? a.correct
                ? "correct"
                : "wrong"
              : null;

            return (
              <AnswerButton
                key={i}
                letter={letter}
                text={a.text}
                onClick={() => handleAnswer(i, a.correct)}
                disabled={selectedAnswer !== null}
                feedback={answerFeedback}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
