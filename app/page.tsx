import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simplest.App - Train & Test",
  description:
    "Your easiest way to become smarter. Usefull and free application for you and your kids.",
  openGraph: {
    title: "Simplest.App - Train & Test",
    description:
      "Your easiest way to become smarter. Usefull and free application for you and your kids.",
    images: ["/welcome-screen-large.png"],
  },
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/welcome-screen-large.png"
          alt="Welcome background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Content overlay */}
      <main className="relative z-10 flex flex-col items-center gap-6 p-8 text-center mt-96">
        <h1 className="text-4xl font-extrabold text-gray-800">Train & Test</h1>
        <p className="text-xl text-gray-600">For you and your kids</p>

        <div className="flex flex-col gap-4 mt-2">
          <Link
            href="/quizzes"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Let's Play
          </Link>
        </div>
      </main>
    </div>
  );
}
