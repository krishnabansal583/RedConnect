// Common city coordinates for India
const cityCoordinates = {
  Delhi: { latitude: 28.7041, longitude: 77.1025 },
  Noida: { latitude: 28.5355, longitude: 77.3910 },
  Ghaziabad: { latitude: 28.6692, longitude: 77.4538 },
  Gurgaon: { latitude: 28.4595, longitude: 77.0266 },
  Mumbai: { latitude: 19.0760, longitude: 72.8777 },
  Bangalore: { latitude: 12.9716, longitude: 77.5946 },
  Pune: { latitude: 18.5204, longitude: 73.8567 },
  Hyderabad: { latitude: 17.3850, longitude: 78.4867 },
  Chennai: { latitude: 13.0827, longitude: 80.2707 },
  Kolkata: { latitude: 22.5726, longitude: 88.3639 },
};

const getCityCoordinates = (cityName) => {
  const city = Object.keys(cityCoordinates).find(
    (key) => key.toLowerCase() === cityName.toLowerCase()
  );
  return city ? cityCoordinates[city] : cityCoordinates.Delhi; // Default to Delhi
};

module.exports = {
  cityCoordinates,
  getCityCoordinates,
};
