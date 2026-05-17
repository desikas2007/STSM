export const TOURIST_ZONES = {
  Kodaikanal: { lat: 10.2381, lng: 77.4892, radiusKm: 15 },
  Ooty: { lat: 11.4102, lng: 76.6950, radiusKm: 12 },
  Munnar: { lat: 10.0889, lng: 77.0595, radiusKm: 18 },
  Coorg: { lat: 12.3375, lng: 75.8069, radiusKm: 20 },
  Shimla: { lat: 31.1048, lng: 77.1734, radiusKm: 25 },
};

const EARTH_RADIUS_KM = 6371;

export function getUserCoordinates() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  });
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function checkGeoFence(userLat, userLng, selectedLocation) {
  const zone = TOURIST_ZONES[selectedLocation];
  if (!zone || userLat == null || userLng == null) {
    return { insideZone: false, distanceKm: null, zoneName: selectedLocation };
  }
  const distanceKm = haversineDistance(userLat, userLng, zone.lat, zone.lng);
  const insideZone = distanceKm <= zone.radiusKm;
  return { insideZone, distanceKm, zoneName: selectedLocation };
}

export function watchUserLocation(selectedLocation, onStatusChange) {
  if (!navigator.geolocation) return null;

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const status = checkGeoFence(coords.lat, coords.lng, selectedLocation);
      onStatusChange({
        inside: status.insideZone,
        distance: status.distanceKm,
        coords,
        zoneName: status.zoneName,
      });
    },
    () => {
      onStatusChange({ inside: false, distance: null, coords: null, denied: true });
    },
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 20000 }
  );

  return watchId;
}

export function getNearbyIncidents(userLat, userLng, incidents) {
  if (!incidents?.length) return [];

  let nearestZone = null;
  let minDist = Infinity;

  Object.entries(TOURIST_ZONES).forEach(([name, zone]) => {
    const d = haversineDistance(userLat, userLng, zone.lat, zone.lng);
    if (d < minDist) {
      minDist = d;
      nearestZone = name;
    }
  });

  return incidents
    .filter((inc) => inc.location === nearestZone)
    .map((inc) => {
      const zone = TOURIST_ZONES[inc.location];
      const distanceKm = zone
        ? haversineDistance(userLat, userLng, zone.lat, zone.lng)
        : minDist;
      return { ...inc, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
