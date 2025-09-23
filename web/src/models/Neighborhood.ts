export default interface Neighborhood {
  id: number;
  boroughName: string;
  neighborHoodName: string;
  busRouteIds: string[];
  totalViolations: number;
  busStopViolations: number;
  doubleParkedViolations: number;
  busLaneViolations: number;
}
