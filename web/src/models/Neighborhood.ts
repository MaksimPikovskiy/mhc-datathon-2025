export default interface Neighborhood {
  id: number;
  borough_name: string;
  neighborhood_name: string;
  bus_route_ids: string;
  total_violations: number;
  bus_stop_violations: number;
  double_parked_violations: number;
  bus_lane_violations: number;
  avg_speed: number;
  avg_total_ridership: number;
}
