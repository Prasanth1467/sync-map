/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate speed in km/h given distance and time difference
 * @param distanceKm Distance in kilometers
 * @param timeDiffSeconds Time difference in seconds
 * @returns Speed in km/h
 */
export function calculateSpeed(distanceKm: number, timeDiffSeconds: number): number {
  if (timeDiffSeconds === 0) return 0;
  const hours = timeDiffSeconds / 3600;
  return distanceKm / hours;
}

/**
 * Interpolate between two coordinates
 * @param start Start coordinate [lat, lng]
 * @param end End coordinate [lat, lng]
 * @param progress Progress between 0 and 1
 * @returns Interpolated coordinate [lat, lng]
 */
export function interpolateCoordinates(
  start: [number, number],
  end: [number, number],
  progress: number
): [number, number] {
  const lat = start[0] + (end[0] - start[0]) * progress;
  const lng = start[1] + (end[1] - start[1]) * progress;
  return [lat, lng];
}
