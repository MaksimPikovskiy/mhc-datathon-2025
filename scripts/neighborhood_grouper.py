import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Files for input and output
geojson_path = "./data/NYC_Neighborhoods.json"
violations_csv_path = "./data/MTA_Bus_Automated_Camera_Enforcement_Violations__Beginning_October_2019_20250919.csv"
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
    df = df[df['Violation Type'].str.lower().isin([t.lower() for t in target_types])]

# Convert CSV to GeoDataFrame
points = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df['Violation Longitude'], df['Violation Latitude']),
    crs="EPSG:4326"
)

# Do spatial join
joined = gpd.sjoin(points, polygons, how="inner", predicate="within")

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
