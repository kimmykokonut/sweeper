import PrimieraCalculator from "../components/PrimieraCalculator";

function Primiera() {
  return (
    <div className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-4xl px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center justify-start">
      <PrimieraCalculator mode="page" />
    </div>
  );
}

export default Primiera;
