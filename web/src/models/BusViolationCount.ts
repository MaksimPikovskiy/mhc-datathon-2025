export default interface BusViolationCount {
  bus_route_id: string;
  total_violations: number;
  bus_stop_violations: number;
  double_parked_violations: number;
  bus_lane_violations: number;
}
