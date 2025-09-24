import { defaultWeights } from "@/lib/constants";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export default function RiskFormulaSection({ id }: { id: string }) {
  return (
    <section id={id} className="container mx-auto px-4 space-y-6 pt-12">
      <h2 className="text-2xl font-bold">Risk Factors & Score Formula</h2>
      <p>
        Using our cleaned datasets, we derived a composite Risk Score for each
        bus route and neighborhood. This score combines multiple risk factors
        into a normalized value between 0 and 1.
      </p>
      <Card>
        <CardContent className="p-4">
          <code className="block whitespace-pre-wrap">
            {`RiskScore(route/neighborhood) = Σ wᵢ * (xᵢ - min(xᵢ)) / (max(xᵢ) - min(xᵢ)) with Σ wᵢ = 1`}
          </code>
        </CardContent>
      </Card>

      <ScrollArea className="w-full overflow-auto">
        <Table className="mx-auto items-center justify-center">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Risk Factor (xᵢ)</TableHead>
              <TableHead className="text-center">Weight (wᵢ)</TableHead>
              <TableHead className="text-center">Rationale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Double Parked Violations</TableCell>
              <TableCell>{defaultWeights.doubleParkedViolation}</TableCell>
              <TableCell>High correlation with blockage & accidents</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bus Stop Violations</TableCell>
              <TableCell>{defaultWeights.busStopViolation}</TableCell>
              <TableCell>Frequent stop-area conflicts</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bus Lane Violations</TableCell>
              <TableCell>{defaultWeights.busLaneViolation}</TableCell>
              <TableCell>Impedes safe bus travel</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Speed of Bus</TableCell>
              <TableCell>{defaultWeights.speed}</TableCell>
              <TableCell>Higher speeds, higher severity</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bus Ridership</TableCell>
              <TableCell>{defaultWeights.ridership}</TableCell>
              <TableCell>More riders = greater impact</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <p className="italic">
        Feel free to adjust the weights or turn on/off each Risk Factor below if
        you do not agree with our selection.
      </p>
    </section>
  );
}
