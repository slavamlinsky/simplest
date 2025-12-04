"use client";

import { useState, useEffect, useRef } from "react";

interface LeaderboardEntry {
  name: string;
  speed: number; // seconds per correct answer
  result: string; // format: "14/15"
  correctCount: number;
  totalQuestions: number;
  time: number; // total time in seconds
  date: string;
}

interface LeaderboardProps {
  quizId: string;
  currentResult?: {
    name: string;
    correctCount: number;
    totalQuestions: number;
    time: number;
  };
}

export default function Leaderboard({
  quizId,
  currentResult,
}: LeaderboardProps) {
  const storageKey = `leaderboard_${quizId}`;
  const maxEntries = 20;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const hasAddedResult = useRef(false);

  // Calculate speed (time per correct answer - lower is better)
  const calculateSpeed = (
    correctCount: number,
    timeSeconds: number
  ): number => {
    if (correctCount === 0) return Infinity; // No correct answers = worst speed
    return timeSeconds / correctCount; // seconds per correct answer
  };

  useEffect(() => {
    // Get leaderboard from localStorage
    const getLeaderboard = (): LeaderboardEntry[] => {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      const entries = JSON.parse(stored);
      // Filter out invalid entries (missing speed or result)
      return entries.filter(
        (entry: LeaderboardEntry) =>
          entry.speed != null &&
          isFinite(entry.speed) &&
          entry.result &&
          entry.name
      );
    };

    // Save leaderboard to localStorage
    const saveLeaderboard = (entries: LeaderboardEntry[]) => {
      if (typeof window === "undefined") return;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    };

    let currentLeaderboard = getLeaderboard();

    // Add current result if it qualifies (only once)
    if (currentResult && !hasAddedResult.current) {
      const speed = calculateSpeed(
        currentResult.correctCount,
        currentResult.time
      );
      const resultString = `${currentResult.correctCount}/${currentResult.totalQuestions}`;
      const newEntry: LeaderboardEntry = {
        name: currentResult.name,
        speed,
        result: resultString,
        correctCount: currentResult.correctCount,
        totalQuestions: currentResult.totalQuestions,
        time: currentResult.time,
        date: new Date().toISOString(),
      };

      // Check if this exact entry already exists (prevent duplicates)
      const entryExists = currentLeaderboard.some(
        (entry) =>
          entry.name === newEntry.name &&
          Math.abs(entry.speed - newEntry.speed) < 0.01 &&
          entry.result === newEntry.result &&
          entry.time === newEntry.time
      );

      if (!entryExists) {
        // Check if result qualifies (better than 20th or fewer than 20 entries)
        const worstSpeed =
          currentLeaderboard.length > 0
            ? currentLeaderboard[currentLeaderboard.length - 1]?.speed ||
              Infinity
            : Infinity;
        const shouldAdd =
          currentLeaderboard.length < maxEntries || speed < worstSpeed;

        if (shouldAdd) {
          // Add to leaderboard
          currentLeaderboard.push(newEntry);

          // Sort by speed (ascending - lower is better)
          currentLeaderboard.sort((a, b) => a.speed - b.speed);

          // Keep only top 20
          currentLeaderboard = currentLeaderboard.slice(0, maxEntries);

          // Save to localStorage
          saveLeaderboard(currentLeaderboard);
          hasAddedResult.current = true;
        }
      }
    }

    setLeaderboard(currentLeaderboard);
  }, [quizId, currentResult, storageKey]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Format speed (seconds per question)
  const formatSpeed = (speed: number | null | undefined): string => {
    if (speed == null || !isFinite(speed) || isNaN(speed)) {
      return "—";
    }
    return speed.toFixed(2);
  };

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h3>
        <p className="text-gray-500">No records yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                #
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Name
              </th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">
                Result
              </th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">
                Time
              </th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">
                Speed
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 ${
                  currentResult &&
                  entry.name === currentResult.name &&
                  Math.abs(
                    entry.speed -
                      calculateSpeed(
                        currentResult.correctCount,
                        currentResult.time
                      )
                  ) < 0.01 &&
                  entry.result ===
                    `${currentResult.correctCount}/${currentResult.totalQuestions}` &&
                  entry.time === currentResult.time
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <td className="py-3 px-4 font-semibold text-gray-700 text-left">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-gray-800 text-left">
                  {entry.name}
                </td>

                <td className="py-3 px-4 text-right text-gray-700">
                  {entry.result}
                </td>
                <td className="py-3 px-4 text-right text-gray-700">
                  {formatTime(entry.time)}
                </td>
                <td className="py-3 px-4 text-right text-gray-700">
                  {formatSpeed(entry.speed)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
