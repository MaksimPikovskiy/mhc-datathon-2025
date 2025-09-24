import { fixCamelCaseTitle } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { defaultFactorsEnabled, defaultWeights } from "@/lib/constants";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface FactorsDisplayProps {
  id?: string;
  weights: {
    doubleParkedViolation: number;
    busStopViolation: number;
    busLaneViolation: number;
    speed: number;
    ridership: number;
  };
  setWeights: React.Dispatch<
    React.SetStateAction<{
      doubleParkedViolation: number;
      busStopViolation: number;
      busLaneViolation: number;
      speed: number;
      ridership: number;
    }>
  >;
  factorsEnabled: {
    doubleParkedViolation: boolean;
    busStopViolation: boolean;
    busLaneViolation: boolean;
    speed: boolean;
    ridership: boolean;
  };
  setFactorsEnabled: React.Dispatch<
    React.SetStateAction<{
      doubleParkedViolation: boolean;
      busStopViolation: boolean;
      busLaneViolation: boolean;
      speed: boolean;
      ridership: boolean;
    }>
  >;
}

export function FactorsDisplay({
  id = "",
  weights,
  setWeights,
  factorsEnabled,
  setFactorsEnabled,
}: FactorsDisplayProps) {
  const factors = Object.keys(weights) as (keyof typeof weights)[];

  const handleReset = () => {
    setFactorsEnabled(defaultFactorsEnabled);
    setWeights(defaultWeights);
  };

  return (
    <div id={id}>
      <h2 className="font-bold text-xl mb-2">Risk Factors</h2>
      <div className="w-full flex justify-end mb-2">
        <Button onClick={handleReset} className="cursor-pointer">
          Reset to Default
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {factors.map((factor) => (
          <Card
            key={factor}
            className={`p-4 ${!factorsEnabled[factor] ? "bg-gray-50" : ""}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {fixCamelCaseTitle(factor)}
                <Switch
                  checked={factorsEnabled[factor]}
                  onCheckedChange={(checked) =>
                    setFactorsEnabled((prev) => ({
                      ...prev,
                      [factor]: checked,
                    }))
                  }
                  className="cursor-pointer"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor={factor}>Weight: {weights[factor]}</Label>
              <div className="flex flex-row gap-3">
                <Slider
                  className="mt-2"
                  id={factor}
                  value={[weights[factor]]}
                  onValueChange={(value: number[]) =>
                    setWeights((prev) => ({ ...prev, [factor]: value[0] }))
                  }
                  max={1}
                  step={0.01}
                  disabled={!factorsEnabled[factor]}
                />
                <Input
                  type="number"
                  className="w-22"
                  value={weights[factor]}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(e) => {
                    const newVal = Number(e.target.value);
                    if (newVal >= 0 && newVal <= 1) {
                      setWeights((prev) => ({ ...prev, [factor]: newVal }));
                    }
                  }}
                  disabled={!factorsEnabled[factor]}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
