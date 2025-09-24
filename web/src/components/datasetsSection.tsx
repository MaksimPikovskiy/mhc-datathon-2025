import { datasets } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SquareArrowOutUpRightIcon, Star, StarOff } from "lucide-react";

type DatasetsSectionProps = {
  id?: string;
};

export default function DatasetsSection({ id = "" }: DatasetsSectionProps) {
  return (
    <div id={id}>
      <h2 className="font-bold  text-xl mb-1">Datasets Used</h2>
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
                ds.main ? "border-blue-500" : ""
              }`}
            >
              <CardHeader className="flex items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  {ds.main ? (
                    <Star className="flex-shrink-0 h-5 w-5 text-yellow-500" fill="#f0b100" />
                  ) : (
                    <StarOff className="flex-shrink-0 h-5 w-4 text-gray-400" />
                  )}
                  <CardTitle className="text-lg font-semibold group-hover:underline">
                    {ds.name}
                  </CardTitle>
                </div>
                <SquareArrowOutUpRightIcon className="h-4 w-4 text-blue-600 opacity-70 group-hover:opacity-100" />
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
    </div>
  );
}
