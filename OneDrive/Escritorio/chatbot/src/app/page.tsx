// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Chatbot con IA</h1>
        <p className="text-xl mb-8">Usando Next.js, Vercel AI SDK y OpenRouter</p>
        <Link
          href="/chat"
          className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
        >
          Iniciar Chat
        </Link>
      </div>
    </main>
  );
}