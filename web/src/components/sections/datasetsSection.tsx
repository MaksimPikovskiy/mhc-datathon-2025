import { datasets } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SquareArrowOutUpRightIcon, Star, StarOff } from "lucide-react";

type DatasetsSectionProps = {
  id?: string;
};

export default function DatasetsSection({ id = "" }: DatasetsSectionProps) {
  return (
    <section id={id} className="space-y-3 pt-12">
      <h2 className="font-bold text-xl">Datasets Used</h2>
      <p>
        We compiled data from multiple sources to examine violations, speeds,
        and ridership across NYC bus routes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((ds) => (
          <a
            key={ds.name}
            href={ds.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card
              className={`hover:shadow-lg transition h-full ${
                ds.main ? "border-[var(--color-royal)]" : ""
              }`}
            >
              <CardHeader className="flex items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  {ds.main ? (
                    <Star
                      className="flex-shrink-0 h-5 w-5 text-yellow-500"
                      fill="#f0b100"
                    />
                  ) : (
                    <StarOff className="flex-shrink-0 h-5 w-4 text-gray-400" />
                  )}
                  <CardTitle className="text-lg font-semibold group-hover:underline">
                    {ds.name}
                  </CardTitle>
                </div>
                <SquareArrowOutUpRightIcon className="flex-shrink-0 h-4 w-4 text-[var(--color-royal)] opacity-70 group-hover:opacity-100" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground break-words">
                  {ds.link}
                </p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
      <p className="italic">
        <strong>Up next:</strong> A closer look at the ACE/ABLE Enforced Bus
        Routes dataset, our primary input for filtering the datasets you saw above.
      </p>
    </section>
  );
}
