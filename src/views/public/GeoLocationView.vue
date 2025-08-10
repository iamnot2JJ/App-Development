<template>
  <div class="geo-location-view">
    <div class="container py-5">
      <h1 class="mb-4">Map & Geo Location</h1>

      <!-- Online/Offline status -->
      <div v-if="!isOnline" class="alert alert-warning mb-3">
        <i class="fas fa-wifi-slash me-2"></i>
        You are offline. Map functionality may be limited.
      </div>

      <!-- Search functionality -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8 mb-2">
              <label for="searchInput" class="form-label">Search for places:</label>
              <input
                id="searchInput"
                v-model="searchQuery"
                @keyup.enter="searchPlace"
                type="text"
                class="form-control"
                placeholder="e.g., Melbourne CBD, hospitals near me, pharmacies..."
                aria-describedby="searchHelp"
              />
              <div id="searchHelp" class="form-text">
                Search for places, hospitals, pharmacies, or community centers
              </div>
            </div>
            <div class="col-md-4 mb-2">
              <label class="form-label">&nbsp;</label>
              <button
                class="btn btn-primary w-100"
                @click="searchPlace"
                :disabled="!searchQuery.trim()"
              >
                <i class="fas fa-search me-2"></i>Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Map container -->
      <div class="map-container mb-4">
        <div id="map" style="height: 500px; width: 100%; border-radius: 10px"></div>
      </div>

      <!-- Route information -->
      <div v-if="routeInfo" class="card">
        <div class="card-body">
          <h5 class="card-title"><i class="fas fa-route me-2"></i>Route Information</h5>
          <div class="row">
            <div class="col-md-6">
              <p><strong>Distance:</strong> {{ routeInfo.distance }} km</p>
              <p><strong>Estimated Time:</strong> {{ routeInfo.duration }} min</p>
            </div>
            <div class="col-md-6">
              <button class="btn btn-success" @click="getDirections" :disabled="!destination">
                <i class="fas fa-directions me-2"></i>Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search results -->
      <div v-if="searchResults.length > 0" class="card mt-4">
        <div class="card-body">
          <h5 class="card-title"><i class="fas fa-list me-2"></i>Search Results</h5>
          <div class="list-group">
            <button
              v-for="(result, index) in searchResults"
              :key="index"
              class="list-group-item list-group-item-action"
              @click="selectSearchResult(result)"
            >
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">{{ result.display_name.split(',')[0] }}</h6>
                <small>{{ calculateDistance(result) }} km away</small>
              </div>
              <p class="mb-1 text-muted">{{ result.display_name }}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'

export default {
  name: 'GeoLocationView',
  data() {
    return {
      map: null,
      searchQuery: '',
      searchResults: [],
      userLocation: null,
      destination: null,
      routeInfo: null,
      isOnline: navigator.onLine,
      userMarker: null,
      destinationMarker: null,
      routeLayer: null,
    }
  },
  mounted() {
    this.initializeMap()
    this.getUserLocation()

    // Listen for online/offline events
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
    if (this.map) {
      this.map.remove()
    }
  },
  methods: {
    initializeMap() {
      // Initialize Leaflet map
      this.map = L.map('map').setView([-37.8136, 144.9631], 12) // Melbourne default

      // Add OpenStreetMap tiles (free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map)

      // Add map click event
      this.map.on('click', (e) => {
        this.setDestination([e.latlng.lat, e.latlng.lng], 'Selected Location')
      })
    },

    updateOnlineStatus() {
      this.isOnline = navigator.onLine
    },

    getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = [position.coords.latitude, position.coords.longitude]
            this.map.setView(this.userLocation, 14)

            // Add user location marker
            if (this.userMarker) {
              this.map.removeLayer(this.userMarker)
            }

            this.userMarker = L.marker(this.userLocation, {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: '<i class="fas fa-user-circle" style="color: #007bff; font-size: 24px;"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            })
              .addTo(this.map)
              .bindPopup('Your Location')
          },
          (error) => {
            console.error('Geolocation error:', error)
            alert('Unable to get your location. Using default location (Melbourne).')
          }
        )
      }
    },

    async searchPlace() {
      if (!this.searchQuery.trim()) return

      try {
        // Use Nominatim API (free OpenStreetMap geocoding)
        const query = encodeURIComponent(this.searchQuery)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=au&addressdetails=1`

        const response = await fetch(url)
        const data = await response.json()

        if (data && data.length > 0) {
          this.searchResults = data
          // Show first result on map
          this.selectSearchResult(data[0])
        } else {
          alert('No places found. Try a different search term.')
          this.searchResults = []
        }
      } catch (error) {
        console.error('Search error:', error)
        alert('Search failed. Please check your internet connection.')
      }
    },

    selectSearchResult(result) {
      const lat = parseFloat(result.lat)
      const lon = parseFloat(result.lon)
      this.setDestination([lat, lon], result.display_name)
      this.map.setView([lat, lon], 15)
      this.searchResults = []
    },

    setDestination(coords, name) {
      this.destination = coords

      // Remove existing destination marker
      if (this.destinationMarker) {
        this.map.removeLayer(this.destinationMarker)
      }

      // Add destination marker
      this.destinationMarker = L.marker(coords, {
        icon: L.divIcon({
          className: 'destination-marker',
          html: '<i class="fas fa-map-marker-alt" style="color: #dc3545; font-size: 30px;"></i>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      })
        .addTo(this.map)
        .bindPopup(name || 'Destination')

      // Calculate route if user location is available
      if (this.userLocation) {
        this.calculateRoute()
      }
    },

    async calculateRoute() {
      if (!this.userLocation || !this.destination) return

      try {
        // Use OSRM routing service (free)
        const start = `${this.userLocation[1]},${this.userLocation[0]}`
        const end = `${this.destination[1]},${this.destination[0]}`
        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`

        const response = await fetch(url)
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]

          // Remove existing route
          if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer)
          }

          // Add route to map
          this.routeLayer = L.geoJSON(route.geometry, {
            style: {
              color: '#007bff',
              weight: 6,
              opacity: 0.8,
            },
          }).addTo(this.map)

          // Fit map to show entire route
          this.map.fitBounds(this.routeLayer.getBounds())

          // Update route info
          this.routeInfo = {
            distance: (route.distance / 1000).toFixed(2),
            duration: Math.round(route.duration / 60),
          }
        }
      } catch (error) {
        console.error('Route calculation error:', error)
        alert('Unable to calculate route. Please try again.')
      }
    },

    getDirections() {
      if (!this.destination) return

      // Open Google Maps for detailed directions
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.destination[0]},${this.destination[1]}`
      window.open(url, '_blank')
    },

    calculateDistance(result) {
      if (!this.userLocation) return 'N/A'

      const lat1 = this.userLocation[0]
      const lon1 = this.userLocation[1]
      const lat2 = parseFloat(result.lat)
      const lon2 = parseFloat(result.lon)

      // Haversine formula for distance calculation
      const R = 6371 // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      return distance.toFixed(1)
    },
  },
}
</script>

<style scoped>
.geo-location-view {
  min-height: 100vh;
}

.map-container {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

#map {
  background-color: #f8f9fa;
}

/* Custom marker styles */
.user-location-marker,
.destination-marker {
  background: none;
  border: none;
}

/* Accessibility improvements */
.btn:focus,
.form-control:focus {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item:focus {
  z-index: 1;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Responsive design */
@media (max-width: 768px) {
  #map {
    height: 400px !important;
  }

  .container {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>
