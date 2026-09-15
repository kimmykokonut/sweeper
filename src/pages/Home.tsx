import { Link } from "react-router";
import setteBello from "../assets/7-denari.jpg";
import assoDenari from "../assets/1-denari.jpg";

function Home() {
  return (
    <div className="min-h-[calc(100svh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 pb-20 gap-4 sm:gap-6">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">
        Benvenuti!
      </h1>
      <div className="flex gap-2 sm:gap-4 w-full max-w-xs sm:max-w-lg justify-center">
        <Link
          to="/primiera"
          className="bg-white text-emerald-800 font-bold py-6 sm:py-12 px-3 sm:px-6 rounded-xl shadow-lg hover:bg-emerald-100 hover:scale-105 transition-all text-base sm:text-xl flex flex-col flex-shrink-0 items-center justify-center gap-2"
        >
          <img
            src={setteBello}
            alt="Settebello card"
            className="h-40 w-auto max-w-full"
          />
          Primiera Calculator
        </Link>
        <Link
          to="/score"
          className="bg-white text-emerald-800 font-bold py-6 sm:py-12 px-3 sm:px-6 rounded-xl shadow-lg hover:bg-emerald-100 hover:scale-105 transition-all text-base sm:text-xl flex flex-col flex-shrink-0 items-center justify-center gap-2"
        >
          <img
            src={assoDenari}
            alt="Ace of coins card"
            className="h-40 w-auto max-w-full"
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
  );
}

export default Home;
