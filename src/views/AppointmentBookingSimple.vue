<template>
  <div class="appointment-booking-simple">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card shadow">
            <div class="card-header text-center">
              <h3 class="mb-1">
                <i class="fas fa-calendar-plus me-2"></i>
                Book Your Appointment
              </h3>
              <p class="mb-0 text-muted">Schedule a consultation with our healthcare providers</p>
            </div>
            <div class="card-body">
              <form @submit.prevent="bookAppointment">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="fas fa-user me-1"></i>
                      First Name *
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="bookingForm.firstName"
                      required
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="fas fa-user me-1"></i>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="bookingForm.lastName"
                      required
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="fas fa-envelope me-1"></i>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      v-model="bookingForm.email"
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="fas fa-phone me-1"></i>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      class="form-control"
                      v-model="bookingForm.phone"
                      required
                      placeholder="(03) 9123-4567"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-stethoscope me-1"></i>
                    Service Type *
                  </label>
                  <select class="form-select" v-model="bookingForm.serviceType" required>
                    <option value="">Select a service</option>
                    <option value="consultation">General Consultation</option>
                    <option value="health_check">Health Check</option>
                    <option value="mental_health">Mental Health Support</option>
                    <option value="legal_aid">Legal Aid Consultation</option>
                    <option value="employment">Employment Assistance</option>
                    <option value="translation">Translation Services</option>
                    <option value="community">Community Support</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-user-md me-1"></i>
                    Healthcare Provider *
                  </label>
                  <select class="form-select" v-model="bookingForm.providerId" required>
                    <option value="">Select a provider</option>
                    <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                      {{ provider.name }} - {{ provider.specialty }}
                    </option>
                  </select>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="fas fa-calendar me-1"></i>
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="bookingForm.date"
                      :min="minDate"
                      :max="maxDate"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">
                      <i class="fas fa-clock me-1"></i>
                      Preferred Time *
                    </label>
                    <select class="form-select" v-model="bookingForm.time" required>
                      <option value="">Select a time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="09:30">9:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="14:30">2:30 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="15:30">3:30 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-comment-medical me-1"></i>
                    Reason for Visit *
                  </label>
                  <textarea
                    class="form-control"
                    v-model="bookingForm.reason"
                    rows="4"
                    placeholder="Please describe the reason for your appointment, any symptoms, or concerns you'd like to discuss"
                    required
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-globe me-1"></i>
                    Preferred Language
                  </label>
                  <select class="form-select" v-model="bookingForm.language">
                    <option value="English">English</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="Arabic">العربية (Arabic)</option>
                    <option value="Mandarin">中文 (Mandarin)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Vietnamese">Tiếng Việt (Vietnamese)</option>
                    <option value="Italian">Italiano (Italian)</option>
                    <option value="Greek">Ελληνικά (Greek)</option>
                  </select>
                </div>

                <div class="mb-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="bookingForm.reminder"
                      id="reminder"
                    />
                    <label class="form-check-label" for="reminder">
                      <i class="fas fa-bell me-1"></i>
                      Send me email and SMS reminders before my appointment
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="bookingForm.newsletter"
                      id="newsletter"
                    />
                    <label class="form-check-label" for="newsletter">
                      <i class="fas fa-newspaper me-1"></i>
                      Subscribe to health tips and community updates
                    </label>
                  </div>
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading || !isFormValid"
                  >
                    <span v-if="loading">
                      <i class="fas fa-spinner fa-spin me-2"></i>
                      Booking Appointment...
                    </span>
                    <span v-else>
                      <i class="fas fa-check me-2"></i>
                      Book Appointment
                    </span>
                  </button>
                </div>
              </form>

              <!-- Success Message -->
              <div v-if="bookingSuccess" class="alert alert-success mt-4">
                <div class="d-flex align-items-center">
                  <i class="fas fa-check-circle fa-2x me-3"></i>
                  <div>
                    <h5 class="mb-1">Appointment Booked Successfully!</h5>
                    <p class="mb-0">
                      We'll send you a confirmation email shortly. Your appointment reference is: 
                      <strong>{{ appointmentRef }}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="alert alert-danger mt-4">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ error }}
              </div>
            </div>
          </div>

          <!-- Your Appointments -->
          <div v-if="userAppointments.length > 0" class="card shadow mt-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-calendar-check me-2"></i>
                Your Upcoming Appointments
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div
                  v-for="appointment in userAppointments"
                  :key="appointment.id"
                  class="col-md-6 mb-3"
                >
                  <div class="card border-left-primary">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 class="text-primary">{{ getServiceName(appointment.serviceType) }}</h6>
                          <p class="mb-1">
                            <i class="fas fa-user-md text-muted me-1"></i>
                            {{ getProviderName(appointment.providerId) }}
                          </p>
                          <p class="mb-1">
                            <i class="fas fa-calendar text-muted me-1"></i>
                            {{ formatDate(appointment.date) }} at {{ appointment.time }}
                          </p>
                          <p class="mb-0">
                            <span :class="`badge bg-${getStatusColor(appointment.status)}`">
                              {{ appointment.status }}
                            </span>
                          </p>
                        </div>
                        <div class="dropdown">
                          <button
                            class="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            <i class="fas fa-ellipsis-v"></i>
                          </button>
                          <ul class="dropdown-menu">
                            <li>
                              <a class="dropdown-item" href="#" @click.prevent="rescheduleAppointment(appointment)">
                                <i class="fas fa-edit me-2"></i>Reschedule
                              </a>
                            </li>
                            <li>
                              <a class="dropdown-item text-danger" href="#" @click.prevent="cancelAppointment(appointment)">
                                <i class="fas fa-times me-2"></i>Cancel
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
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
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'AppointmentBookingSimple',
  setup() {
    const loading = ref(false)
    const bookingSuccess = ref(false)
    const error = ref('')
    const appointmentRef = ref('')
    const appointments = ref([])

    const bookingForm = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      serviceType: '',
      providerId: '',
      date: '',
      time: '',
      reason: '',
      language: 'English',
      reminder: true,
      newsletter: false
    })

    // Healthcare providers data
    const providers = ref([
      {
        id: 'dr-smith',
        name: 'Dr. Sarah Smith',
        specialty: 'General Practice',
        location: 'Melbourne City Medical Centre'
      },
      {
        id: 'dr-chen',
        name: 'Dr. Wei Chen',
        specialty: 'Mental Health',
        location: 'Multicultural Health Clinic'
      },
      {
        id: 'ms-johnson',
        name: 'Ms. Emily Johnson',
        specialty: 'Legal Aid',
        location: 'Community Legal Centre'
      },
      {
        id: 'dr-hassan',
        name: 'Dr. Ahmed Hassan',
        specialty: 'Cardiology',
        location: 'Heart Health Clinic'
      },
      {
        id: 'dr-rodriguez',
        name: 'Dr. Maria Rodriguez',
        specialty: 'Pediatrics',
        location: 'Children Health Centre'
      }
    ])

    const minDate = computed(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const maxDate = computed(() => {
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 60)
      return maxDate.toISOString().split('T')[0]
    })

    const isFormValid = computed(() => {
      return (
        bookingForm.value.firstName &&
        bookingForm.value.lastName &&
        bookingForm.value.email &&
        bookingForm.value.phone &&
        bookingForm.value.serviceType &&
        bookingForm.value.providerId &&
        bookingForm.value.date &&
        bookingForm.value.time &&
        bookingForm.value.reason
      )
    })

    const userAppointments = computed(() => {
      const userEmail = bookingForm.value.email
      if (!userEmail) return []
      
      return appointments.value
        .filter(apt => apt.email === userEmail)
        .filter(apt => new Date(`${apt.date}T${apt.time}`) > new Date())
        .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    })

    const bookAppointment = async () => {
      try {
        loading.value = true
        error.value = ''
        bookingSuccess.value = false

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Generate appointment reference
        appointmentRef.value = `APT-${Date.now().toString().slice(-6)}`

        // Create new appointment
        const newAppointment = {
          id: Date.now(),
          ref: appointmentRef.value,
          ...bookingForm.value,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        }

        // Add to appointments list
        appointments.value.push(newAppointment)
        localStorage.setItem('appointments', JSON.stringify(appointments.value))

        // Show success
        bookingSuccess.value = true

        // Reset form after 3 seconds
        setTimeout(() => {
          bookingForm.value = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            serviceType: '',
            providerId: '',
            date: '',
            time: '',
            reason: '',
            language: 'English',
            reminder: true,
            newsletter: false
          }
          bookingSuccess.value = false
        }, 5000)

      } catch (err) {
        error.value = 'Failed to book appointment. Please try again.'
        console.error('Booking error:', err)
      } finally {
        loading.value = false
      }
    }

    const getServiceName = (serviceType) => {
      const services = {
        consultation: 'General Consultation',
        health_check: 'Health Check',
        mental_health: 'Mental Health Support',
        legal_aid: 'Legal Aid Consultation',
        employment: 'Employment Assistance',
        translation: 'Translation Services',
        community: 'Community Support'
      }
      return services[serviceType] || serviceType
    }

    const getProviderName = (providerId) => {
      const provider = providers.value.find(p => p.id === providerId)
      return provider ? provider.name : 'Unknown Provider'
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-AU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    const getStatusColor = (status) => {
      const colors = {
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'danger',
        completed: 'info'
      }
      return colors[status] || 'secondary'
    }

    const rescheduleAppointment = (appointment) => {
      alert(`Rescheduling appointment for ${appointment.firstName} ${appointment.lastName}`)
    }

    const cancelAppointment = (appointment) => {
      if (confirm('Are you sure you want to cancel this appointment?')) {
        appointment.status = 'cancelled'
        localStorage.setItem('appointments', JSON.stringify(appointments.value))
      }
    }

    const loadAppointments = () => {
      const stored = localStorage.getItem('appointments')
      if (stored) {
        try {
          appointments.value = JSON.parse(stored)
        } catch (error) {
          console.error('Error loading appointments:', error)
          appointments.value = []
        }
      }
    }

    onMounted(() => {
      loadAppointments()
    })

    return {
      bookingForm,
      loading,
      bookingSuccess,
      error,
      appointmentRef,
      providers,
      minDate,
      maxDate,
      isFormValid,
      userAppointments,
      bookAppointment,
      getServiceName,
      getProviderName,
      formatDate,
      getStatusColor,
      rescheduleAppointment,
      cancelAppointment
    }
  }
}
</script>

<style scoped>
.appointment-booking-simple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px 15px 0 0 !important;
  border: none;
  padding: 2rem;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.border-left-primary {
  border-left: 4px solid #667eea !important;
}

.alert {
  border-radius: 10px;
  border: none;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

@media (max-width: 768px) {
  .appointment-booking-simple {
    padding-top: 1rem;
  }
  
  .card-header {
    padding: 1.5rem;
  }
}

/* Loading animation */
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
