<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-header">
            <h4 class="mb-0">
              <i class="fas fa-map-marked-alt me-2"></i>
              Healthcare Services Map
            </h4>
            <p class="mb-0 text-muted">Find healthcare services near you</p>
          </div>
          <div class="card-body">
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
                      <i class="fas fa-route"></i> Navigation
                    </button>
                  </div>
                </div>

                <!-- Advanced Search Panel -->
                <div class="row g-2 mt-2">
                  <div class="col-md-4">
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        placeholder="Search radius (km)"
                        v-model="searchRadius"
                        min="1"
                        max="50"
                      />
                      <button class="btn btn-outline-secondary" @click="searchNearby">
                        <i class="fas fa-search-location"></i> Nearby
                      </button>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <select class="form-select" v-model="sortBy" @change="sortResults">
                      <option value="distance">Sort by Distance</option>
                      <option value="rating">Sort by Rating</option>
                      <option value="name">Sort by Name</option>
                      <option value="availability">Sort by Availability</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <button
                      class="btn btn-warning w-100"
                      @click="showTrafficLayer = !showTrafficLayer"
                    >
                      <i class="fas fa-road"></i> {{ showTrafficLayer ? 'Hide' : 'Show' }} Traffic
                    </button>
                  </div>
                  <div class="col-md-2">
                    <button class="btn btn-secondary w-100" @click="toggleMapStyle">
                      <i class="fas fa-layer-group"></i> Style
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="showDirections" class="directions-panel card mb-3">
                <div class="card-header">
                  <h6 class="mb-0"><i class="fas fa-route"></i> Navigation & Trip Planner</h6>
                </div>
                <div class="card-body">
                  <div class="row g-2">
                    <div class="col-md-4">
                      <label class="form-label small">From:</label>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Enter start location..."
                        v-model="directionsFrom"
                        @keyup.enter="calculateRoute"
                      />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label small">To:</label>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Enter destination..."
                        v-model="directionsTo"
                        @keyup.enter="calculateRoute"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label small">Travel Mode:</label>
                      <select class="form-select" v-model="travelMode">
                        <option value="driving">🚗 Driving</option>
                        <option value="walking">🚶 Walking</option>
                        <option value="transit">🚌 Transit</option>
                        <option value="cycling">🚴 Cycling</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <label class="form-label small">&nbsp;</label>
                      <button class="btn btn-primary w-100" @click="calculateRoute">
                        <i class="fas fa-directions"></i> Get Route
                      </button>
                    </div>
                  </div>

                  <!-- Multi-stop trip planner -->
                  <div class="mt-3" v-if="tripStops.length > 0">
                    <h6 class="text-muted">Trip Planner <small>(Multiple Stops)</small></h6>
                    <div class="trip-stops">
                      <div
                        v-for="(stop, index) in tripStops"
                        :key="index"
                        class="trip-stop d-flex align-items-center mb-2"
                      >
                        <span class="badge bg-primary me-2">{{ index + 1 }}</span>
                        <input
                          type="text"
                          class="form-control me-2"
                          v-model="stop.location"
                          :placeholder="`Stop ${index + 1}`"
                        />
                        <button class="btn btn-sm btn-outline-danger" @click="removeStop(index)">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary me-2" @click="addStop">
                      <i class="fas fa-plus"></i> Add Stop
                    </button>
                    <button class="btn btn-sm btn-success" @click="planTrip">
                      <i class="fas fa-map-marked-alt"></i> Plan Trip
                    </button>
                  </div>

                  <div class="mt-2">
                    <button
                      class="btn btn-sm btn-outline-secondary me-2"
                      @click="useCurrentLocation('from')"
                    >
                      <i class="fas fa-crosshairs"></i> Use My Location (From)
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="addStop">
                      <i class="fas fa-plus-circle"></i> Multi-Stop Trip
                    </button>
                  </div>

                  <div v-if="routeInfo" class="route-info mt-3 p-3 bg-light rounded">
                    <div class="row">
                      <div class="col-md-3">
                        <strong>Distance:</strong> {{ routeInfo.distance }}
                      </div>
                      <div class="col-md-3">
                        <strong>Duration:</strong> {{ routeInfo.duration }}
                      </div>
                      <div class="col-md-3">
                        <strong>Mode:</strong> {{ getTravelModeIcon(travelMode) }} {{ travelMode }}
                      </div>
                      <div class="col-md-3">
                        <strong>Cost:</strong> {{ routeInfo.cost || 'Free' }}
                      </div>
                    </div>
                    <div v-if="routeInfo.instructions" class="mt-2">
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="showTurnByTurn = !showTurnByTurn"
                      >
                        <i class="fas fa-list"></i>
                        {{ showTurnByTurn ? 'Hide' : 'Show' }} Turn-by-Turn
                      </button>
                    </div>
                  </div>

                  <!-- Turn-by-turn directions -->
                  <div v-if="showTurnByTurn && routeInfo?.instructions" class="turn-by-turn mt-3">
                    <h6>Turn-by-Turn Directions</h6>
                    <div class="directions-list" style="max-height: 200px; overflow-y: auto">
                      <div
                        v-for="(instruction, index) in routeInfo.instructions"
                        :key="index"
                        class="direction-step d-flex align-items-start p-2 border-bottom"
                      >
                        <span class="step-number badge bg-secondary me-2">{{ index + 1 }}</span>
                        <div>
                          <div class="step-instruction">{{ instruction.text }}</div>
                          <small class="text-muted"
                            >{{ instruction.distance }} - {{ instruction.duration }}</small
                          >
                        </div>
                      </div>
                    </div>
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
          </div>
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
    const currentRoute = ref(null)

    // New navigation features
    const travelMode = ref('driving')
    const tripStops = ref([])
    const showTurnByTurn = ref(false)
    const searchRadius = ref(5)
    const sortBy = ref('distance')
    const showTrafficLayer = ref(false)
    const mapStyle = ref('default')
    const trafficLayer = ref(null)

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
      map.value = L.map('map', {
        preferCanvas: true,
        zoomControl: true,
        attributionControl: true,
      }).setView([-37.8136, 144.9631], 13)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        tileSize: 256,
        zoomOffset: 0,
      }).addTo(map.value)

      // Ensure map resizes properly
      setTimeout(() => {
        map.value.invalidateSize()
      }, 100)

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

      try {
        // Clear existing route
        if (currentRoute.value) {
          map.value.removeLayer(currentRoute.value)
        }

        // Simulate realistic route calculation based on travel mode
        const routeData = await simulateRouteCalculation()

        routeInfo.value = {
          distance: routeData.distance,
          duration: routeData.duration,
          cost: routeData.cost,
          instructions: routeData.instructions,
        }

        // Draw route on map
        drawRoute(routeData.coordinates)

        // Fit map to show entire route
        if (routeData.bounds) {
          map.value.fitBounds(routeData.bounds)
        }
      } catch (error) {
        console.error('Route calculation error:', error)
        alert('Failed to calculate route. Please try again.')
      }
    }

    const simulateRouteCalculation = async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const modes = {
        driving: {
          baseSpeed: 45, // km/h
          cost: '$3.50 (fuel)',
          instructions: [
            { text: 'Head north on Collins Street', distance: '0.5 km', duration: '2 min' },
            { text: 'Turn right onto Spencer Street', distance: '1.2 km', duration: '3 min' },
            { text: 'Continue straight for 2.5 km', distance: '2.5 km', duration: '4 min' },
            { text: 'Turn left onto destination street', distance: '0.3 km', duration: '1 min' },
            { text: 'Arrive at destination', distance: '0 km', duration: '0 min' },
          ],
        },
        walking: {
          baseSpeed: 5, // km/h
          cost: 'Free',
          instructions: [
            { text: 'Walk north on Collins Street', distance: '0.5 km', duration: '6 min' },
            { text: 'Turn right onto Spencer Street', distance: '1.2 km', duration: '14 min' },
            { text: 'Continue straight', distance: '2.5 km', duration: '30 min' },
            { text: 'Turn left to destination', distance: '0.3 km', duration: '4 min' },
          ],
        },
        transit: {
          baseSpeed: 25, // km/h
          cost: '$4.60 (Myki)',
          instructions: [
            { text: 'Walk to Collins Street tram stop', distance: '0.2 km', duration: '3 min' },
            {
              text: 'Take Tram 35 towards North Melbourne',
              distance: '3.8 km',
              duration: '12 min',
            },
            { text: 'Get off at Spencer Street', distance: '0 km', duration: '1 min' },
            { text: 'Walk to destination', distance: '0.5 km', duration: '6 min' },
          ],
        },
        cycling: {
          baseSpeed: 15, // km/h
          cost: 'Free',
          instructions: [
            {
              text: 'Cycle north on Collins Street bike lane',
              distance: '0.5 km',
              duration: '2 min',
            },
            { text: 'Turn right onto Spencer Street', distance: '1.2 km', duration: '5 min' },
            { text: 'Continue on bike path', distance: '2.5 km', duration: '10 min' },
            { text: 'Turn left to destination', distance: '0.3 km', duration: '1 min' },
          ],
        },
      }

      const modeData = modes[travelMode.value]
      const totalDistance = 4.5 + Math.random() * 2 // km
      const duration = Math.round((totalDistance / modeData.baseSpeed) * 60) // minutes

      return {
        distance: `${totalDistance.toFixed(1)} km`,
        duration: `${duration} min`,
        cost: modeData.cost,
        instructions: modeData.instructions,
        coordinates: generateRouteCoordinates(),
        bounds: [
          [-37.82, 144.95],
          [-37.81, 144.97],
        ],
      }
    }

    const generateRouteCoordinates = () => {
      // Generate sample route coordinates between Melbourne locations
      const start = [-37.8136, 144.9631]
      const end = [-37.7991, 144.9553]

      const waypoints = [start, [-37.815, 144.958], [-37.812, 144.952], [-37.805, 144.957], end]

      return waypoints
    }

    const drawRoute = (coordinates) => {
      if (currentRoute.value) {
        map.value.removeLayer(currentRoute.value)
      }

      const routeStyle = {
        driving: { color: '#3388ff', weight: 5 },
        walking: { color: '#28a745', weight: 4 },
        transit: { color: '#ffc107', weight: 5 },
        cycling: { color: '#dc3545', weight: 4 },
      }

      currentRoute.value = L.polyline(coordinates, {
        ...routeStyle[travelMode.value],
        opacity: 0.8,
      }).addTo(map.value)

      // Add route markers
      L.marker(coordinates[0], {
        icon: L.divIcon({
          html: '<i class="fas fa-play-circle" style="color: #28a745; font-size: 20px;"></i>',
          iconSize: [20, 20],
          className: 'route-marker',
        }),
      })
        .addTo(map.value)
        .bindPopup('Start')

      L.marker(coordinates[coordinates.length - 1], {
        icon: L.divIcon({
          html: '<i class="fas fa-flag-checkered" style="color: #dc3545; font-size: 20px;"></i>',
          iconSize: [20, 20],
          className: 'route-marker',
        }),
      })
        .addTo(map.value)
        .bindPopup('Destination')
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

    // New navigation features
    const getTravelModeIcon = (mode) => {
      const icons = {
        driving: '🚗',
        walking: '🚶',
        transit: '🚌',
        cycling: '🚴',
      }
      return icons[mode] || '🚗'
    }

    const addStop = () => {
      tripStops.value.push({ location: '', coords: null })
    }

    const removeStop = (index) => {
      tripStops.value.splice(index, 1)
    }

    const planTrip = async () => {
      if (tripStops.value.length < 2) {
        alert('Please add at least 2 stops for trip planning')
        return
      }

      // Clear existing route
      if (currentRoute.value) {
        map.value.removeLayer(currentRoute.value)
      }

      // Calculate multi-stop route
      const tripRoute = await calculateMultiStopRoute()

      routeInfo.value = {
        distance: tripRoute.totalDistance,
        duration: tripRoute.totalDuration,
        cost: tripRoute.totalCost,
        stops: tripStops.value.length,
      }

      // Draw trip route
      drawTripRoute(tripRoute.coordinates)
    }

    const calculateMultiStopRoute = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const totalDistance = (tripStops.value.length * 3.2 + Math.random() * 5).toFixed(1)
      const totalDuration = Math.round(tripStops.value.length * 15 + Math.random() * 20)

      return {
        totalDistance: `${totalDistance} km`,
        totalDuration: `${totalDuration} min`,
        totalCost:
          travelMode.value === 'driving'
            ? `$${(parseFloat(totalDistance) * 0.8).toFixed(2)}`
            : 'Free',
        coordinates: generateTripCoordinates(),
      }
    }

    const generateTripCoordinates = () => {
      const baseCoords = [-37.8136, 144.9631]
      const coords = [baseCoords]

      tripStops.value.forEach((_, index) => {
        coords.push([
          baseCoords[0] + (Math.random() - 0.5) * 0.02,
          baseCoords[1] + (Math.random() - 0.5) * 0.02,
        ])
      })

      return coords
    }

    const drawTripRoute = (coordinates) => {
      currentRoute.value = L.polyline(coordinates, {
        color: '#e74c3c',
        weight: 6,
        opacity: 0.8,
        dashArray: '10, 5',
      }).addTo(map.value)

      // Add stop markers
      coordinates.forEach((coord, index) => {
        const isStart = index === 0
        const isEnd = index === coordinates.length - 1
        const stopNumber = index + 1

        let icon, popup
        if (isStart) {
          icon = '<i class="fas fa-play-circle" style="color: #28a745; font-size: 24px;"></i>'
          popup = 'Trip Start'
        } else if (isEnd) {
          icon = '<i class="fas fa-flag-checkered" style="color: #dc3545; font-size: 24px;"></i>'
          popup = 'Trip End'
        } else {
          icon = `<div class="stop-marker">${stopNumber - 1}</div>`
          popup = `Stop ${stopNumber - 1}`
        }

        L.marker(coord, {
          icon: L.divIcon({
            html: icon,
            iconSize: [24, 24],
            className: 'trip-marker',
          }),
        })
          .addTo(map.value)
          .bindPopup(popup)
      })

      map.value.fitBounds(coordinates)
    }

    const useCurrentLocation = (field) => {
      if (!userLocation.value) {
        getCurrentLocation()
        return
      }

      const coords = `${userLocation.value.lat},${userLocation.value.lng}`
      if (field === 'from') {
        directionsFrom.value = coords
      } else {
        directionsTo.value = coords
      }
    }

    const searchNearby = () => {
      if (!userLocation.value) {
        alert('Please enable location services first')
        return
      }

      const radius = parseFloat(searchRadius.value) || 5
      const nearby = healthcareLocations.filter((location) => {
        const distance = calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          location.lat,
          location.lng
        )
        return parseFloat(distance) <= radius
      })

      searchResults.value = nearby.map((location) => ({
        ...location,
        distance: calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          location.lat,
          location.lng
        ),
      }))

      sortResults()
      highlightSearchResults(nearby)
    }

    const sortResults = () => {
      if (searchResults.value.length === 0) return

      searchResults.value.sort((a, b) => {
        switch (sortBy.value) {
          case 'distance':
            return parseFloat(a.distance) - parseFloat(b.distance)
          case 'rating':
            // Simulate ratings
            const ratingA = 4 + Math.random()
            const ratingB = 4 + Math.random()
            return ratingB - ratingA
          case 'name':
            return a.name.localeCompare(b.name)
          case 'availability':
            // Simulate availability
            return Math.random() - 0.5
          default:
            return 0
        }
      })
    }

    const toggleMapStyle = () => {
      const styles = ['default', 'satellite', 'terrain']
      const currentIndex = styles.indexOf(mapStyle.value)
      mapStyle.value = styles[(currentIndex + 1) % styles.length]

      // In a real implementation, you would switch tile layers
      console.log(`Switched to ${mapStyle.value} style`)
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
      travelMode,
      tripStops,
      showTurnByTurn,
      searchRadius,
      sortBy,
      showTrafficLayer,
      searchPlaces,
      filterMarkers,
      selectLocation,
      getCurrentLocation,
      calculateRoute,
      getTravelModeIcon,
      addStop,
      removeStop,
      planTrip,
      useCurrentLocation,
      searchNearby,
      sortResults,
      toggleMapStyle,
    }
  },
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.card-header h4 {
  margin: 0;
}

.map-container {
  width: 100%;
}

.map-display {
  height: 70vh;
  min-height: 500px;
  max-height: 800px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  position: relative;
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
    height: 60vh;
    min-height: 400px;
  }

  .directions-panel .row {
    gap: 0.5rem;
  }

  .directions-panel .col-md-5,
  .directions-panel .col-md-2 {
    width: 100%;
  }

  .map-controls .row {
    margin-bottom: 1rem;
  }

  .map-controls .col-md-4,
  .map-controls .col-md-3,
  .map-controls .col-md-2 {
    margin-bottom: 0.5rem;
  }
}

:deep(.trip-marker) {
  background: none !important;
  border: none !important;
}

:deep(.route-marker) {
  background: none !important;
  border: none !important;
}

.stop-marker {
  background: #007bff;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  border: 2px solid white;
}

.trip-stops {
  max-height: 200px;
  overflow-y: auto;
}

.trip-stop {
  transition: all 0.3s ease;
}

.trip-stop:hover {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 4px;
}

.route-info {
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.route-info:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.directions-list {
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.direction-step {
  transition: background-color 0.2s ease;
}

.direction-step:hover {
  background-color: #f8f9fa;
}

.step-number {
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-instruction {
  font-weight: 500;
  color: #495057;
}

.legend-item {
  transition: transform 0.2s ease;
}

.legend-item:hover {
  transform: translateY(-1px);
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
