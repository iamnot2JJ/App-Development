<template>
  <div class="appointment-booking">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-8">
          <!-- Calendar Component -->
          <div class="card shadow mb-4">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-calendar-alt"></i> Appointment Calendar</h5>
            </div>
            <div class="card-body">
              <div id="calendar" ref="calendarEl"></div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <!-- Booking Form -->
          <div class="card shadow mb-4">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-plus-circle"></i> Book Appointment</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="bookAppointment">
                <div class="mb-3">
                  <label class="form-label">Service Type</label>
                  <select class="form-select" v-model="bookingForm.serviceType" required>
                    <option value="">Select a service</option>
                    <option value="consultation">General Consultation</option>
                    <option value="health_check">Health Check</option>
                    <option value="mental_health">Mental Health Support</option>
                    <option value="legal_aid">Legal Aid Consultation</option>
                    <option value="employment">Employment Assistance</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Healthcare Provider</label>
                  <select class="form-select" v-model="bookingForm.providerId" required>
                    <option value="">Select a provider</option>
                    <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                      {{ provider.name }} - {{ provider.specialty }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Preferred Date</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="bookingForm.date"
                    :min="minDate"
                    :max="maxDate"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Available Time Slots</label>
                  <div class="time-slots">
                    <button
                      v-for="slot in availableSlots"
                      :key="slot.time"
                      type="button"
                      class="btn btn-outline-primary btn-sm me-2 mb-2"
                      :class="{ active: bookingForm.time === slot.time }"
                      :disabled="!slot.available"
                      @click="selectTimeSlot(slot.time)"
                    >
                      {{ slot.time }}
                    </button>
                  </div>
                  <small class="text-muted" v-if="availableSlots.length === 0">
                    Please select a date to see available time slots
                  </small>
                </div>

                <div class="mb-3">
                  <label class="form-label">Reason for Visit</label>
                  <textarea
                    class="form-control"
                    v-model="bookingForm.reason"
                    rows="3"
                    placeholder="Please describe the reason for your appointment"
                    required
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    class="form-control"
                    v-model="bookingForm.phone"
                    placeholder="Your contact number"
                    required
                  />
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="bookingForm.reminder"
                      id="reminder"
                    />
                    <label class="form-check-label" for="reminder">
                      Send me email and SMS reminders
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="loading || !isFormValid"
                >
                  <span v-if="loading"> <i class="fas fa-spinner fa-spin"></i> Booking... </span>
                  <span v-else> <i class="fas fa-check"></i> Book Appointment </span>
                </button>
              </form>
            </div>
          </div>

          <!-- Upcoming Appointments -->
          <div class="card shadow" v-if="userAppointments.length > 0">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-clock"></i> Your Upcoming Appointments</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div
                  v-for="appointment in userAppointments"
                  :key="appointment.id"
                  class="list-group-item px-0"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">{{ getServiceName(appointment.serviceType) }}</h6>
                      <p class="mb-1">
                        <i class="fas fa-user-md"></i> {{ getProviderName(appointment.providerId) }}
                      </p>
                      <small class="text-muted">
                        <i class="fas fa-calendar"></i>
                        {{ formatAppointmentDate(appointment.dateTime) }}
                      </small>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="rescheduleAppointment(appointment)"
                        :disabled="!canReschedule(appointment)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="cancelAppointment(appointment)"
                        :disabled="!canCancel(appointment)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div class="mt-2">
                    <span :class="`badge bg-${getStatusColor(appointment.status)}`">
                      {{ appointment.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Confirmation Modal -->
    <div class="modal fade" id="confirmationModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Appointment Confirmation</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <i class="fas fa-check-circle text-success" style="font-size: 3rem"></i>
            </div>
            <h6 class="text-center">Your appointment has been booked successfully!</h6>
            <div class="appointment-details mt-3">
              <p>
                <strong>Service:</strong> {{ getServiceName(confirmedAppointment.serviceType) }}
              </p>
              <p>
                <strong>Provider:</strong> {{ getProviderName(confirmedAppointment.providerId) }}
              </p>
              <p>
                <strong>Date & Time:</strong>
                {{ formatAppointmentDate(confirmedAppointment.dateTime) }}
              </p>
              <p>
                <strong>Location:</strong>
                {{ getProviderLocation(confirmedAppointment.providerId) }}
              </p>
            </div>
            <div class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              You will receive a confirmation email and SMS reminder before your appointment.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="addToCalendar">
              <i class="fas fa-calendar-plus"></i> Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, addDays, isAfter, isBefore } from 'date-fns'

export default {
  name: 'AppointmentBooking',
  setup() {
    const authStore = useAuthStore()
    const calendarEl = ref(null)
    const calendar = ref(null)
    const loading = ref(false)
    const appointments = ref([])
    const availableSlots = ref([])

    const bookingForm = ref({
      serviceType: '',
      providerId: '',
      date: '',
      time: '',
      reason: '',
      phone: '',
      reminder: true,
    })

    const confirmedAppointment = ref({})

    // Healthcare providers data
    const providers = ref([
      {
        id: 'dr-smith',
        name: 'Dr. Sarah Smith',
        specialty: 'General Practice',
        location: 'Melbourne City Medical Centre',
        availability: {
          monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          friday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        },
      },
      {
        id: 'dr-chen',
        name: 'Dr. Wei Chen',
        specialty: 'Mental Health',
        location: 'Multicultural Health Clinic',
        availability: {
          monday: ['10:00', '11:00', '13:00', '14:00', '15:00'],
          tuesday: ['10:00', '11:00', '13:00', '14:00', '15:00'],
          wednesday: ['10:00', '11:00', '13:00', '14:00', '15:00'],
          thursday: ['10:00', '11:00', '13:00', '14:00', '15:00'],
          friday: ['10:00', '11:00', '13:00', '14:00'],
        },
      },
      {
        id: 'ms-johnson',
        name: 'Ms. Emily Johnson',
        specialty: 'Legal Aid',
        location: 'Community Legal Centre',
        availability: {
          monday: ['09:00', '10:30', '13:00', '14:30', '16:00'],
          tuesday: ['09:00', '10:30', '13:00', '14:30', '16:00'],
          wednesday: ['09:00', '10:30', '13:00', '14:30', '16:00'],
          thursday: ['09:00', '10:30', '13:00', '14:30', '16:00'],
          friday: ['09:00', '10:30', '13:00', '14:30'],
        },
      },
    ])

    const minDate = computed(() => {
      return format(new Date(), 'yyyy-MM-dd')
    })

    const maxDate = computed(() => {
      return format(addDays(new Date(), 60), 'yyyy-MM-dd')
    })

    const userAppointments = computed(() => {
      return appointments.value
        .filter((apt) => apt.userId === authStore.user?.id)
        .filter((apt) => isAfter(new Date(apt.dateTime), new Date()))
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    })

    const isFormValid = computed(() => {
      return (
        bookingForm.value.serviceType &&
        bookingForm.value.providerId &&
        bookingForm.value.date &&
        bookingForm.value.time &&
        bookingForm.value.reason &&
        bookingForm.value.phone
      )
    })

    const initializeCalendar = () => {
      if (!calendarEl.value) return

      calendar.value = new Calendar(calendarEl.value, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        },
        events: appointments.value.map((apt) => ({
          id: apt.id,
          title: `${getServiceName(apt.serviceType)} - ${getProviderName(apt.providerId)}`,
          start: apt.dateTime,
          end: new Date(new Date(apt.dateTime).getTime() + 60 * 60 * 1000), // 1 hour duration
          backgroundColor: getAppointmentColor(apt.status),
          borderColor: getAppointmentColor(apt.status),
          textColor: '#ffffff',
        })),
        dateClick: (info) => {
          bookingForm.value.date = info.dateStr
          updateAvailableSlots()
        },
        eventClick: (info) => {
          const appointment = appointments.value.find((apt) => apt.id === info.event.id)
          if (appointment) {
            showAppointmentDetails(appointment)
          }
        },
        height: 'auto',
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
      })

      calendar.value.render()
    }

    const updateAvailableSlots = () => {
      if (!bookingForm.value.date || !bookingForm.value.providerId) {
        availableSlots.value = []
        return
      }

      const selectedDate = new Date(bookingForm.value.date)
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' })
      const provider = providers.value.find((p) => p.id === bookingForm.value.providerId)

      if (!provider || !provider.availability[dayName]) {
        availableSlots.value = []
        return
      }

      const providerSlots = provider.availability[dayName]
      const bookedSlots = appointments.value
        .filter((apt) => apt.providerId === bookingForm.value.providerId)
        .filter((apt) => format(new Date(apt.dateTime), 'yyyy-MM-dd') === bookingForm.value.date)
        .map((apt) => format(new Date(apt.dateTime), 'HH:mm'))

      availableSlots.value = providerSlots.map((time) => ({
        time: time,
        available: !bookedSlots.includes(time),
      }))
    }

    const selectTimeSlot = (time) => {
      bookingForm.value.time = time
    }

    const bookAppointment = async () => {
      if (!isFormValid.value) return

      try {
        loading.value = true

        const appointmentDateTime = new Date(
          `${bookingForm.value.date}T${bookingForm.value.time}:00`
        )

        // Check for conflicts
        const conflict = appointments.value.find(
          (apt) =>
            apt.providerId === bookingForm.value.providerId &&
            Math.abs(new Date(apt.dateTime) - appointmentDateTime) < 60 * 60 * 1000 // Within 1 hour
        )

        if (conflict) {
          alert('This time slot is no longer available. Please select another time.')
          updateAvailableSlots()
          return
        }

        const newAppointment = {
          id: `apt_${Date.now()}`,
          userId: authStore.user.id,
          serviceType: bookingForm.value.serviceType,
          providerId: bookingForm.value.providerId,
          dateTime: appointmentDateTime.toISOString(),
          reason: bookingForm.value.reason,
          phone: bookingForm.value.phone,
          reminder: bookingForm.value.reminder,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          userEmail: authStore.user.email,
          userName: `${authStore.user.firstName} ${authStore.user.lastName}`,
        }

        appointments.value.push(newAppointment)
        localStorage.setItem('appointments', JSON.stringify(appointments.value))

        confirmedAppointment.value = newAppointment

        // Reset form
        bookingForm.value = {
          serviceType: '',
          providerId: '',
          date: '',
          time: '',
          reason: '',
          phone: '',
          reminder: true,
        }

        availableSlots.value = []

        // Update calendar
        calendar.value.refetchEvents()

        // Show confirmation modal
        const modal = new bootstrap.Modal(document.getElementById('confirmationModal'))
        modal.show()

        // Send confirmation email (simulated)
        if (newAppointment.reminder) {
          console.log('Sending confirmation email and SMS reminder...')
        }
      } catch (error) {
        console.error('Error booking appointment:', error)
        alert('Failed to book appointment. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const rescheduleAppointment = (appointment) => {
      if (!canReschedule(appointment)) return

      // Pre-fill form with existing appointment data
      bookingForm.value = {
        serviceType: appointment.serviceType,
        providerId: appointment.providerId,
        date: format(new Date(appointment.dateTime), 'yyyy-MM-dd'),
        time: format(new Date(appointment.dateTime), 'HH:mm'),
        reason: appointment.reason,
        phone: appointment.phone,
        reminder: appointment.reminder,
      }

      // Remove old appointment
      appointments.value = appointments.value.filter((apt) => apt.id !== appointment.id)
      localStorage.setItem('appointments', JSON.stringify(appointments.value))

      updateAvailableSlots()
      calendar.value.refetchEvents()
    }

    const cancelAppointment = (appointment) => {
      if (!canCancel(appointment)) return

      if (confirm('Are you sure you want to cancel this appointment?')) {
        appointment.status = 'cancelled'
        localStorage.setItem('appointments', JSON.stringify(appointments.value))
        calendar.value.refetchEvents()

        console.log('Sending cancellation notification...')
      }
    }

    const canReschedule = (appointment) => {
      const appointmentDate = new Date(appointment.dateTime)
      const now = new Date()
      const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)
      return hoursDiff > 24 && appointment.status === 'confirmed'
    }

    const canCancel = (appointment) => {
      const appointmentDate = new Date(appointment.dateTime)
      const now = new Date()
      const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)
      return hoursDiff > 2 && appointment.status === 'confirmed'
    }

    const getServiceName = (serviceType) => {
      const services = {
        consultation: 'General Consultation',
        health_check: 'Health Check',
        mental_health: 'Mental Health Support',
        legal_aid: 'Legal Aid Consultation',
        employment: 'Employment Assistance',
      }
      return services[serviceType] || serviceType
    }

    const getProviderName = (providerId) => {
      const provider = providers.value.find((p) => p.id === providerId)
      return provider ? provider.name : 'Unknown Provider'
    }

    const getProviderLocation = (providerId) => {
      const provider = providers.value.find((p) => p.id === providerId)
      return provider ? provider.location : 'TBA'
    }

    const formatAppointmentDate = (dateTime) => {
      if (!dateTime) return ''
      try {
        return format(new Date(dateTime), 'MMM dd, yyyy at HH:mm')
      } catch {
        return dateTime
      }
    }

    const getStatusColor = (status) => {
      const colors = {
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'danger',
        completed: 'info',
      }
      return colors[status] || 'secondary'
    }

    const getAppointmentColor = (status) => {
      const colors = {
        confirmed: '#28a745',
        pending: '#ffc107',
        cancelled: '#dc3545',
        completed: '#17a2b8',
      }
      return colors[status] || '#6c757d'
    }

    const showAppointmentDetails = (appointment) => {
      alert(`
        Appointment Details:
        Service: ${getServiceName(appointment.serviceType)}
        Provider: ${getProviderName(appointment.providerId)}
        Date: ${formatAppointmentDate(appointment.dateTime)}
        Status: ${appointment.status}
        Reason: ${appointment.reason}
      `)
    }

    const addToCalendar = () => {
      const appointment = confirmedAppointment.value
      const startDate = new Date(appointment.dateTime)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour

      const event = {
        title: `${getServiceName(appointment.serviceType)} - ${getProviderName(
          appointment.providerId
        )}`,
        start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        description: `Appointment: ${appointment.reason}`,
        location: getProviderLocation(appointment.providerId),
      }

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${event.start}/${event.end}&details=${encodeURIComponent(
        event.description
      )}&location=${encodeURIComponent(event.location)}`

      window.open(calendarUrl, '_blank')
    }

    const loadAppointments = () => {
      const stored = localStorage.getItem('appointments')
      if (stored) {
        appointments.value = JSON.parse(stored)
      }
    }

    // Watch for form changes to update available slots
    watch([() => bookingForm.value.date, () => bookingForm.value.providerId], updateAvailableSlots)

    onMounted(() => {
      loadAppointments()
      nextTick(() => {
        initializeCalendar()
      })
    })

    return {
      calendarEl,
      loading,
      bookingForm,
      confirmedAppointment,
      providers,
      availableSlots,
      userAppointments,
      minDate,
      maxDate,
      isFormValid,
      selectTimeSlot,
      bookAppointment,
      rescheduleAppointment,
      cancelAppointment,
      canReschedule,
      canCancel,
      getServiceName,
      getProviderName,
      getProviderLocation,
      formatAppointmentDate,
      getStatusColor,
      addToCalendar,
    }
  },
}
</script>

<style scoped>
.appointment-booking {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.time-slots .btn {
  min-width: 80px;
  margin: 0.25rem;
}

.time-slots .btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.time-slots .btn:disabled {
  opacity: 0.3;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #ffffff;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #dee2e6;
}

.appointment-details p {
  margin-bottom: 0.5rem;
}

/* Calendar styling */
:deep(.fc-event) {
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.85rem;
}

:deep(.fc-daygrid-event) {
  margin: 1px;
}

:deep(.fc-event-title) {
  font-weight: 500;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5rem;
  font-weight: 600;
}

:deep(.fc-button) {
  background-color: #007bff;
  border-color: #007bff;
}

:deep(.fc-button:hover) {
  background-color: #0056b3;
  border-color: #0056b3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .col-lg-8,
  .col-lg-4 {
    width: 100%;
    margin-bottom: 1rem;
  }

  .time-slots {
    text-align: center;
  }

  .time-slots .btn {
    min-width: 70px;
    font-size: 0.875rem;
  }

  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
  }
}

/* Animation for form validation */
.form-control:invalid {
  border-color: #dc3545;
}

.form-control:valid {
  border-color: #28a745;
}

/* Loading spinner */
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
