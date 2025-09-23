import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type BusRidership from "@/models/BusRidership";
import type BusSpeed from "@/models/BusSpeed";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fixTitle = (title: string) => {
  return title
    .split("_")
    .map((word) => {
      if (word.toLowerCase() === "id") {
        return "ID";
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

export const fixCamelCaseTitle = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
};

export const mergeBusSpeeds = (data1: BusSpeed[], data2: BusSpeed[]) => {
  const map = new Map<string, BusSpeed>();

  const addToMap = (item: BusSpeed) => {
    if (map.has(item.route_id)) {
      const existing = map.get(item.route_id)!;
      const count = 2;
      map.set(item.route_id, {
        route_id: item.route_id,
        total_mileage: +existing.total_mileage + +item.total_mileage,
        total_operating_time:
          +existing.total_operating_time + +item.total_operating_time,
        average_speed: (+existing.average_speed + +item.average_speed) / count,
      });
    } else {
      map.set(item.route_id, { ...item });
    }
  };

  data1.forEach(addToMap);
  data2.forEach(addToMap);

  return Array.from(map.values());
};

export const mergeBusRiderships = (
  data1: BusRidership[],
  data2: BusRidership[]
) => {
  const map = new Map<string, BusRidership>();

  const addToMap = (item: BusRidership) => {
    if (map.has(item.bus_route)) {
      const existing = map.get(item.bus_route)!;
      map.set(item.bus_route, {
        bus_route: item.bus_route,
        total_ridership: +existing.total_ridership + +item.total_ridership,
        total_transfers: +existing.total_transfers + +item.total_transfers,
        total_riders:
          +existing.total_ridership +
          +item.total_ridership +
          +existing.total_transfers +
          +item.total_transfers,
      });
    } else {
      map.set(item.bus_route, {
        ...item,
        total_riders: +item.total_ridership + +item.total_transfers,
      });
    }
  };

  data1.forEach(addToMap);
  data2.forEach(addToMap);

  return Array.from(map.values());
};

export const normalizeArray = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);

  return values.map((v) => (max === min ? 0 : (v - min) / (max - min)));
};
