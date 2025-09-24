import { scrollToSection } from "@/lib/utils";

export default function AppendixSection({ id }: { id: string }) {
  return (
    <section id={id} className="container mx-auto px-4 space-y-4">
      <h2 className="text-2xl font-bold">Appendix</h2>
      <p>
        Complete Python scripts, SQL queries, and intermediate datasets used in
        the analysis can be accessed on{" "}
        <a
          href="https://github.com/MaksimPikovskiy/mhc-datathon-2025"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary/50"
        >
          our GitHub
        </a>
        . This provides full transparency into how raw data became the risk
        scores displayed on this site.
      </p>
      {/* Resource Links */}
      <div className="pt-6">
        <h3 className="text-xl font-semibold mt-4">Resources</h3>
        <ul className="list-none list-inside space-y-1">
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/data"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              Data - All intermediate and final datasets used
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/web/src/data"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              Data - Data used by the website
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/web/src/api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              API - Fetching from server and local data
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/web/src/local-api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              API - Fetching from local data
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/scripts"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              Python Scripts - Grouping ACE/ABLE violations per neighborhood and
              adding average ridership and speed of buses
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L472"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              Risk Calculation for Bus Routes [App.tsx:472]
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L398"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              Risk Calculation for Neighborhoods [App.tsx:398]
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L348"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              Normalization of ACE/ABLE Violation, Speed, and Ridership Data
              [App.tsx:348]
            </a>
          </li>
          <li>
            <a
              href="https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L303"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary/50"
            >
              Normalization of Neighborhood Data [App.tsx:303]
            </a>
          </li>
        </ul>
      </div>
      {/* SoQL Queries */}
      <div className="space-y-2 pt-6">
        <h3 className="font-semibold text-md">
          SoQL Query to Get ACE Violations per Bus Route between 2020 and 2025
          <button
            onClick={() => scrollToSection("main_soql_note_appendix")}
            className="hover:underline hover:text-primary/50 cursor-pointer"
          >
            *
          </button>
        </h3>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`SELECT
    bus_route_id,
    COUNT(*) AS total_violations,
    SUM(CASE WHEN violation_type = 'MOBILE BUS STOP' THEN 1 ELSE 0 END) AS bus_stop_violations,
    SUM(CASE WHEN violation_type = 'MOBILE DOUBLE PARKED' THEN 1 ELSE 0 END) AS double_parked_violations,
    SUM(CASE WHEN violation_type = 'MOBILE BUS LANE' THEN 1 ELSE 0 END) AS bus_lane_violations
WHERE first_occurrence > '2019-12-31T23:59:59'
GROUP BY bus_route_id`}
            </code>
          </pre>
        </div>
        <h3 className="font-semibold text-md">
          SoQL Query to Get Bus Speeds for ACE/ABLE Enforced Routes
        </h3>
        <p className="text-sm mb-2 italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            inRouteList
          </span>{" "}
          is a variable containing the set of ACE/ABLE Enforced Bus Routes we
          mentioned earlier.
        </p>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`SELECT
  route_id,
  SUM(total_mileage) AS total_mileage,
  SUM(total_operating_time) AS total_operating_time,
  AVG(average_speed) AS average_speed
WHERE route_id IN (\${inRouteList})
GROUP BY route_id`}
            </code>
          </pre>
        </div>
        <h3 className="font-semibold text-md">
          SoQL Query to Get Bus Total Ridership for ACE/ABLE Enforced Routes
        </h3>
        <p className="text-sm italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            inRouteList
          </span>{" "}
          is a variable containing the set of ACE/ABLE Enforced Bus Routes we
          mentioned earlier.
        </p>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`SELECT
  route_id,
  SUM(total_mileage) AS total_mileage,
  SUM(total_operating_time) AS total_operating_time,
  AVG(average_speed) AS average_speed
WHERE route_id IN (\${inRouteList})
GROUP BY route_id`}
            </code>
          </pre>
        </div>
        <span id="main_soql_note_appendix" className="italic text-sm">
          *We limited main dataset to 2020-2025 due to Ridership and Speeds
          being in that range.
        </span>
      </div>
      {/* Python Scripts */}
      <div className="space-y-2 pt-6">
        <h3 id="neighborhood_grouper" className="font-semibold text-md">
          First Python Script that Groups ACE/ABLE Violations by NYC
          Neighborhoods, Total Violations, and Violation Types
        </h3>
        <p className="text-sm mb-2 italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            "violation_totals.csv" columns:
          </span>{" "}
          id, BoroName, NTAName, Bus Route ID, total_count
        </p>
        <p className="text-sm mb-2 italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            "violation_counts_by_type.csv" columns:
          </span>{" "}
          id, BoroName, NTAName, Bus Route ID, Violation Type, count
        </p>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`# File: neighborhood_grouper.py
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Files for input and output
geojson_path = "./data/NYC_Neighborhoods.json"
# ACE Violations for 2019-2025
# violations_csv_path = "./data/MTA_Bus_Automated_Camera_Enforcement_Violations__Beginning_October_2019_20250919.csv"
# ACE Violations for 2020-2025
violations_csv_path = "./data/MTA_Bus_Automated_Camera_Enforcement_Violations__Beginning_2020.csv"
output_detail_csv = "violation_counts_by_type.csv"
output_totals_csv = "violation_totals.csv"

# Count the Violation Types we want (set to None for everythin, if there are any)
target_types = ['MOBILE DOUBLE PARKED', 'MOBILE BUS STOP', 'MOBILE BUS LANE']

# Load polygons
polygons = gpd.read_file(geojson_path)
# Set Coordinate Reference System (CRS) to same one GeoJSON is in (EPSG:4326 in our case)
if polygons.crs is None:
    polygons.set_crs("EPSG:4326", inplace=True)
else:
    polygons = polygons.to_crs("EPSG:4326")

# Add an ID if one doesn't exist
if "id" not in polygons.columns:
    polygons["id"] = polygons.index.astype(str)

# load ACE Violation CSV with only the columns we care about
usecols = [
    'Violation Latitude',
    'Violation Longitude',
    'Violation Type',
    'Bus Route ID'
]
df = pd.read_csv(violations_csv_path, usecols=usecols)

#  Filter the three types early to save memory:
if target_types is not None:
    df = df[df['Violation Type'].str.lower().isin([t.lower()
                                                   for t in target_types])]

# Convert CSV to GeoDataFrame
points = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(
        df['Violation Longitude'], df['Violation Latitude']),
    crs="EPSG:4326"
)

# Do spatial join
joined = gpd.sjoin(points, polygons, how="inner", predicate="within")

# Fill empty Bus Route ID with ABLE
joined['Bus Route ID'] = joined['Bus Route ID'].fillna(
    'ABLE')  # or '' or 'None'

# Counts by polygon, bus route, and type
detail_counts = (
    joined
    .groupby(['id', 'BoroName', 'NTAName', 'Bus Route ID', 'Violation Type'])
    .size()
    .reset_index(name='count')
)

# Total counts by polygon and bus route
total_counts = (
    joined
    .groupby(['id', 'BoroName', 'NTAName', 'Bus Route ID'])
    .size()
    .reset_index(name='total_count')
)

# Write results to CSV
detail_counts.to_csv(output_detail_csv, index=False)
total_counts.to_csv(output_totals_csv, index=False)

print(f"Wrote detailed counts to {output_detail_csv}")
print(f"Wrote total counts to {output_totals_csv}")
`}
            </code>
          </pre>
        </div>
        <h3 id="csv_merger" className="font-semibold text-md">
          Second Python Script that Merges Two Previous CSV files into One File
          Based on Neighborhoods
        </h3>
        <p className="text-sm mb-2 italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            "neighborhood_stats.csv" columns:
          </span>{" "}
          borough_name, neighborhood_name, bus_route_ids, total_violations,
          bus_lane_violations, bus_stop_violations, double_parked_violations
        </p>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`# File: csv_merger.py
import pandas as pd

# Load files
df1 = pd.read_csv("./data/violation_totals.csv")
df2 = pd.read_csv("./data/violation_counts_by_type.csv")

# Output file
output_combined_csv = "neighborhood_stats.csv"

# Group by BoroName and NTAName
# Collect Bus Route IDs as a list
# Sum total_count
agg1 = (
    df1.groupby(["BoroName", "NTAName"])
    .agg({
        "Bus Route ID": lambda x: list(set(x)),  # unique bus route IDs
        "total_count": "sum"
    })
    .reset_index()
    .rename(columns={"Bus Route ID": "bus_route_ids",
                     "total_count": "total_violations"})
)

# Group by BoroName, NTAName, and Violation Type
# Sum those counts
# Pivot table so each violation type becomes its own column
agg2 = (
    df2.groupby(["BoroName", "NTAName", "Violation Type"])["count"]
    .sum()
    .reset_index()
    .pivot(index=["BoroName", "NTAName"],
           columns="Violation Type",
           values="count")
    .fillna(0)
    .reset_index()
)

# Merge on BoroName and NTAName
final = pd.merge(agg1, agg2, on=["BoroName", "NTAName"], how="outer")

# Clean up column names
final = final.rename(columns={
    "BoroName": "borough_name",
    "NTAName": "neighborhood_name",
    "MOBILE DOUBLE PARKED": "double_parked_violations",
    "MOBILE BUS STOP": "bus_stop_violations",
    "MOBILE BUS LANE": "bus_lane_violations"
})

# Save to CSV File
final.to_csv(output_combined_csv, index=False)

print(f"Wrote combined stats to {output_combined_csv}")`}
            </code>
          </pre>
        </div>
        <h3
          id="neighborhood_final_stats_maker"
          className="font-semibold text-md"
        >
          Third Python Script that Calculates Average Total Ridership and
          Average Average Speed of Buses per Neighborhood
        </h3>
        <p className="text-sm mb-2 italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            "neighbor_with_speeds_ridership.csv" columns:
          </span>{" "}
          borough_name, neighborhood_name, bus_route_ids, total_violations,
          bus_lane_violations, bus_stop_violations, double_parked_violations,
          avg_speed, avg_total_ridership
        </p>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`# File: neighborhood_final_stats_maker.py
import pandas as pd
import ast
import numpy as np

# Output file
output_stats_csv = "neighbor_with_speeds_ridership.csv"

# Load aggregated NTA CSV
df_nta = pd.read_csv("./data/neighborhood_stats.csv")

# If Bus Route IDs stored as string, convert to list
if df_nta['bus_route_ids'].dtype == object:
    df_nta['bus_route_ids'] = df_nta['bus_route_ids'].apply(ast.literal_eval)

# Combine and aggregate speeds
speeds_24 = pd.read_csv("./data/MTA_Bus_Speeds_2020-2024.csv")
speeds_25 = pd.read_csv("./data/MTA_Bus_Speeds_Beginning_2025.csv")

# Concatenate
all_speeds = pd.concat([speeds_24, speeds_25])

# Group by route_id and compute weighted average speed
avg_speeds = all_speeds.groupby("route_id")["average_speed"].mean().reset_index()

# Combine and aggregate ridership
ridership_24 = pd.read_csv("./data/MTA_Bus_Ridership_2020-2024.csv")
ridership_25 = pd.read_csv("./data/MTA_Bus_Ridership_Beginning_2025.csv")

all_ridership = pd.concat([ridership_24, ridership_25])
all_ridership["total_ridership"] = all_ridership["ridership"] + all_ridership["transfers"]

# Group by bus_route and compute average total ridership
avg_ridership = all_ridership.groupby("bus_route")["total_ridership"].mean().reset_index()

# Map to NTAs based on bus_route_ids
def compute_avg_speed(route_ids):
    subset = avg_speeds[avg_speeds["route_id"].isin(route_ids)]
    return subset["average_speed"].mean() if not subset.empty else None

def compute_avg_ridership(route_ids):
    subset = avg_ridership[avg_ridership["bus_route"].isin(route_ids)]
    return subset["total_ridership"].mean() if not subset.empty else None

df_nta["avg_speed"] = df_nta["bus_route_ids"].apply(compute_avg_speed)
df_nta["avg_total_ridership"] = df_nta["bus_route_ids"].apply(compute_avg_ridership)

# Round down avg_total_ridership
df_nta["avg_total_ridership"] = df_nta["avg_total_ridership"].apply(lambda x: np.floor(x) if pd.notnull(x) else x)

# Save updated CSV
df_nta.to_csv(output_stats_csv, index=False)
print(f"Wrote total counts to {output_stats_csv}")
`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
