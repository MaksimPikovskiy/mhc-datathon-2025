import { scrollToSection } from "@/lib/utils";
import { Button } from "../ui/button";

type HeroSectionProps = {
  id?: string;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
};

export default function HeroSection({
  id = "",
  setCurrentIndex,
}: HeroSectionProps) {
  return (
    <section
      id={id}
      className="bg-gradient-to-b from-purple-800 to-purple-600 text-white py-16 rounded-t-xl"
    >
      <div className="container mx-auto px-4 text-center space-y-6">
        <h1 className="text-4xl font-bold">
          Bus Route & Neighborhood Risk Analysis
        </h1>
        <p className="max-w-2xl mx-auto text-lg">
          Identifying high-risk bus routes and neighborhoods using ACE/ABLE
          violations, bus speeds, and bus total ridership data.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={() => {
              setCurrentIndex(0);
              scrollToSection("intro");
            }}
          >
            Watch Overview
          </Button>
          <Button
            className="bg-white text-purple-700 hover:bg-purple-100 cursor-pointer"
            onClick={() => {
              setCurrentIndex(4);
              scrollToSection("findings");
            }}
          >
            View Findings
          </Button>
        </div>
      </div>
    </section>
  );
}
