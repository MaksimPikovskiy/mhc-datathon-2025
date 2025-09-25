import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

type IntroSectionProps = {
  id?: string;
  useLocal: boolean;
  setUseLocal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function IntroSection({
  id = "",
  useLocal,
  setUseLocal,
}: IntroSectionProps) {
  return (
    <section
      id={id}
      className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-start"
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Introduction</h2>
        <p>
          Urban bus systems are vital for mobility, but safety remains a
          pressing issue. Our team investigates how bus route
          characteristics-ACE (and ABLE) violations, speeds, and
          ridership-affect accident risk.
        </p>
        <ul className="ps-6 list-disc list-outside space-y-1 text-left">
          <li>
            <strong>Problem:</strong> Develop a Bus Route Risk Score and
            Neighborhood Risk Score estimating accident probability.
          </li>
          <li>
            <strong>Business Question:</strong> Which bus routes and
            neighborhoods have the highest accident likelihood?
          </li>
          <li>
            <strong>Focus:</strong> Identify dangerous routes and neighborhoods
            to prioritize safety interventions.
          </li>
        </ul>
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-row justify-center items-center gap-2">
            <h3 className="font-bold text-xl">Report by</h3>
            <div className="flex flex-row justify-center items-center">
              <img src="mechanicus.png" className="w-8 h-8" />
              <h3 className="font-bold text-xl">Mechanicus</h3>
            </div>
          </div>
          <ul className="list-none list-inside">
            <li>Daniel Furmanov</li>
            <li>Maksim Pikovskiy</li>
            <li>Josiah R. Bernard</li>
            <li>Phone Khant Kyaw Swa</li>
          </ul>
        </div>
      </div>
      <div className="space-y-8">
        <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
          <video src="video.mp4" controls className="rounded-2xl"/>
        </div>
        <div
          className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:scale-101 cursor-pointer"
          onClick={() => setUseLocal(!useLocal)}
        >
          <div className="space-y-0.5">
            <Label>Data Fetching Method</Label>
            <p className="text-sm">
              {useLocal
                ? "Using Local Data Available to the Website"
                : "Fetching Data from data.ny.gov"}
            </p>
          </div>
          <div>
            <Switch
              checked={useLocal}
              onCheckedChange={setUseLocal}
              aria-readonly
              className="cursor-pointer data-[state=checked]:bg-[var(--color-royal)] data-[state=unchecked]:bg-[var(--color-royal-light)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
