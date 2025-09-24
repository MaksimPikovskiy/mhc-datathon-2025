# Bus Route & Neighborhood Risk Analysis

Identifying high-risk bus routes and neighborhoods using ACE/ABLE violations, bus speeds, and bus total ridership data.

## Introduction

Urban bus systems are vital for mobility, but safety remains a pressing issue. Our team investigates how bus route characteristics-ACE (and ABLE) violations, speeds, and ridership-affect accident risk.

- **Problem:** Develop a Bus Route Risk Score and Neighborhood Risk Score estimating accident probability.
- **Business Question:** Which bus routes and neighborhoods have the highest accident likelihood?
- **Focus:** Identify dangerous routes and neighborhoods to prioritize safety interventions.

### Report by Team Mechanicus

- Daniel Furmanov
- Maksim Pikovskiy
- Josiah R. Bernard
- Phone Khant Kyaw Swa

#### Live Version of This Report is available at the following links:

- https://mhc-datathon-2025.vercel.app/
-
- Live version allows you to play around with weights of risk factors, as well as enabling or disabling said risk factors

## Dictionary of Terms

Quick reference for key terms and acronyms used throughout this report.

**ACE (Automated Camera Enforcement)**

- NYC program that uses bus-mounted camera systems to detect bus lane, bus stop, and parking violations along bus routes.

**ABLE**

- “Automated Bus Lane Enforcement” - similar to ACE but focused on bus lane priority enforcement on select corridors.

**Double Parked Violation**

- A violation that occurs when a bus is blocked by or stops next to a double-parked vehicle, potentially causing delays or unsafe conditions.

**Bus Stop Violation**

- A violation that is recorded when a bus is obstructed or stops improperly at a bus stop.

**Bus Lane Violation**

- A violation that is recorded when a vehicle blocks or drives in a dedicated bus lane, interfering with bus flow and schedule adherence.

**Ridership**

- Average number of passengers boarding buses (plus transfers) on a given route or neighborhood.

**Speed**

- The average operating speed of a bus on a route or the average operating speed of a buses operating within a neighborhood.

**Neighborhood (NTA)**

- NYC Neighborhood Tabulation Areas (NTAs) used to aggregate violations, speeds, and ridership data spatially.

**Risk Score**

- Composite metric combining violations, bus speeds, and ridership to estimate the likelihood of accidents or serious incidents. We utilize a weighted average in this report instead of weighted sum.

**Normalized Value**

- A rescaled number (0–1) so different factors can be compared fairly within the risk score formula.

## Datasets Used

We compiled data from multiple sources to examine violations, speeds, and ridership across NYC bus routes.

- [MTA Bus Automated Camera Enforcement Violations: Beginning October 2019](https://data.ny.gov/Transportation/MTA-Bus-Automated-Camera-Enforcement-Violations-Be/kh8p-hcbm/about_data)

- [ACE/ABLE-Enforced Bus Routes](https://data.ny.gov/Transportation/MTA-Bus-Automated-Camera-Enforced-Routes-Beginning/ki2b-sg5y/about_data)

- [MTA Bus Hourly Ridership: 2020-2024](https://data.ny.gov/Transportation/MTA-Bus-Hourly-Ridership-2020-2024/kv7t-n8in/about_data)

- [MTA Bus Hourly Ridership: Beginning 2025](https://data.ny.gov/Transportation/MTA-Bus-Hourly-Ridership-Beginning-2025/gxb3-akrn/about_data)

- [MTA Bus Speeds: 2020 - 2024](https://data.ny.gov/Transportation/MTA-Bus-Speeds-2020-2024/6ksi-7cxr/about_data)

- [MTA Bus Speeds: Beginning 2025](https://data.ny.gov/Transportation/MTA-Bus-Speeds-Beginning-2025/4u4b-jge6/about_data)

- [2020 Neighborhood Tabulation Areas (NTAs)](https://www.nyc.gov/content/planning/pages/resources/datasets/neighborhood-tabulation)

**Up next:** A closer look at the ACE/ABLE Enforced Bus Routes dataset, our primary input for filtering the datasets you saw above.

## ACE/ABLE Enforced Bus Routes

B25, B26, B35, B41, B42, B44+, B46+, B62, B82+, BX3, BX5, BX6+, BX7, BX12+, BX19, BX20, BX28, BX35, BX36, BX38, BX41+, M2, M4, M14+, M15+, M23+, M34+, M42, M60+, M79, M86+, M100, M101, Q5, Q6, Q43, Q44+, Q53+, Q54, Q58, Q69, S46, S79+

## From Raw Data to Processed Insights

After gathering enforcement, speed, and ridership datasets, we ran SoQL queries and Python scripts to combine and clean the data. This produced our set of datasets (seen in "Our Data at a Glance" below), which powers the analysis.

Appendix: Full Python scripts too large to display here are linked [here](#appendix).

### SoQL Query to get ACE Violations per Bus Route between 2020 and 2025\*

Counts total automated camera enforcement (ACE) violations per bus route, as well as breaking them down into bus stop, double parked, and bus lane categories.

    SELECT
      bus_route_id,
      COUNT(*) AS total_violations,
      SUM(CASE WHEN violation_type = 'MOBILE BUS STOP' THEN 1 ELSE 0 END) AS bus_stop_violations,
      SUM(CASE WHEN violation_type = 'MOBILE DOUBLE PARKED' THEN 1 ELSE 0 END) AS double_parked_violations,
      SUM(CASE WHEN violation_type = 'MOBILE BUS LANE' THEN 1 ELSE 0 END) AS bus_lane_violations
    WHERE first_occurrence > '2019-12-31T23:59:59'
    GROUP BY bus_route_id

### SoQL Query to get Bus Speeds for ACE/ABLE Enforced Routes

inRouteList is a variable containing the set of ACE/ABLE Enforced Bus Routes we mentioned earlier.

Retrieves total mileage, total operating time, and computes average speed for each enforced route.

    SELECT
      route_id,
      SUM(total_mileage) AS total_mileage,
      SUM(total_operating_time) AS total_operating_time,
      AVG(average_speed) AS average_speed
    WHERE route_id IN (${inRouteList})
    GROUP BY route_id

### SoQL Query to get Bus Total Ridership for ACE/ABLE Enforced Routes

inRouteList is a variable containing the set of ACE/ABLE Enforced Bus Routes we mentioned earlier.

Returns ridership totals plus transfer total for the list of enforced routes, which is combined into total_riders on the website.

    SELECT
      route_id,
      SUM(total_mileage) AS total_mileage,
      SUM(total_operating_time) AS total_operating_time,
      AVG(average_speed) AS average_speed
    WHERE route_id IN (${inRouteList})
    GROUP BY route_id

\*We limited main dataset to 2020-2025 due to Ridership and Speeds being in that range.

### Python Scripts for Neighborhood Grouping (using geopandas, pandas, numpy)

These scripts turn the raw data of NYC Neighborhoods GeoJSON and ACE Violations (2020-2025) dataset into clean, aggregated table the website uses for risk score calculations of neighborhoods.

#### neighborhood_grouper.py

Reads all ACE violation points, assigns them to NYC neighborhood polygons (spatial join), counts totals and by type, and outputs two CSVs: `violation_totals.csv` (per neighborhood) and `violation_counts_by_type.csv` (per neighborhood & type).

#### csv_merger.py

Merges `violation_totals.csv` and `violation_counts_by_type.csv` into one file `neighborhood_stats.csv`, aggregating bus routes, total violations, and violation types per neighborhood.

#### neighborhood_final_stats_maker.py

Reads `neighborhood_stats.csv`, plus speed and ridership data for 2020–2025, calculates each neighborhood’s _average speed_ and _average total ridership_ across all its bus routes (floors ridership values), and saves as `neighbor_with_speeds_ridership.csv`.

## Our Data at a Glance

### ACE Violations

#### Combined Data

![Bar Chart of Total ACE Violations for Bus Routes](/visuals/graph_total_violations.png)

#### Data Split by Violation Type

![Bar Chart of ACE Violations for Bus Routes Grouped by Violation Type](/visuals/graph_violations_by_type.png)

### Bus Speeds

![Bar Chart of Bus Average Speeds for Bus Routes](/visuals/graph_speeds.png)

### Bus Total Riderships

![Bar Chart of Total Ridership for Bus Routes](/visuals/graph_riderships.png)

### NYC Neigborhoods (skip to next section: [Risk Factors & Score Formula](#risk-factors--score-formula))

| **Borough**        | **Neighborhood**                                      | **Bus Route IDs**                                      | **Total Violations** | **Bus Lane Violations** | **Bus Stop Violations** | **Double Parked Violations** |      **Avg Speed** | **Avg Total Ridership** |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------ | -------------------- | ----------------------- | ----------------------- | ---------------------------- | -----------------: | ----------------------: |
| Bronx Bedford Park | ['BX41+', 'BX28']                                     | 40057                                                  | 22965.0              | 6711.0                  | 10381.0                 | 8.136487444117648            |          2698185.0 |
| Bronx              | Belmont                                               | ['BX12+', 'BX19', 'BX41+']                             | 57927                | 39526.0                 | 8870.0                  | 9531.0                       |  8.083061902941177 |               6527196.0 |
| Bronx              | Bronx Park                                            | ['Q44+', 'BX12+', 'BX19', 'BX28-BX38', 'BX41+']        | 986                  | 1.0                     | 423.0                   | 562.0                        |  8.411771114202526 |               7321899.0 |
| Bronx              | Castle Hill-Unionport                                 | ['BX5', 'BX36', 'Q44+']                                | 36846                | 0.0                     | 7833.0                  | 29013.0                      |  8.301420946107571 |               6336072.0 |
| Bronx              | Claremont Village-Claremont (East)                    | ['BX35', 'BX41+']                                      | 36684                | 25854.0                 | 4298.0                  | 6532.0                       |  7.290596322111345 |               3184700.0 |
| Bronx              | Co-op City                                            | ['BX12+', 'BX28', 'BX38']                              | 52855                | 0.0                     | 14215.0                 | 38640.0                      |  8.087440804761904 |               4801927.0 |
| Bronx              | Concourse-Concourse Village                           | ['BX41+', 'BX35', 'BX19', 'BX6+']                      | 59966                | 15602.0                 | 12535.0                 | 31829.0                      |  7.066301837394958 |               4185214.0 |
| Bronx              | Crotona Park                                          | ['BX19']                                               | 514                  | 0.0                     | 41.0                    | 473.0                        |   5.92200628592437 |               7114236.0 |
| Bronx              | Crotona Park East                                     | ['BX35', 'BX19']                                       | 51480                | 0.0                     | 3926.0                  | 47554.0                      |  5.831223386239496 |               5395049.0 |
| Bronx              | Eastchester-Edenwald-Baychester                       | ['BX28-BX38', 'BX12+', 'BX5', 'BX28']                  | 3940                 | 845.0                   | 1697.0                  | 1398.0                       |  8.660845322023809 |               5049517.0 |
| Bronx              | Ferry Point Park-St. Raymond Cemetery                 | ['Q44+']                                               | 17                   | 0.0                     | 0.0                     | 17.0                         |  9.397898747986577 |               9706008.0 |
| Bronx              | Fordham Heights                                       | ['BX12+', 'BX41+']                                     | 39529                | 31940.0                 | 6478.0                  | 1111.0                       |   9.16358971144958 |               6233676.0 |
| Bronx              | Highbridge                                            | ['BX36', 'BX35', 'BX6+']                               | 3280                 | 8.0                     | 1.0                     | 3271.0                       |  6.648309008683474 |               4521128.0 |
| Bronx              | Hunts Point                                           | ['BX5', 'BX19', 'BX6+']                                | 54933                | 370.0                   | 15983.0                 | 38580.0                      |  7.582633558543417 |               4347788.0 |
| Bronx              | Hutchinson Metro Center                               | ['BX12+']                                              | 2                    | 0.0                     | 0.0                     | 2.0                          |  9.486427265231093 |               9773814.0 |
| Bronx              | Longwood                                              | ['BX5', 'BX35', 'BX19', 'BX6+']                        | 108420               | 135.0                   | 26076.0                 | 82209.0                      |  7.122085290546218 |               4179806.0 |
| Bronx              | Melrose                                               | ['BX41+', 'BX19']                                      | 70926                | 32449.0                 | 21942.0                 | 16535.0                      |  7.381379221796219 |               4903888.0 |
| Bronx              | Morris Park                                           | ['BX12+']                                              | 974                  | 838.0                   | 125.0                   | 11.0                         |  9.486427265231093 |               9773814.0 |
| Bronx              | Morrisania                                            | ['BX35', 'BX41+', 'BX6+']                              | 49057                | 5453.0                  | 10487.0                 | 33117.0                      | 7.4477336878851546 |               3208874.0 |
| Bronx              | Mott Haven-Port Morris                                | ['BX41+', 'BX19']                                      | 29760                | 14644.0                 | 7056.0                  | 8060.0                       |  7.381379221796219 |               4903888.0 |
| Bronx              | Mount Eden-Claremont (West)                           | ['BX36', 'BX35', 'BX41+']                              | 14188                | 11230.0                 | 1968.0                  | 990.0                        |  7.007890254761905 |               4333234.0 |
| Bronx              | Mount Hope                                            | ['BX36', 'BX41+']                                      | 54481                | 29557.0                 | 14106.0                 | 10818.0                      |  7.641615138865546 |               4661921.0 |
| Bronx              | Norwood                                               | ['BX28-BX38', 'BX41+', 'BX28']                         | 60018                | 17222.0                 | 16347.0                 | 26449.0                      |  8.136487444117648 |               2698185.0 |
| Bronx              | Parkchester                                           | ['BX36', 'Q44+']                                       | 15595                | 0.0                     | 2314.0                  | 13281.0                      |  7.920188434024801 |               8168155.0 |
| Bronx              | Pelham Bay Park                                       | ['BX5', 'BX12+']                                       | 3415                 | 1.0                     | 700.0                   | 2714.0                       |  9.275156617752101 |               6222860.0 |
| Bronx              | Pelham Bay-Country Club-City Island                   | ['BX5', 'BX12+']                                       | 245                  | 0.0                     | 227.0                   | 18.0                         |  9.275156617752101 |               6222860.0 |
| Bronx              | Pelham Gardens                                        | ['BX28-BX38', 'BX28']                                  | 4449                 | 1965.0                  | 2222.0                  | 262.0                        | 7.4322227305672275 |               2702830.0 |
| Bronx              | Pelham Parkway-Van Nest                               | ['BX36', 'BX12+']                                      | 6288                 | 364.0                   | 549.0                   | 5375.0                       |  7.964452692647059 |               8202058.0 |
| Bronx              | Soundview Park                                        | ['BX5']                                                | 1                    | 1.0                     | 0.0                     | 0.0                          |  9.063885970273109 |               2671906.0 |
| Bronx              | Soundview-Bruckner-Bronx River                        | ['BX5', 'BX36', 'Q44+']                                | 25587                | 114.0                   | 5193.0                  | 20280.0                      |  8.301420946107571 |               6336072.0 |
| Bronx              | Soundview-Clason Point                                | ['BX5', 'BX36']                                        | 18126                | 4309.0                  | 1296.0                  | 12521.0                      |  7.753182045168067 |               4651104.0 |
| Bronx              | Throgs Neck-Schuylerville                             | ['BX5']                                                | 111                  | 0.0                     | 35.0                    | 76.0                         |  9.063885970273109 |               2671906.0 |
| Bronx              | Tremont                                               | ['BX36', 'BX19']                                       | 51621                | 0.0                     | 15881.0                 | 35740.0                      |  6.182242202993698 |               6872269.0 |
| Bronx              | University Heights (North)-Fordham                    | ['BX12+', 'BX28']                                      | 67741                | 44190.0                 | 13896.0                 | 9655.0                       |   8.45932499789916 |               6238322.0 |
| Bronx              | University Heights (South)-Morris Heights             | ['BX36']                                               | 34405                | 17834.0                 | 4987.0                  | 11584.0                      |  6.442478120063026 |               6630302.0 |
| Bronx              | West Farms                                            | ['BX36', 'BX19', 'Q44+']                               | 26839                | 0.0                     | 10615.0                 | 16224.0                      |  7.254127717991324 |               7816849.0 |
| Bronx              | Westchester Square                                    | ['Q44+']                                               | 18                   | 0.0                     | 9.0                     | 9.0                          |  9.397898747986577 |               9706008.0 |
| Bronx              | Williamsbridge-Olinville                              | ['BX28-BX38', 'BX41+', 'BX28']                         | 5640                 | 1654.0                  | 1867.0                  | 2119.0                       |  8.136487444117648 |               2698185.0 |
| Bronx              | Yankee Stadium-Macombs Dam Park                       | ['BX6+']                                               | 391                  | 60.0                    | 312.0                   | 19.0                         |  7.762008419432773 |               3257221.0 |
| Brooklyn           | Bath Beach                                            | ['B82+']                                               | 2550                 | 0.0                     | 1216.0                  | 1334.0                       |  8.747185855698529 |               4610798.0 |
| Brooklyn           | Bay Ridge                                             | ['S79+']                                               | 12660                | 0.0                     | 2658.0                  | 10002.0                      | 14.613236617750985 |               6089324.0 |
| Brooklyn           | Bedford-Stuyvesant (East)                             | ['B25', 'B26', 'B46+']                                 | 18841                | 268.0                   | 14341.0                 | 4232.0                       |  7.261690829969257 |               4181684.0 |
| Brooklyn           | Bedford-Stuyvesant (West)                             | ['B44+', 'B25', 'B26', 'ABLE', 'B46+']                 | 37620                | 11279.0                 | 19184.0                 | 7157.0                       |  7.674371170680427 |               4416870.0 |
| Brooklyn           | Bensonhurst                                           | ['B82+']                                               | 5788                 | 0.0                     | 3221.0                  | 2567.0                       |  8.747185855698529 |               4610798.0 |
| Brooklyn           | Borough Park                                          | ['S46', 'B35']                                         | 13294                | 0.0                     | 5618.0                  | 7676.0                       |  8.422701232138479 |               5414215.0 |
| Brooklyn           | Brooklyn Heights                                      | ['B25', 'B41']                                         | 1005                 | 0.0                     | 787.0                   | 218.0                        |  6.689187124054621 |               6691929.0 |
| Brooklyn           | Brooklyn Navy Yard                                    | ['B62']                                                | 254                  | 0.0                     | 52.0                    | 202.0                        |  7.234617428886555 |               3527343.0 |
| Brooklyn           | Brownsville                                           | ['S46', 'B35']                                         | 6976                 | 0.0                     | 3935.0                  | 3041.0                       |  8.422701232138479 |               5414215.0 |
| Brooklyn           | Bushwick (East)                                       | ['B26', 'Q58']                                         | 6627                 | 0.0                     | 5509.0                  | 1118.0                       |  7.324333083455882 |               9075567.0 |
| Brooklyn           | Canarsie                                              | ['B82+', 'B42']                                        | 36264                | 6041.0                  | 17843.0                 | 12380.0                      |  8.248080466819854 |               2637517.0 |
| Brooklyn           | Clinton Hill                                          | ['B25', 'B26', 'B62']                                  | 9437                 | 7082.0                  | 1249.0                  | 1106.0                       |   6.89722602745098 |               3535547.0 |
| Brooklyn           | Crown Heights (North)                                 | ['ABLE', 'B46+', 'B44+']                               | 24483                | 13962.0                 | 8165.0                  | 2356.0                       |  8.620212014627661 |               5294091.0 |
| Brooklyn           | Crown Heights (South)                                 | ['ABLE', 'B46+', 'B44+']                               | 32214                | 21590.0                 | 7636.0                  | 2988.0                       |  8.620212014627661 |               5294091.0 |
| Brooklyn           | Cypress Hills                                         | ['B25']                                                | 3                    | 0.0                     | 0.0                     | 3.0                          |  6.373767801995798 |               3259700.0 |
| Brooklyn           | Downtown Brooklyn-DUMBO-Boerum Hill                   | ['B25', 'B26', 'B41', 'B62']                           | 35544                | 10786.0                 | 20253.0                 | 4505.0                       |  6.924071132116596 |               5182700.0 |
| Brooklyn           | East Flatbush-Erasmus                                 | ['S46', 'B35', 'B44+', 'ABLE', 'B41', 'B46+']          | 48078                | 5094.0                  | 27202.0                 | 15782.0                      |  8.218086587929145 |               6308154.0 |
| Brooklyn           | East Flatbush-Farragut                                | ['ABLE', 'B46+', 'B44+']                               | 25396                | 19749.0                 | 3167.0                  | 2480.0                       |  8.620212014627661 |               5294091.0 |
| Brooklyn           | East Flatbush-Remsen Village                          | ['S46', 'B35']                                         | 15111                | 0.0                     | 8737.0                  | 6374.0                       |  8.422701232138479 |               5414215.0 |
| Brooklyn           | East Flatbush-Rugby                                   | ['S46', 'B35', 'ABLE', 'B46+']                         | 91438                | 39209.0                 | 29941.0                 | 22288.0                      |  8.391138100239449 |               5431394.0 |
| Brooklyn           | East New York (North)                                 | ['B25']                                                | 791                  | 0.0                     | 784.0                   | 7.0                          |  6.373767801995798 |               3259700.0 |
| Brooklyn           | East New York-New Lots                                | ['B82+']                                               | 988                  | 0.0                     | 254.0                   | 734.0                        |  8.747185855698529 |               4610798.0 |
| Brooklyn           | East Williamsburg                                     | ['Q54']                                                | 7029                 | 0.0                     | 4999.0                  | 2030.0                       |  7.948510901575631 |               5409201.0 |
| Brooklyn           | Flatbush                                              | ['S46', 'B35', 'B44+', 'ABLE', 'B41']                  | 87313                | 30403.0                 | 25178.0                 | 31732.0                      |  8.190605275801085 |               6518754.0 |
| Brooklyn           | Flatbush (West)-Ditmas Park-Parkville                 | ['S46', 'B35']                                         | 6649                 | 2375.0                  | 2061.0                  | 2213.0                       |  8.422701232138479 |               5414215.0 |
| Brooklyn           | Flatlands                                             | ['B82+', 'B44+', 'ABLE', 'B41', 'B46+']                | 72106                | 24810.0                 | 25151.0                 | 22145.0                      |  8.248054082766824 |               6330784.0 |
| Brooklyn           | Fort Greene                                           | ['B25', 'B26', 'B41', 'B62']                           | 22321                | 14771.0                 | 6581.0                  | 969.0                        |  6.924071132116596 |               5182700.0 |
| Brooklyn           | Fort Hamilton                                         | ['S79+']                                               | 31                   | 0.0                     | 0.0                     | 31.0                         | 14.613236617750985 |               6089324.0 |
| Brooklyn           | Gravesend (East)-Homecrest                            | ['B82+']                                               | 16939                | 913.0                   | 9913.0                  | 6113.0                       |  8.747185855698529 |               4610798.0 |
| Brooklyn           | Gravesend (West)                                      | ['B82+']                                               | 26363                | 1709.0                  | 12815.0                 | 11839.0                      |  8.747185855698529 |               4610798.0 |
| Brooklyn           | Greenpoint                                            | ['B62']                                                | 2308                 | 0.0                     | 2082.0                  | 226.0                        |  7.234617428886555 |               3527343.0 |
| Brooklyn           | Kensington                                            | ['S46', 'B35']                                         | 17641                | 1373.0                  | 10952.0                 | 5316.0                       |  8.422701232138479 |               5414215.0 |
| Brooklyn           | Madison                                               | ['B82+', 'B44+']                                       | 21441                | 3091.0                  | 9025.0                  | 9325.0                       |  8.829799024256232 |               4866613.0 |
| Brooklyn           | Marine Park-Mill Basin-Bergen Beach                   | ['B82+', 'B41', 'B46+', 'B44+']                        | 14379                | 5.0                     | 9204.0                  | 5170.0                       |  8.248054082766824 |               6330784.0 |
| Brooklyn           | Midwood                                               | ['B82+', 'B44+']                                       | 13538                | 64.0                    | 4183.0                  | 9291.0                       |  8.829799024256232 |               4866613.0 |
| Brooklyn           | Ocean Hill                                            | ['B25', 'B26']                                         | 3758                 | 0.0                     | 2634.0                  | 1124.0                       |  6.728530326733193 |               3539649.0 |
| Brooklyn           | Park Slope                                            | ['B41']                                                | 5874                 | 77.0                    | 5331.0                  | 466.0                        |  7.004606446113446 |              10124158.0 |
| Brooklyn           | Prospect Heights                                      | ['B41']                                                | 4389                 | 0.0                     | 3886.0                  | 503.0                        |  7.004606446113446 |              10124158.0 |
| Brooklyn           | Prospect Lefferts Gardens-Wingate                     | ['ABLE', 'B41', 'B46+', 'B44+']                        | 18554                | 5531.0                  | 7104.0                  | 5919.0                       |  8.081676825122921 |               6904113.0 |
| Brooklyn           | Prospect Park                                         | ['B41']                                                | 1359                 | 0.0                     | 1011.0                  | 348.0                        |  7.004606446113446 |              10124158.0 |
| Brooklyn           | Sheepshead Bay-Manhattan Beach-Gerritsen Beach        | ['B44+']                                               | 9147                 | 80.0                    | 4666.0                  | 4401.0                       |  8.912412192813935 |               5122428.0 |
| Brooklyn           | South Williamsburg                                    | ['B62', 'Q54', 'B44+']                                 | 5130                 | 1.0                     | 3380.0                  | 1749.0                       |   8.03184684109204 |               4686324.0 |
| Brooklyn           | Spring Creek-Starrett City                            | ['B82+']                                               | 12516                | 2874.0                  | 8219.0                  | 1423.0                       |  8.747185855698529 |               4610798.0 |
| Brooklyn           | Sunset Park (Central)                                 | ['S46', 'B35']                                         | 1686                 | 0.0                     | 1063.0                  | 623.0                        |  8.422701232138479 |               5414215.0 |
| Brooklyn           | Sunset Park (East)-Borough Park (West)                | ['S46', 'B35']                                         | 7721                 | 0.0                     | 3183.0                  | 4538.0                       |  8.422701232138479 |               5414215.0 |
| Brooklyn           | Sunset Park (West)                                    | ['S46', 'B35']                                         | 4099                 | 0.0                     | 2541.0                  | 1558.0                       |  8.422701232138479 |               5414215.0 |
| Brooklyn           | Williamsburg                                          | ['B62', 'Q54', 'B44+']                                 | 9998                 | 0.0                     | 8703.0                  | 1295.0                       |   8.03184684109204 |               4686324.0 |
| Manhattan          | Central Park                                          | ['M2', 'M86+', 'M79+', 'ABLE', 'M4']                   | 7235                 | 2800.0                  | 4399.0                  | 36.0                         | 6.4966229996060925 |               6888650.0 |
| Manhattan          | Chelsea-Hudson Yards                                  | ['M14+', 'M42', 'M23+', 'M34+', 'ABLE']                | 10643                | 5694.0                  | 4300.0                  | 649.0                        |  5.498198590931373 |               4839499.0 |
| Manhattan          | Chinatown-Two Bridges                                 | ['M15+']                                               | 23198                | 386.0                   | 13689.0                 | 9123.0                       |  8.262252518907562 |              15618761.0 |
| Manhattan          | East Harlem (North)                                   | ['M15+', 'M60+', 'M101', 'BX19', 'ABLE']               | 104001               | 52946.0                 | 32258.0                 | 18797.0                      | 7.9108689817489495 |               9474248.0 |
| Manhattan          | East Harlem (South)                                   | ['M15+', 'ABLE', 'M2', 'M101']                         | 70843                | 34573.0                 | 14242.0                 | 22028.0                      |  7.273940017612045 |              10054997.0 |
| Manhattan          | East Midtown-Turtle Bay                               | ['M15+', 'ABLE', 'M42', 'M101']                        | 41259                | 30804.0                 | 9622.0                  | 833.0                        | 6.6468205296218486 |              10333202.0 |
| Manhattan          | East Village                                          | ['M14+', 'M15+', 'M2', 'M101', 'ABLE']                 | 63840                | 43984.0                 | 16764.0                 | 3092.0                       |  7.273940017612045 |              10054997.0 |
| Manhattan          | Financial District-Battery Park City                  | ['M15+']                                               | 30465                | 0.0                     | 21886.0                 | 8579.0                       |  8.262252518907562 |              15618761.0 |
| Manhattan          | Gramercy                                              | ['M14+', 'M15+', 'M2', 'M101', 'M23+', 'M34+', 'ABLE'] | 97748                | 70240.0                 | 16160.0                 | 11348.0                      |  6.630744785651261 |               7866293.0 |
| Manhattan          | Greenwich Village                                     | ['M14+', 'ABLE', 'M2']                                 | 3781                 | 1583.0                  | 2120.0                  | 78.0                         |  7.044050361344538 |               4517409.0 |
| Manhattan          | Hamilton Heights-Sugar Hill                           | ['M101', 'M100', 'BX19', 'BX6+', 'M4']                 | 76170                | 0.0                     | 26945.0                 | 49225.0                      | 6.5056470318907555 |               6465285.0 |
| Manhattan          | Harlem (North)                                        | ['M2', 'BX19', 'BX6+']                                 | 32061                | 0.0                     | 10276.0                 | 21785.0                      | 6.9093550222338935 |               4962955.0 |
| Manhattan          | Harlem (South)                                        | ['M60+', 'M101', 'M2', 'M4']                           | 69532                | 49843.0                 | 17035.0                 | 2654.0                       | 7.6629726086659655 |               6843263.0 |
| Manhattan          | Hell's Kitchen                                        | ['M42']                                                | 2140                 | 1744.0                  | 305.0                   | 91.0                         |   5.16269189737395 |               5352023.0 |
| Manhattan          | Highbridge Park                                       | ['BX36', 'M101', 'M100', 'M2']                         | 11988                | 0.0                     | 3606.0                  | 8382.0                       |  6.545531496087185 |               6352757.0 |
| Manhattan          | Inwood                                                | ['BX12+', 'M100']                                      | 75103                | 28367.0                 | 3456.0                  | 43280.0                      |  7.833253797794118 |               7004155.0 |
| Manhattan          | Inwood Hill Park                                      | ['M100']                                               | 212                  | 0.0                     | 58.0                    | 154.0                        |  6.180080330357143 |               4234497.0 |
| Manhattan          | Lower East Side                                       | ['M14+', 'M15+', 'ABLE']                               | 13916                | 4708.0                  | 6187.0                  | 3021.0                       |  8.262252518907562 |              15618761.0 |
| Manhattan          | Manhattanville-West Harlem                            | ['M101', 'M4']                                         | 17077                | 0.0                     | 7277.0                  | 9800.0                       |  6.332070061869748 |               8860235.0 |
| Manhattan          | Midtown South-Flatiron-Union Square                   | ['M14+', 'M2', 'M23+', 'M34+', 'ABLE', 'M4']           | 15281                | 8468.0                  | 6691.0                  | 122.0                        |  6.131144296980041 |               5343883.0 |
| Manhattan          | Midtown-Times Square                                  | ['M42', 'ABLE', 'M2', 'M34+']                          | 9607                 | 5314.0                  | 4278.0                  | 15.0                         |  5.909878904831932 |               4448074.0 |
| Manhattan          | Morningside Heights                                   | ['M60+', 'M101', 'M100', 'M4']                         | 37505                | 2101.0                  | 7404.0                  | 28000.0                      | 7.4469801009191166 |               6772535.0 |
| Manhattan          | Murray Hill-Kips Bay                                  | ['M15+', 'M101', 'M42', 'M23+', 'M34+', 'ABLE']        | 78874                | 47958.0                 | 26100.0                 | 4816.0                       |  6.254473092857143 |               8033216.0 |
| Manhattan          | Stuyvesant Town-Peter Cooper Village                  | ['M14+', 'M15+', 'M23+', 'M34+', 'ABLE']               | 4188                 | 3753.0                  | 345.0                   | 90.0                         | 6.5313854647759095 |               8261745.0 |
| Manhattan          | Tribeca-Civic Center                                  | ['M15+']                                               | 5214                 | 0.0                     | 3506.0                  | 1708.0                       |  8.262252518907562 |              15618761.0 |
| Manhattan          | United Nations                                        | ['M15+', 'ABLE']                                       | 5139                 | 4822.0                  | 303.0                   | 14.0                         |  8.262252518907562 |              15618761.0 |
| Manhattan          | Upper East Side-Carnegie Hill                         | ['M2', 'M86+', 'M79+', 'M101', 'ABLE']                 | 43197                | 11264.0                 | 19547.0                 | 12386.0                      |  6.588346554963236 |               7472943.0 |
| Manhattan          | Upper East Side-Lenox Hill-Roosevelt Island           | ['M79+', 'M15+', 'ABLE', 'M101']                       | 109328               | 79725.0                 | 22442.0                 | 7161.0                       |  7.138704165791316 |              10519309.0 |
| Manhattan          | Upper East Side-Yorkville                             | ['M15+', 'M86+', 'M79+', 'M101', 'ABLE']               | 90614                | 48886.0                 | 22574.0                 | 19154.0                      |  6.892897094353991 |              10248281.0 |
| Manhattan          | Upper West Side (Central)                             | ['M79+', 'ABLE', 'M86+']                               | 32747                | 3424.0                  | 7203.0                  | 22120.0                      |  6.396909342962185 |               7672771.0 |
| Manhattan          | Upper West Side-Manhattan Valley                      | ['M60+', 'M4']                                         | 3309                 | 0.0                     | 985.0                   | 2324.0                       |  8.546161450367647 |               6413412.0 |
| Manhattan          | Washington Heights (North)                            | ['BX35', 'M101', 'M100', 'BX36', 'M4']                 | 68309                | 14006.0                 | 24287.0                 | 30016.0                      |  6.205427812142856 |               6452226.0 |
| Manhattan          | Washington Heights (South)                            | ['BX35', 'M2', 'M101', 'M100', 'BX6+', 'BX36', 'M4']   | 103077               | 2794.0                  | 33011.0                 | 67272.0                      |  6.547599691641657 |               5719394.0 |
| Manhattan          | West Village                                          | ['M14+', 'ABLE']                                       | 3138                 | 1184.0                  | 1781.0                  | 173.0                        |                    |                         |
| Queens             | Astoria (Central)                                     | ['Q69', 'M60+']                                        | 245                  | 71.0                    | 77.0                    | 97.0                         |  9.243093613554798 |               5144106.0 |
| Queens             | Astoria (East)-Woodside (North)                       | ['M60+']                                               | 1710                 | 0.0                     | 1359.0                  | 351.0                        | 10.943699949579832 |               5135174.0 |
| Queens             | Astoria (North)-Ditmars-Steinway                      | ['Q69', 'M60+']                                        | 11647                | 11.0                    | 5163.0                  | 6473.0                       |  9.243093613554798 |               5144106.0 |
| Queens             | Baisley Park                                          | ['Q5']                                                 | 2441                 | 254.0                   | 2067.0                  | 120.0                        |   8.87736410922619 |               5075025.0 |
| Queens             | Bellerose                                             | ['Q43']                                                | 1958                 | 0.0                     | 1762.0                  | 196.0                        |  9.269227604166666 |               5884928.0 |
| Queens             | Breezy Point-Belle Harbor-Rockaway Park-Broad Channel | ['Q53+']                                               | 1488                 | 117.0                   | 959.0                   | 412.0                        | 11.803766093452381 |               6826571.0 |
| Queens             | College Point                                         | ['Q44+']                                               | 9                    | 0.0                     | 0.0                     | 9.0                          |  9.397898747986577 |               9706008.0 |
| Queens             | Corona                                                | ['Q58']                                                | 20614                | 0.0                     | 11394.0                 | 9220.0                       |  7.565373315441176 |              14331535.0 |
| Queens             | East Elmhurst                                         | ['M60+']                                               | 4206                 | 0.0                     | 3060.0                  | 1146.0                       | 10.943699949579832 |               5135174.0 |
| Queens             | Elmhurst                                              | ['Q53+', 'Q58']                                        | 28483                | 1461.0                  | 18598.0                 | 8424.0                       |   9.68456970444678 |              10579053.0 |
| Queens             | Flushing Meadows-Corona Park                          | ['Q58']                                                | 390                  | 0.0                     | 165.0                   | 225.0                        |  7.565373315441176 |              14331535.0 |
| Queens             | Flushing-Willets Point                                | ['Q58', 'Q44+']                                        | 49006                | 20854.0                 | 18176.0                 | 9976.0                       |  8.481636031713876 |              12018771.0 |
| Queens             | Forest Hills                                          | ['Q54']                                                | 2405                 | 0.0                     | 2361.0                  | 44.0                         |  7.948510901575631 |               5409201.0 |
| Queens             | Forest Park                                           | ['Q53+', 'Q54']                                        | 218                  | 98.0                    | 100.0                   | 20.0                         |  9.876138497514006 |               6117886.0 |
| Queens             | Glen Oaks-Floral Park-New Hyde Park                   | ['Q43']                                                | 992                  | 0.0                     | 679.0                   | 313.0                        |  9.269227604166666 |               5884928.0 |
| Queens             | Glendale                                              | ['Q53+', 'Q54']                                        | 2088                 | 1217.0                  | 794.0                   | 77.0                         |  9.876138497514006 |               6117886.0 |
| Queens             | Hollis                                                | ['Q43']                                                | 5720                 | 3037.0                  | 2169.0                  | 514.0                        |  9.269227604166666 |               5884928.0 |
| Queens             | Howard Beach-Lindenwood                               | ['Q53+']                                               | 7059                 | 0.0                     | 5384.0                  | 1675.0                       | 11.803766093452381 |               6826571.0 |
| Queens             | Jackson Heights                                       | ['Q69', 'M60+']                                        | 315                  | 0.0                     | 69.0                    | 246.0                        |  9.243093613554798 |               5144106.0 |
| Queens             | Jamaica                                               | ['Q43', 'Q5', 'Q54', 'Q44+']                           | 151976               | 79411.0                 | 59360.0                 | 13205.0                      |  8.873250340738766 |               6518790.0 |
| Queens             | Jamaica Bay (East)                                    | ['Q53+']                                               | 13                   | 0.0                     | 10.0                    | 3.0                          | 11.803766093452381 |               6826571.0 |
| Queens             | Jamaica Estates-Holliswood                            | ['Q43']                                                | 14447                | 6014.0                  | 6086.0                  | 2347.0                       |  9.269227604166666 |               5884928.0 |
| Queens             | Jamaica Hills-Briarwood                               | ['Q43', 'Q54', 'Q44+']                                 | 31215                | 4195.0                  | 11826.0                 | 15194.0                      |   8.87187908457629 |               7000046.0 |
| Queens             | Kew Gardens                                           | ['Q54']                                                | 2535                 | 0.0                     | 2068.0                  | 467.0                        |  7.948510901575631 |               5409201.0 |
| Queens             | Kew Gardens Hills                                     | ['Q44+']                                               | 10401                | 0.0                     | 7851.0                  | 2550.0                       |  9.397898747986577 |               9706008.0 |
| Queens             | LaGuardia Airport                                     | ['M60+']                                               | 684                  | 0.0                     | 637.0                   | 47.0                         | 10.943699949579832 |               5135174.0 |
| Queens             | Laurelton                                             | ['Q5']                                                 | 4980                 | 0.0                     | 3349.0                  | 1631.0                       |   8.87736410922619 |               5075025.0 |
| Queens             | Long Island City-Hunters Point                        | ['Q69', 'B62']                                         | 3874                 | 0.0                     | 2909.0                  | 965.0                        | 7.3885523532081585 |               4340191.0 |
| Queens             | Maspeth                                               | ['Q54', 'Q58']                                         | 22146                | 0.0                     | 15629.0                 | 6517.0                       |  7.756942108508404 |               9870368.0 |
| Queens             | Middle Village                                        | ['Q53+', 'Q54']                                        | 5234                 | 919.0                   | 3761.0                  | 554.0                        |  9.876138497514006 |               6117886.0 |
| Queens             | Middle Village Cemetery                               | ['Q54']                                                | 136                  | 0.0                     | 131.0                   | 5.0                          |  7.948510901575631 |               5409201.0 |
| Queens             | Mount Hebron & Cedar Grove Cemeteries                 | ['Q44+']                                               | 480                  | 0.0                     | 477.0                   | 3.0                          |  9.397898747986577 |               9706008.0 |
| Queens             | Mount Olivet & All Faiths Cemeteries                  | ['Q54']                                                | 341                  | 0.0                     | 332.0                   | 9.0                          |  7.948510901575631 |               5409201.0 |
| Queens             | Murray Hill-Broadway Flushing                         | ['Q44+']                                               | 2014                 | 0.0                     | 1115.0                  | 899.0                        |  9.397898747986577 |               9706008.0 |
| Queens             | Old Astoria-Hallets Point                             | ['Q69']                                                | 961                  | 232.0                   | 547.0                   | 182.0                        |  7.542487277529762 |               5153038.0 |
| Queens             | Ozone Park                                            | ['Q53+']                                               | 3506                 | 1947.0                  | 1471.0                  | 88.0                         | 11.803766093452381 |               6826571.0 |
| Queens             | Ozone Park (North)                                    | ['Q53+']                                               | 83                   | 80.0                    | 3.0                     | 0.0                          | 11.803766093452381 |               6826571.0 |
| Queens             | Queens Village                                        | ['Q43']                                                | 1219                 | 0.0                     | 824.0                   | 395.0                        |  9.269227604166666 |               5884928.0 |
| Queens             | Queensboro Hill                                       | ['Q58', 'Q44+']                                        | 4983                 | 2569.0                  | 1415.0                  | 999.0                        |  8.481636031713876 |              12018771.0 |
| Queens             | Queensbridge-Ravenswood-Dutch Kills                   | ['Q69']                                                | 1958                 | 991.0                   | 853.0                   | 114.0                        |  7.542487277529762 |               5153038.0 |
| Queens             | Rego Park                                             | ['Q53+', 'Q54']                                        | 2277                 | 363.0                   | 1849.0                  | 65.0                         |  9.876138497514006 |               6117886.0 |
| Queens             | Richmond Hill                                         | ['Q54']                                                | 4024                 | 0.0                     | 3551.0                  | 473.0                        |  7.948510901575631 |               5409201.0 |
| Queens             | Ridgewood                                             | ['B26', 'Q54', 'Q58']                                  | 33253                | 6892.0                  | 24521.0                 | 1840.0                       | 7.5323923561624655 |               7853445.0 |
| Queens             | Rockaway Beach-Arverne-Edgemere                       | ['Q53+']                                               | 526                  | 279.0                   | 229.0                   | 18.0                         | 11.803766093452381 |               6826571.0 |
| Queens             | Rosedale                                              | ['Q5']                                                 | 312                  | 0.0                     | 217.0                   | 95.0                         |   8.87736410922619 |               5075025.0 |
| Queens             | South Jamaica                                         | ['Q5']                                                 | 11396                | 2955.0                  | 7042.0                  | 1399.0                       |   8.87736410922619 |               5075025.0 |
| Queens             | Spring Creek Park                                     | ['Q53+']                                               | 27                   | 0.0                     | 0.0                     | 27.0                         | 11.803766093452381 |               6826571.0 |
| Queens             | Springfield Gardens (North)-Rochdale Village          | ['Q5']                                                 | 1876                 | 420.0                   | 1405.0                  | 51.0                         |   8.87736410922619 |               5075025.0 |
| Queens             | St. Albans                                            | ['Q5']                                                 | 4262                 | 688.0                   | 3258.0                  | 316.0                        |   8.87736410922619 |               5075025.0 |
| Queens             | St. John Cemetery                                     | ['Q53+', 'Q54']                                        | 509                  | 51.0                    | 344.0                   | 114.0                        |  9.876138497514006 |               6117886.0 |
| Queens             | Whitestone-Beechhurst                                 | ['Q44+']                                               | 1748                 | 0.0                     | 1418.0                  | 330.0                        |  9.397898747986577 |               9706008.0 |
| Queens             | Woodhaven                                             | ['Q53+']                                               | 197                  | 44.0                    | 127.0                   | 26.0                         | 11.803766093452381 |               6826571.0 |
| Queens             | Woodside                                              | ['Q53+']                                               | 5283                 | 0.0                     | 4019.0                  | 1264.0                       | 11.803766093452381 |               6826571.0 |
| Staten Island      | Freshkills Park (North)                               | ['S79+']                                               | 5                    | 3.0                     | 1.0                     | 1.0                          | 14.613236617750985 |               6089324.0 |
| Staten Island      | Grasmere-Arrochar-South Beach-Dongan Hills            | ['S79+']                                               | 3490                 | 2233.0                  | 1149.0                  | 108.0                        | 14.613236617750985 |               6089324.0 |
| Staten Island      | Great Kills Park                                      | ['S79+']                                               | 56                   | 44.0                    | 9.0                     | 3.0                          | 14.613236617750985 |               6089324.0 |
| Staten Island      | Great Kills-Eltingville                               | ['S79+']                                               | 3524                 | 245.0                   | 3043.0                  | 236.0                        | 14.613236617750985 |               6089324.0 |
| Staten Island      | Mariner's Harbor-Arlington-Graniteville               | ['S46']                                                | 1835                 | 0.0                     | 1784.0                  | 51.0                         |  11.10885125282738 |               1421214.0 |
| Staten Island      | New Dorp-Midland Beach                                | ['S79+']                                               | 951                  | 448.0                   | 474.0                   | 29.0                         | 14.613236617750985 |               6089324.0 |
| Staten Island      | New Springville-Willowbrook-Bulls Head-Travis         | ['S46', 'S79+']                                        | 222                  | 57.0                    | 104.0                   | 61.0                         | 12.861043935289182 |               3755269.0 |
| Staten Island      | Oakwood-Richmondtown                                  | ['S79+']                                               | 280                  | 174.0                   | 98.0                    | 8.0                          | 14.613236617750985 |               6089324.0 |
| Staten Island      | Port Richmond                                         | ['S46']                                                | 1547                 | 0.0                     | 1396.0                  | 151.0                        |  11.10885125282738 |               1421214.0 |
| Staten Island      | Rosebank-Shore Acres-Park Hill                        | ['S79+']                                               | 121                  | 0.0                     | 60.0                    | 61.0                         | 14.613236617750985 |               6089324.0 |
| Staten Island      | St. George-New Brighton                               | ['S46']                                                | 5851                 | 3125.0                  | 1926.0                  | 800.0                        |  11.10885125282738 |               1421214.0 |
| Staten Island      | Todt Hill-Emerson Hill-Lighthouse Hill-Manor Heights  | ['S79+']                                               | 19                   | 18.0                    | 0.0                     | 1.0                          | 14.613236617750985 |               6089324.0 |
| Staten Island      | Tompkinsville-Stapleton-Clifton-Fox Hills             | ['S46']                                                | 1545                 | 571.0                   | 973.0                   | 1.0                          |  11.10885125282738 |               1421214.0 |
| Staten Island      | West New Brighton-Silver Lake-Grymes Hill             | ['S46']                                                | 1607                 | 196.0                   | 1319.0                  | 92.0                         |  11.10885125282738 |               1421214.0 |

## Risk Factors & Score Formula

Using our cleaned datasets, we derived a composite Risk Score for each bus route and neighborhood. This score combines multiple risk factors into a normalized value between 0 and 1.

`RiskScore(route/neighborhood) = Σ wᵢ * (xᵢ - min(xᵢ)) / (max(xᵢ) - min(xᵢ)) with Σ wᵢ = 1`

| **Risk Factor (xᵢ)**     | **Weight (wᵢ)** | **Rationale**                              |
| ------------------------ | --------------- | ------------------------------------------ |
| Double Parked Violations | 0.28            | High correlation with blockage & accidents |
| Bus Stop Violations      | 0.22            | Frequent stop-area conflicts               |
| Bus Lane Violations      | 0.20            | Impedes safe bus travel                    |
| Speed of Bus             | 0.18            | Higher speeds, higher severity             |
| Bus Ridership            | 0.12            | More riders = greater impact               |

## Findings

With weights applied, we computed risk scores for each route and neighborhood. The following chart and map showcase the outcomes of our analysis.

### Risk Score for Bus Routes

![Bar Chart of Risk Scores for Bus Routes](/visuals/graph_risk_bus_routes.png)

### Mapping Risk for Neighborhoods

![Map of Risk Scores for Neighborhoods](/visuals/map_risk_neighborhoods.png)

## Conclusion

### Findings

Our analysis highlights routes and neighborhoods with the highest estimated risk of accidents, guiding potential safety interventions.

### Recommendations

Prioritize enforcement and infrastructure improvements on high-risk routes; increase rider safety education where applicable.

### Limitations

Data availability varies by time and location; some violations may be underreported; additional factors (weather, driver behavior) were not included.

## Appendix

Complete Python scripts, SQL queries, and intermediate datasets used in the analysis can be accessed on [our GitHub](https://github.com/MaksimPikovskiy/mhc-datathon-2025). This provides full transparency into how raw data became the risk scores displayed on this site.

### Resources

- [Data - All intermediate and final datasets used](https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/data)
- [Data - Data used by the website](https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/web/src/data)
- [API - Fetching from server and local data](https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/web/src/api)
- [API - Fetching from local data](https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/web/src/local-api)
- [Python Scripts - Grouping ACE/ABLE violations per neighborhood and adding average ridership and speed of buses](https://github.com/MaksimPikovskiy/mhc-datathon-2025/tree/main/scripts)
- [Risk Calculation for Bus Routes \[App.tsx:472\]](https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L472)
- [Risk Calculation for Neighborhoods \[App.tsx:398\]](https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L398)
- [Normalization of ACE/ABLE Violation, Speed, and Ridership Data \[App.tsx:348\]](https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L348)
- [Normalization of Neighborhood Data \[App.tsx:303\]](https://github.com/MaksimPikovskiy/mhc-datathon-2025/blob/60558a5e01eea83e16da13ecdd55a71a1cbeae96/web/src/App.tsx#L303)

### SoQL Query to Get ACE Violations per Bus Route between 2020 and 2025\*

    SELECT
        bus_route_id,
        COUNT(*) AS total_violations,
        SUM(CASE WHEN violation_type = 'MOBILE BUS STOP' THEN 1 ELSE 0 END) AS bus_stop_violations,
        SUM(CASE WHEN violation_type = 'MOBILE DOUBLE PARKED' THEN 1 ELSE 0 END) AS double_parked_violations,
        SUM(CASE WHEN violation_type = 'MOBILE BUS LANE' THEN 1 ELSE 0 END) AS bus_lane_violations
    WHERE first_occurrence > '2019-12-31T23:59:59'
    GROUP BY bus_route_id

### SoQL Query to Get Bus Speeds for ACE/ABLE Enforced Routes

inRouteList is a variable containing the set of ACE/ABLE Enforced Bus Routes we mentioned earlier.

    SELECT
      route_id,
      SUM(total_mileage) AS total_mileage,
      SUM(total_operating_time) AS total_operating_time,
      AVG(average_speed) AS average_speed
    WHERE route_id IN (${inRouteList})
    GROUP BY route_id

### SoQL Query to Get Bus Total Ridership for ACE/ABLE Enforced Routes

inRouteList is a variable containing the set of ACE/ABLE Enforced Bus Routes we mentioned earlier.

    SELECT
      route_id,
      SUM(total_mileage) AS total_mileage,
      SUM(total_operating_time) AS total_operating_time,
      AVG(average_speed) AS average_speed
    WHERE route_id IN (${inRouteList})
    GROUP BY route_id

\*We limited main dataset to 2020-2025 due to Ridership and Speeds being in that range.

### First Python Script that Groups ACE/ABLE Violations by NYC Neighborhoods, Total Violations, and Violation Types

"violation_totals.csv" columns: id, BoroName, NTAName, Bus Route ID, total_count

"violation_counts_by_type.csv" columns: id, BoroName, NTAName, Bus Route ID, Violation Type, count

    # File: neighborhood_grouper.py
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

### Second Python Script that Merges Two Previous CSV files into One File Based on Neighborhoods

"neighborhood_stats.csv" columns: borough_name, neighborhood_name, bus_route_ids, total_violations, bus_lane_violations, bus_stop_violations, double_parked_violations

    # File: csv_merger.py
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

### Third Python Script that Calculates Average Total Ridership and Average Average Speed of Buses per Neighborhood

"neighbor_with_speeds_ridership.csv" columns: borough_name, neighborhood_name, bus_route_ids, total_violations, bus_lane_violations, bus_stop_violations, double_parked_violations, avg_speed, avg_total_ridership

    # File: neighborhood_final_stats_maker.py
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
