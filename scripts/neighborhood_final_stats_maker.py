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
