import PrimieraCalculator from "../components/PrimieraCalculator";

function Primiera() {
  return (
    <div className="w-full h-[calc(100svh-4rem)] flex flex-col overflow-hidden bg-emerald-900">
      <PrimieraCalculator mode="page" />
    </div>
  );
}

export default Primiera;
