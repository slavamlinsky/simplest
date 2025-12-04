"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  active: boolean;
}

export default function Timer({ duration, onComplete, active }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!active) return;

    setTimeLeft(duration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Schedule onComplete to run after the state update completes
          setTimeout(() => {
            onComplete();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, active, onComplete]);

  // if (!active) return null;

  const percentage = (timeLeft / duration) * 100;
  const textColorClass =
    timeLeft <= 5
      ? "text-red-600"
      : timeLeft <= 10
      ? "text-orange-600"
      : "text-blue-600";
  const bgColorClass =
    timeLeft <= 5
      ? "bg-red-600"
      : timeLeft <= 10
      ? "bg-orange-600"
      : "bg-blue-600";

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-semibold text-orange-500">
          Time remaining
        </span>
        <span className={`text-2xl font-bold ${textColorClass}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColorClass} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
