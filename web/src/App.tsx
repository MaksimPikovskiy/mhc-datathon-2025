import './App.css'
import { type BusRoute, getRouteData, getViolationData, type BusViolation } from './api/getData';
import { JSON_COLUMNS } from './util/constants';
import Navbar from './components/navbar';
import { DataTable } from './components/data-table';

function App() {
  return (
    <>
      <Navbar />
      <main className="mt-12 space-y-6">
        <DataTable<BusViolation>
          title="Bus Violation"
          fetchData={getViolationData}
          columns={JSON_COLUMNS}
          renderCell={(col, value) => {
            if (
              col === 'violation_georeference' ||
              col === 'bus_stop_georeference'
            ) {
              if (typeof value === 'object' && value?.coordinates) {
                return `Point(${value.coordinates[0]}, ${value.coordinates[1]})`
              }
              return JSON.stringify(value)
            }
            return value as string
          }}
        />
        <DataTable<BusRoute>
          title="Bus Route"
          fetchData={getRouteData}
        />
      </main>
    </>
  )
}

export default App
