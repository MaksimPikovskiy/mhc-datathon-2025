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

print(f"Wrote combined stats to {output_combined_csv}")