import { Counter } from "../components/Counter";
import { SignatureGenerator } from "../components/SignatureGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center">Web3 Counter DApp</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Counter />
            </div>

            <div>
              <SignatureGenerator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
