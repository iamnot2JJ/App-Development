<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-header">
            <h4 class="mb-0">
              <i class="fas fa-table me-2"></i>
              Health Services Data Tables
            </h4>
            <p class="mb-0 text-muted">Interactive data tables with search, sort, and export functionality</p>
          </div>
          <div class="card-body">
            
            <!-- Health Providers Table -->
            <div class="mb-5">
              <h5 class="mb-3">Healthcare Providers</h5>
              <InteractiveDataTable
                :data="providersData"
                :columns="providersColumns"
                :actions="providerActions"
                id-field="id"
              />
            </div>

            <!-- User Analytics Table -->
            <div class="mb-5">
              <h5 class="mb-3">User Analytics</h5>
              <InteractiveDataTable
                :data="usersData"
                :columns="usersColumns"
                :actions="userActions"
                id-field="id"
              />
            </div>

            <!-- Appointment Statistics Table -->
            <div class="mb-5">
              <h5 class="mb-3">Appointment Statistics</h5>
              <InteractiveDataTable
                :data="appointmentsData"
                :columns="appointmentsColumns"
                :actions="appointmentActions"
                id-field="id"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import InteractiveDataTable from '../components/ui/InteractiveDataTable.vue'

export default {
  name: 'DataTablesView',
  components: {
    InteractiveDataTable
  },
  setup() {
    // Healthcare Providers Data
    const providersData = ref([
      {
        id: 1,
        name: 'Dr. Sarah Smith',
        specialty: 'General Practice',
        location: 'Melbourne City Medical Centre',
        phone: '(03) 9123-4567',
        rating: 4.8,
        patients: 234,
        status: 'active',
        joinDate: '2022-01-15'
      },
      {
        id: 2,
        name: 'Dr. Wei Chen',
        specialty: 'Mental Health',
        location: 'Multicultural Health Clinic',
        phone: '(03) 9234-5678',
        rating: 4.9,
        patients: 189,
        status: 'active',
        joinDate: '2021-08-22'
      },
      {
        id: 3,
        name: 'Ms. Emily Johnson',
        specialty: 'Legal Aid',
        location: 'Community Legal Centre',
        phone: '(03) 9345-6789',
        rating: 4.7,
        patients: 156,
        status: 'active',
        joinDate: '2022-03-10'
      },
      {
        id: 4,
        name: 'Dr. Ahmed Hassan',
        specialty: 'Cardiology',
        location: 'Heart Health Clinic',
        phone: '(03) 9456-7890',
        rating: 4.6,
        patients: 301,
        status: 'inactive',
        joinDate: '2020-11-05'
      },
      {
        id: 5,
        name: 'Dr. Maria Rodriguez',
        specialty: 'Pediatrics',
        location: 'Children Health Centre',
        phone: '(03) 9567-8901',
        rating: 4.9,
        patients: 278,
        status: 'active',
        joinDate: '2021-06-18'
      }
    ])

    const providersColumns = ref([
      { key: 'name', label: 'Provider Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'location', label: 'Location' },
      { key: 'phone', label: 'Phone' },
      { key: 'rating', label: 'Rating' },
      { key: 'patients', label: 'Patients' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'joinDate', label: 'Join Date', type: 'date' }
    ])

    const providerActions = ref([
      {
        name: 'view',
        icon: 'fas fa-eye',
        variant: 'primary',
        title: 'View Details',
        handler: (row) => alert(`Viewing details for ${row.name}`)
      },
      {
        name: 'edit',
        icon: 'fas fa-edit',
        variant: 'warning',
        title: 'Edit Provider',
        handler: (row) => alert(`Editing ${row.name}`)
      },
      {
        name: 'delete',
        icon: 'fas fa-trash',
        variant: 'danger',
        title: 'Delete Provider',
        handler: (row) => {
          if (confirm(`Are you sure you want to delete ${row.name}?`)) {
            providersData.value = providersData.value.filter(p => p.id !== row.id)
          }
        }
      }
    ])

    // Users Data
    const usersData = ref([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        country: 'Australia',
        language: 'English',
        registeredAt: '2023-01-15',
        lastLogin: '2024-01-10',
        appointmentsCount: 5,
        status: 'active'
      },
      {
        id: 2,
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@email.com',
        country: 'Spain',
        language: 'Spanish',
        registeredAt: '2023-02-20',
        lastLogin: '2024-01-08',
        appointmentsCount: 3,
        status: 'active'
      },
      {
        id: 3,
        firstName: 'Ahmed',
        lastName: 'Al-Hassan',
        email: 'ahmed.hassan@email.com',
        country: 'Syria',
        language: 'Arabic',
        registeredAt: '2023-03-12',
        lastLogin: '2024-01-05',
        appointmentsCount: 7,
        status: 'active'
      },
      {
        id: 4,
        firstName: 'Li',
        lastName: 'Wei',
        email: 'li.wei@email.com',
        country: 'China',
        language: 'Mandarin',
        registeredAt: '2023-01-08',
        lastLogin: '2023-12-20',
        appointmentsCount: 2,
        status: 'inactive'
      },
      {
        id: 5,
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@email.com',
        country: 'India',
        language: 'Hindi',
        registeredAt: '2023-04-25',
        lastLogin: '2024-01-09',
        appointmentsCount: 4,
        status: 'active'
      }
    ])

    const usersColumns = ref([
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'country', label: 'Country' },
      { key: 'language', label: 'Language' },
      { key: 'appointmentsCount', label: 'Appointments' },
      { key: 'registeredAt', label: 'Registered', type: 'date' },
      { key: 'lastLogin', label: 'Last Login', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' }
    ])

    const userActions = ref([
      {
        name: 'view',
        icon: 'fas fa-user',
        variant: 'info',
        title: 'View Profile',
        handler: (row) => alert(`Viewing profile for ${row.firstName} ${row.lastName}`)
      },
      {
        name: 'message',
        icon: 'fas fa-envelope',
        variant: 'success',
        title: 'Send Message',
        handler: (row) => alert(`Sending message to ${row.email}`)
      }
    ])

    // Appointments Data
    const appointmentsData = ref([
      {
        id: 1,
        patientName: 'John Smith',
        providerName: 'Dr. Sarah Smith',
        service: 'General Consultation',
        date: '2024-01-15',
        time: '10:00',
        status: 'confirmed',
        cost: 85.00,
        duration: 30
      },
      {
        id: 2,
        patientName: 'Maria Garcia',
        providerName: 'Dr. Wei Chen',
        service: 'Mental Health Support',
        date: '2024-01-16',
        time: '14:00',
        status: 'pending',
        cost: 120.00,
        duration: 60
      },
      {
        id: 3,
        patientName: 'Ahmed Al-Hassan',
        providerName: 'Ms. Emily Johnson',
        service: 'Legal Aid Consultation',
        date: '2024-01-17',
        time: '09:00',
        status: 'confirmed',
        cost: 0.00,
        duration: 45
      },
      {
        id: 4,
        patientName: 'Li Wei',
        providerName: 'Dr. Ahmed Hassan',
        service: 'Health Check',
        date: '2024-01-18',
        time: '11:00',
        status: 'cancelled',
        cost: 150.00,
        duration: 30
      },
      {
        id: 5,
        patientName: 'Priya Sharma',
        providerName: 'Dr. Maria Rodriguez',
        service: 'General Consultation',
        date: '2024-01-19',
        time: '15:30',
        status: 'completed',
        cost: 95.00,
        duration: 30
      }
    ])

    const appointmentsColumns = ref([
      { key: 'patientName', label: 'Patient' },
      { key: 'providerName', label: 'Provider' },
      { key: 'service', label: 'Service' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time' },
      { key: 'duration', label: 'Duration (min)' },
      { key: 'cost', label: 'Cost', type: 'currency' },
      { key: 'status', label: 'Status', type: 'badge' }
    ])

    const appointmentActions = ref([
      {
        name: 'view',
        icon: 'fas fa-calendar-alt',
        variant: 'primary',
        title: 'View Appointment',
        handler: (row) => alert(`Viewing appointment for ${row.patientName}`)
      },
      {
        name: 'reschedule',
        icon: 'fas fa-clock',
        variant: 'warning',
        title: 'Reschedule',
        handler: (row) => alert(`Rescheduling appointment for ${row.patientName}`)
      },
      {
        name: 'cancel',
        icon: 'fas fa-times',
        variant: 'danger',
        title: 'Cancel Appointment',
        handler: (row) => {
          if (confirm(`Cancel appointment for ${row.patientName}?`)) {
            row.status = 'cancelled'
          }
        }
      }
    ])

    return {
      providersData,
      providersColumns,
      providerActions,
      usersData,
      usersColumns,
      userActions,
      appointmentsData,
      appointmentsColumns,
      appointmentActions
    }
  }
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

h5 {
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}
</style>
