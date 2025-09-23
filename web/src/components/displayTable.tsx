import { fixTitle } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface DisplayTableProps<T> {
  /** data to display in the table */
  data: T[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DisplayTable<T extends Record<string, any>>({
  data,
}: DisplayTableProps<T>) {
  const cols = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div>
      <ScrollArea className="relative h-[575px] max-h-[575px] overflow-auto border rounded">
        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {cols.map((col) => (
                  <TableHead
                    key={col}
                    className="border-0 bg-white shadow-border shadow-[inset_0_-1px_0]"
                  >
                    <div className="flex flex-col">
                      <span className="select-none">{fixTitle(col)}</span>
                      <div>
                        <span className="text-gray-400 text-xs select-none">
                          (
                        </span>
                        <span className="text-gray-400 text-xs select-all">
                          {col}
                        </span>
                        <span className="text-gray-400 text-xs select-none">
                          )
                        </span>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {cols.map((col) => (
                    <TableCell key={col}>{row[col]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center">NO DATA</div>
        )}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
