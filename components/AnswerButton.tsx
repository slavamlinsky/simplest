"use client";

interface AnswerButtonProps {
  letter: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  feedback?: "correct" | "wrong" | null;
}

const colors = {
  A: "bg-red-500 hover:bg-red-600",
  B: "bg-blue-500 hover:bg-blue-600",
  C: "bg-yellow-500 hover:bg-yellow-600",
  D: "bg-green-500 hover:bg-green-600",
};

const feedbackColors = {
  correct: "bg-green-600 ring-4 ring-green-300",
  wrong: "bg-red-600 ring-4 ring-red-300",
};

export default function AnswerButton({
  letter,
  text,
  onClick,
  disabled = false,
  feedback = null,
}: AnswerButtonProps) {
  const baseColor = colors[letter as keyof typeof colors] || "bg-gray-500";
  const feedbackColor = feedback ? feedbackColors[feedback] : "";
  const finalColor = feedback ? feedbackColor : baseColor;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${finalColor} text-white p-6 py-4 rounded-xl text-left font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{letter}.</span>
        <span className="text-xl">{text}</span>
        {feedback === "correct" && <span className="ml-auto text-2xl">✓</span>}
        {feedback === "wrong" && <span className="ml-auto text-2xl">✗</span>}
      </div>
    </button>
  );
}
