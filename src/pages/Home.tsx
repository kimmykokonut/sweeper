import { Link } from "react-router";
import setteBello from "../assets/7-denari.jpg";
import assoDenari from "../assets/1-denari.jpg";

function Home() {
  return (
    <>
      <div className="min-h-[calc(100svh-4rem)] bg-gradient-to-br from-emerald-700 to-emerald-800 flex flex-col items-center justify-center p-6 pb-20 gap-6">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Benvenuti!
        </h1>
        <div className="flex gap-4 w-full max-w-lg justify-center">
          <Link
            to="/primiera"
            className="bg-white text-emerald-800 font-bold py-8 px-6 rounded-xl shadow-lg hover:bg-emerald-100 hover:scale-105 transition-all text-xl flex flex-col items-center justify-center gap-3 aspect-[3/4]"
          >
            <img
              src={setteBello}
              alt="Settebello card"
              className="h-32 w-auto"
            />
            Primiera Calculator
          </Link>
          <Link
            to="/score"
            className="bg-white text-emerald-800 font-bold py-8 px-6 rounded-xl shadow-lg hover:bg-emerald-100 hover:scale-105 transition-all text-xl flex flex-col items-center justify-center gap-3 aspect-[3/4]"
          >
            <img
              src={assoDenari}
              alt="Ace of coins card"
              className="h-32 w-auto"
            />
            Scopa Scorecard
          </Link>
        </div>
        {/* Footer  */}
        <div className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between bg-emerald-900">
          <a
            href="https://github.com/kimmykokonut/sweeper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold"
          >
            GitHub
          </a>
          <a
            href="https://kimmykokonut.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold"
          >
            Portfolio
          </a>
        </div>
      </div>
    </>
  );
}

export default Home;
