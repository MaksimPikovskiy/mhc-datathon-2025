import { useEffect, useState } from 'react'
import './App.css'
import { getData, type BusViolation } from './api/getData';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { CSV_COLUMNS, JSON_COLUMNS } from './util/constants';
import Navbar from './components/navbar';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';

function App() {
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<BusViolation[] | undefined>([]);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    getData({ offset, query }).then((data) => {
      setData(data);
    });
  }, [offset, query]);

  const handleQueryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setQuery(e.target.value);
  };

  const handlePrev = () => {
    setOffset((prev) => Math.max(prev - 1000, 0));
  }
  const handleNext = () => {
    setOffset((prev) => prev + 1000);
  }

  const renderCell = (col: keyof BusViolation, value: string | { type: "Point"; coordinates: number[]; }) => {
    if (col === 'violation_georeference' || col === 'bus_stop_georeference') {
      if (typeof value === 'object' && value !== null && 'coordinates' in value) {
        return `Point(${value.coordinates[0]}, ${value.coordinates[1]})`
      }
      return JSON.stringify(value);
    }
    return value as string;
  };

  return (
    <>
      <Navbar handlePrev={handlePrev} handleNext={handleNext} />
      <main className="mt-12 space-y-6">
        <div>
          <Label htmlFor="query">SoQL Query:</Label>
          <Textarea placeholder="Query" value={query} onChange={handleQueryChange} />
        </div>
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableCaption>ACE Data</TableCaption>
            <TableHeader>
              <TableRow>
                {CSV_COLUMNS.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.map((row: BusViolation) => (
                <TableRow key={row.violation_id}>
                  {JSON_COLUMNS.map((col) => (
                    <TableCell key={col}>{renderCell(col, row[col])}</TableCell>)
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  )
}

export default App
