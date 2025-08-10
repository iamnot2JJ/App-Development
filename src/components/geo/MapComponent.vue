<template>
  <div class="map-container">
    <div class="map-controls mb-3">
      <div class="row g-2">
        <div class="col-md-4">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Search places..."
              v-model="searchQuery"
              @keyup.enter="searchPlaces"
            />
            <button class="btn btn-primary" @click="searchPlaces">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="selectedCategory" @change="filterMarkers">
            <option value="">All Services</option>
            <option value="hospital">Hospitals</option>
            <option value="clinic">Clinics</option>
            <option value="pharmacy">Pharmacies</option>
            <option value="counseling">Counseling Centers</option>
            <option value="community">Community Centers</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-success w-100" @click="getCurrentLocation">
            <i class="fas fa-crosshairs"></i> My Location
          </button>
        </div>
        <div class="col-md-3">
          <button class="btn btn-info w-100" @click="showDirections = !showDirections">
            <i class="fas fa-route"></i> Directions
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDirections" class="directions-panel card mb-3">
      <div class="card-header">
        <h6 class="mb-0">Get Directions</h6>
      </div>
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-5">
            <input
              type="text"
              class="form-control"
              placeholder="From location..."
              v-model="directionsFrom"
            />
          </div>
          <div class="col-md-5">
            <input
              type="text"
              class="form-control"
              placeholder="To location..."
              v-model="directionsTo"
            />
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" @click="calculateRoute">
              <i class="fas fa-directions"></i>
            </button>
          </div>
        </div>
        <div v-if="routeInfo" class="mt-2">
          <small class="text-muted">
            Distance: {{ routeInfo.distance }} | Duration: {{ routeInfo.duration }}
          </small>
        </div>
      </div>
    </div>

    <div id="map" class="map-display"></div>

    <div class="search-results mt-3" v-if="searchResults.length > 0">
      <h6>Search Results</h6>
      <div class="list-group">
        <button
          v-for="result in searchResults"
          :key="result.id"
          class="list-group-item list-group-item-action"
          @click="selectLocation(result)"
        >
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">{{ result.name }}</h6>
              <p class="mb-1">{{ result.address }}</p>
              <small class="text-muted">{{ result.category }}</small>
            </div>
            <small class="text-muted">{{ result.distance }}km</small>
          </div>
        </button>
      </div>
    </div>

    <div class="legend mt-3">
      <h6>Legend</h6>
      <div class="d-flex flex-wrap gap-3">
        <div class="legend-item" v-for="type in markerTypes" :key="type.key">
          <i :class="`fas ${type.icon}`" :style="`color: ${type.color}`"></i>
          <span class="ms-1">{{ type.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MapComponent',
  setup() {
    const map = ref(null)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const showDirections = ref(false)
    const directionsFrom = ref('')
    const directionsTo = ref('')
    const searchResults = ref([])
    const routeInfo = ref(null)
    const markers = ref([])
    const userLocation = ref(null)

    const markerTypes = [
      { key: 'hospital', label: 'Hospitals', icon: 'fa-hospital', color: '#dc3545' },
      { key: 'clinic', label: 'Clinics', icon: 'fa-clinic-medical', color: '#0dcaf0' },
      { key: 'pharmacy', label: 'Pharmacies', icon: 'fa-pills', color: '#198754' },
      { key: 'counseling', label: 'Counseling', icon: 'fa-brain', color: '#6f42c1' },
      { key: 'community', label: 'Community Centers', icon: 'fa-users', color: '#fd7e14' },
    ]

    // Sample healthcare locations in Melbourne
    const healthcareLocations = [
      {
        id: 1,
        name: 'Royal Melbourne Hospital',
        category: 'hospital',
        lat: -37.7991,
        lng: 144.9553,
        address: '300 Grattan St, Parkville VIC 3050',
        phone: '(03) 9342 7000',
        services: ['Emergency', 'General Medicine', 'Surgery'],
      },
      {
        id: 2,
        name: "St Vincent's Hospital",
        category: 'hospital',
        lat: -37.8197,
        lng: 144.9745,
        address: '41 Victoria Parade, Fitzroy VIC 3065',
        phone: '(03) 9231 2211',
        services: ['Emergency', 'Cardiology', 'Oncology'],
      },
      {
        id: 3,
        name: 'Melbourne City Medical Centre',
        category: 'clinic',
        lat: -37.8136,
        lng: 144.9631,
        address: '123 Collins St, Melbourne VIC 3000',
        phone: '(03) 9654 1234',
        services: ['General Practice', 'Vaccination', 'Health Checks'],
      },
      {
        id: 4,
        name: 'Multicultural Health Clinic',
        category: 'clinic',
        lat: -37.808,
        lng: 144.95,
        address: '456 Spencer St, Melbourne VIC 3000',
        phone: '(03) 9612 5678',
        services: ['Interpreter Services', 'Cultural Health Support', 'Mental Health'],
      },
      {
        id: 5,
        name: 'Priceline Pharmacy Collins St',
        category: 'pharmacy',
        lat: -37.8142,
        lng: 144.9665,
        address: '200 Collins St, Melbourne VIC 3000',
        phone: '(03) 9650 9876',
        services: ['Prescriptions', 'Health Advice', 'Vaccinations'],
      },
      {
        id: 6,
        name: 'Migrant Mental Health Services',
        category: 'counseling',
        lat: -37.809,
        lng: 144.96,
        address: '789 Bourke St, Melbourne VIC 3000',
        phone: '(03) 9666 4321',
        services: ['Counseling', 'Group Therapy', 'Crisis Support'],
      },
      {
        id: 7,
        name: 'Carlton Community Centre',
        category: 'community',
        lat: -37.7994,
        lng: 144.9672,
        address: '150 Princes St, Carlton VIC 3053',
        phone: '(03) 9347 8000',
        services: ['Language Classes', 'Social Support', 'Employment Help'],
      },
    ]

    const initializeMap = () => {
      // Create map centered on Melbourne
      map.value = L.map('map').setView([-37.8136, 144.9631], 13)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.value)

      // Add markers for healthcare locations
      addHealthcareMarkers()
    }

    const addHealthcareMarkers = () => {
      healthcareLocations.forEach((location) => {
        const markerType = markerTypes.find((type) => type.key === location.category)

        const customIcon = L.divIcon({
          html: `<i class="fas ${markerType.icon}" style="color: ${markerType.color}; font-size: 20px;"></i>`,
          iconSize: [20, 20],
          className: 'custom-marker',
        })

        const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map.value)
          .bindPopup(`
            <div class="marker-popup">
              <h6>${location.name}</h6>
              <p><i class="fas fa-map-marker-alt"></i> ${location.address}</p>
              <p><i class="fas fa-phone"></i> ${location.phone}</p>
              <div class="services">
                <strong>Services:</strong>
                <ul class="mb-0">
                  ${location.services.map((service) => `<li>${service}</li>`).join('')}
                </ul>
              </div>
              <div class="mt-2">
                <button class="btn btn-sm btn-primary me-2" onclick="getDirectionsTo('${
                  location.lat
                },${location.lng}')">
                  <i class="fas fa-route"></i> Directions
                </button>
                <button class="btn btn-sm btn-success" onclick="callLocation('${location.phone}')">
                  <i class="fas fa-phone"></i> Call
                </button>
              </div>
            </div>
          `)

        markers.value.push({ marker, location })
      })
    }

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude

            userLocation.value = { lat, lng }

            // Add user location marker
            const userIcon = L.divIcon({
              html: '<i class="fas fa-user-circle" style="color: #007bff; font-size: 24px;"></i>',
              iconSize: [24, 24],
              className: 'user-marker',
            })

            L.marker([lat, lng], { icon: userIcon }).addTo(map.value).bindPopup('Your Location')

            // Center map on user location
            map.value.setView([lat, lng], 15)

            // Update distances in search results
            updateDistances()
          },
          (error) => {
            console.error('Error getting location:', error)
            alert('Unable to get your location. Please check your browser settings.')
          }
        )
      } else {
        alert('Geolocation is not supported by this browser.')
      }
    }

    const searchPlaces = async () => {
      if (!searchQuery.value.trim()) return

      // Simulate search API call
      const filtered = healthcareLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          location.services.some((service) =>
            service.toLowerCase().includes(searchQuery.value.toLowerCase())
          )
      )

      searchResults.value = filtered.map((location) => ({
        ...location,
        distance: userLocation.value
          ? calculateDistance(
              userLocation.value.lat,
              userLocation.value.lng,
              location.lat,
              location.lng
            )
          : 'Unknown',
      }))

      // Highlight matching markers on map
      highlightSearchResults(filtered)
    }

    const filterMarkers = () => {
      // Clear existing markers
      markers.value.forEach(({ marker }) => {
        map.value.removeLayer(marker)
      })
      markers.value = []

      // Add filtered markers
      const filtered = selectedCategory.value
        ? healthcareLocations.filter((location) => location.category === selectedCategory.value)
        : healthcareLocations

      filtered.forEach((location) => {
        const markerType = markerTypes.find((type) => type.key === location.category)

        const customIcon = L.divIcon({
          html: `<i class="fas ${markerType.icon}" style="color: ${markerType.color}; font-size: 20px;"></i>`,
          iconSize: [20, 20],
          className: 'custom-marker',
        })

        const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map.value)
          .bindPopup(`
            <div class="marker-popup">
              <h6>${location.name}</h6>
              <p><i class="fas fa-map-marker-alt"></i> ${location.address}</p>
              <p><i class="fas fa-phone"></i> ${location.phone}</p>
              <div class="services">
                <strong>Services:</strong>
                <ul class="mb-0">
                  ${location.services.map((service) => `<li>${service}</li>`).join('')}
                </ul>
              </div>
            </div>
          `)

        markers.value.push({ marker, location })
      })
    }

    const selectLocation = (location) => {
      map.value.setView([location.lat, location.lng], 16)

      // Find and open the marker popup
      const markerData = markers.value.find((m) => m.location.id === location.id)
      if (markerData) {
        markerData.marker.openPopup()
      }
    }

    const calculateRoute = async () => {
      if (!directionsFrom.value || !directionsTo.value) {
        alert('Please enter both from and to locations')
        return
      }

      // Simulate route calculation
      // In a real implementation, you would use a routing service like OpenRouteService
      routeInfo.value = {
        distance: '12.5 km',
        duration: '18 mins',
      }

      // Draw a simple line between points (simplified)
      // In practice, you'd get the actual route from a routing service
    }

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371 // Earth's radius in km
      const dLat = toRad(lat2 - lat1)
      const dLng = toRad(lng2 - lng1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return (R * c).toFixed(1)
    }

    const toRad = (value) => {
      return (value * Math.PI) / 180
    }

    const updateDistances = () => {
      if (userLocation.value && searchResults.value.length > 0) {
        searchResults.value = searchResults.value.map((result) => ({
          ...result,
          distance: calculateDistance(
            userLocation.value.lat,
            userLocation.value.lng,
            result.lat,
            result.lng
          ),
        }))
      }
    }

    const highlightSearchResults = (results) => {
      // Reset all markers
      markers.value.forEach(({ marker }) => {
        marker.setOpacity(0.5)
      })

      // Highlight matching markers
      results.forEach((result) => {
        const markerData = markers.value.find((m) => m.location.id === result.id)
        if (markerData) {
          markerData.marker.setOpacity(1)
        }
      })
    }

    // Global functions for popup buttons
    window.getDirectionsTo = (coords) => {
      directionsTo.value = coords
      showDirections.value = true
    }

    window.callLocation = (phone) => {
      window.open(`tel:${phone}`)
    }

    onMounted(async () => {
      await nextTick()
      initializeMap()
    })

    return {
      searchQuery,
      selectedCategory,
      showDirections,
      directionsFrom,
      directionsTo,
      searchResults,
      routeInfo,
      markerTypes,
      searchPlaces,
      filterMarkers,
      selectLocation,
      getCurrentLocation,
      calculateRoute,
    }
  },
}
</script>

<style scoped>
.map-container {
  width: 100%;
}

.map-display {
  height: 500px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.directions-panel {
  background-color: #f8f9fa;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

:deep(.custom-marker) {
  background: none !important;
  border: none !important;
}

:deep(.user-marker) {
  background: none !important;
  border: none !important;
}

:deep(.marker-popup) {
  min-width: 250px;
}

:deep(.marker-popup h6) {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

:deep(.marker-popup p) {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

:deep(.marker-popup .services) {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

:deep(.marker-popup ul) {
  padding-left: 1rem;
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .map-display {
    height: 400px;
  }

  .directions-panel .row {
    gap: 0.5rem;
  }

  .directions-panel .col-md-5,
  .directions-panel .col-md-2 {
    width: 100%;
  }
}
</style>
