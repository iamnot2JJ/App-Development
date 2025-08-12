<template>
  <div class="admin-dashboard">
    <div class="container-fluid py-4">
      <!-- Dashboard Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h3 mb-0">Admin Dashboard</h1>
              <p class="text-muted">Welcome back, {{ authStore.user?.firstName }}!</p>
            </div>
            <div class="btn-group">
              <button class="btn btn-outline-primary" @click="refreshData">
                <i class="fas fa-sync-alt"></i> Refresh
              </button>
              <button class="btn btn-primary" @click="exportDashboardData">
                <i class="fas fa-download"></i> Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ dashboardData.totalUsers }}
                  </div>
                  <small class="text-success">
                    <i class="fas fa-arrow-up"></i> {{ dashboardData.userGrowth }}% this month
                  </small>
                </div>
                <div class="col-auto">
                  <i class="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Resources
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ dashboardData.totalResources }}
                  </div>
                  <small class="text-info">
                    <i class="fas fa-plus"></i> {{ dashboardData.newResourcesThisWeek }} this week
                  </small>
                </div>
                <div class="col-auto">
                  <i class="fas fa-book fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-info shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Average Rating
                  </div>
                  <div class="row no-gutters align-items-center">
                    <div class="col-auto">
                      <div class="h5 mb-0 mr-3 font-weight-bold text-gray-800">
                        {{ dashboardData.averageRating }}/5
                      </div>
                    </div>
                    <div class="col">
                      <div class="progress progress-sm mr-2">
                        <div
                          class="progress-bar bg-info"
                          role="progressbar"
                          :style="`width: ${(dashboardData.averageRating / 5) * 100}%`"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-star fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-warning shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Email Sent
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ dashboardData.emailsSent }}
                  </div>
                  <small class="text-primary">
                    <i class="fas fa-envelope"></i> {{ dashboardData.emailsThisWeek }} this week
                  </small>
                </div>
                <div class="col-auto">
                  <i class="fas fa-envelope fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-xl-8 col-lg-7">
          <div class="card shadow mb-4">
            <div
              class="card-header py-3 d-flex flex-row align-items-center justify-content-between"
            >
              <h6 class="m-0 font-weight-bold text-primary">User Registration Trends</h6>
              <div class="dropdown no-arrow">
                <select
                  class="form-select form-select-sm"
                  v-model="chartTimeframe"
                  @change="updateCharts"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
            </div>
            <div class="card-body">
              <canvas id="userChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-lg-5">
          <div class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Resource Categories</h6>
            </div>
            <div class="card-body">
              <canvas id="categoryChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Tables Row -->
      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="card shadow">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Recent Users</h6>
            </div>
            <div class="card-body">
              <InteractiveDataTable
                :data="recentUsers"
                :columns="userColumns"
                :actions="userActions"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="card shadow">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">System Logs</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive" style="max-height: 400px">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="log in systemLogs" :key="log.id">
                      <td>{{ formatDateTime(log.timestamp) }}</td>
                      <td>{{ log.action }}</td>
                      <td>{{ log.user }}</td>
                      <td>
                        <span :class="`badge bg-${getStatusColor(log.status)}`">
                          {{ log.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Quick Actions</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-3">
                  <button class="btn btn-primary w-100" @click="sendBulkEmail">
                    <i class="fas fa-envelope-bulk"></i><br />
                    Send Bulk Email
                  </button>
                </div>
                <div class="col-md-3 mb-3">
                  <button class="btn btn-success w-100" @click="$router.push('/resources')">
                    <i class="fas fa-plus"></i><br />
                    Add Resource
                  </button>
                </div>
                <div class="col-md-3 mb-3">
                  <button class="btn btn-info w-100" @click="generateReport">
                    <i class="fas fa-chart-bar"></i><br />
                    Generate Report
                  </button>
                </div>
                <div class="col-md-3 mb-3">
                  <button class="btn btn-warning w-100" @click="backupData">
                    <i class="fas fa-database"></i><br />
                    Backup Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts and Notifications -->
      <div class="row" v-if="alerts.length > 0">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-danger">System Alerts</h6>
            </div>
            <div class="card-body">
              <div
                v-for="alert in alerts"
                :key="alert.id"
                :class="`alert alert-${alert.type} alert-dismissible`"
              >
                <strong>{{ alert.title }}</strong> {{ alert.message }}
                <button type="button" class="btn-close" @click="dismissAlert(alert.id)"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Email Modal -->
    <div class="modal fade" id="bulkEmailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Send Bulk Email</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeBulkEmailModal"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="sendBulkEmailAction">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Recipient Group</label>
                  <select class="form-select" v-model="bulkEmailForm.recipientGroup" required>
                    <option value="all">All Users</option>
                    <option value="admins">Administrators</option>
                    <option value="users">Regular Users</option>
                    <option value="recent">Recent Registrations</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Priority</label>
                  <select class="form-select" v-model="bulkEmailForm.priority">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Subject</label>
                <input type="text" class="form-control" v-model="bulkEmailForm.subject" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Message</label>
                <textarea
                  class="form-control"
                  rows="6"
                  v-model="bulkEmailForm.message"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="bulkEmailForm.includeUnsubscribe"
                    id="includeUnsubscribe"
                  />
                  <label class="form-check-label" for="includeUnsubscribe">
                    Include unsubscribe link
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeBulkEmailModal"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="sendBulkEmailAction">
              <i class="fas fa-paper-plane"></i> Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useResourcesStore } from '../../stores/resources.js'
import { useRatingsStore } from '../../stores/ratings.js'
import { useEmailStore } from '../../stores/email.js'
import InteractiveDataTable from '../../components/ui/InteractiveDataTable.vue'
import Chart from 'chart.js/auto'
import { format, subDays, isAfter } from 'date-fns'

export default {
  name: 'AdminDashboard',
  components: {
    InteractiveDataTable,
  },
  setup() {
    const authStore = useAuthStore()
    const resourcesStore = useResourcesStore()
    const ratingsStore = useRatingsStore()
    const emailStore = useEmailStore()

    const chartTimeframe = ref('30')
    const userChart = ref(null)
    const categoryChart = ref(null)
    const alerts = ref([])
    const systemLogs = ref([])

    const bulkEmailForm = ref({
      recipientGroup: 'all',
      priority: 'normal',
      subject: '',
      message: '',
      includeUnsubscribe: true,
    })

    const dashboardData = computed(() => {
      const users = authStore.users || []
      const resources = resourcesStore.resources || []
      const ratings = ratingsStore.ratings || []
      const emails = emailStore.sentEmails || []

      const now = new Date()
      const weekAgo = subDays(now, 7)
      const monthAgo = subDays(now, 30)

      const newUsersThisMonth = users.filter(
        (user) => user.registeredAt && isAfter(new Date(user.registeredAt), monthAgo)
      ).length

      const newResourcesThisWeek = resources.filter(
        (resource) => resource.createdAt && isAfter(new Date(resource.createdAt), weekAgo)
      ).length

      const emailsThisWeek = emails.filter(
        (email) => email.sentAt && isAfter(new Date(email.sentAt), weekAgo)
      ).length

      const totalRatings = ratings.length
      const averageRating =
        totalRatings > 0
          ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings).toFixed(1)
          : 0

      const userGrowth = users.length > 0 ? Math.round((newUsersThisMonth / users.length) * 100) : 0

      return {
        totalUsers: users.length,
        totalResources: resources.length,
        averageRating,
        emailsSent: emails.length,
        userGrowth,
        newResourcesThisWeek,
        emailsThisWeek,
      }
    })

    const recentUsers = computed(() => {
      return authStore.users
        .slice()
        .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
        .slice(0, 10)
        .map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          registeredAt: user.registeredAt,
          status: 'Active',
        }))
    })

    const userColumns = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', type: 'badge' },
      { key: 'registeredAt', label: 'Registered', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
    ]

    const userActions = [
      {
        name: 'edit',
        icon: 'fas fa-edit',
        variant: 'primary',
        title: 'Edit User',
        handler: (user) => editUser(user),
      },
      {
        name: 'delete',
        icon: 'fas fa-trash',
        variant: 'danger',
        title: 'Delete User',
        handler: (user) => deleteUser(user),
      },
    ]

    const generateSystemLogs = () => {
      const actions = [
        'User Login',
        'User Registration',
        'Resource Created',
        'Resource Updated',
        'Email Sent',
        'Rating Submitted',
        'Data Export',
        'System Backup',
      ]
      const statuses = ['Success', 'Warning', 'Error', 'Info']
      const users = ['Admin User', 'John Doe', 'Jane Smith', 'System']

      systemLogs.value = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        timestamp: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString(),
        action: actions[Math.floor(Math.random() * actions.length)],
        user: users[Math.floor(Math.random() * users.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }

    const generateAlerts = () => {
      alerts.value = [
        {
          id: 1,
          type: 'warning',
          title: 'High Server Load',
          message: 'Server CPU usage is above 80% for the last 15 minutes.',
        },
        {
          id: 2,
          type: 'info',
          title: 'Scheduled Maintenance',
          message: 'System maintenance is scheduled for this weekend.',
        },
      ]
    }

    const createUserChart = () => {
      const ctx = document.getElementById('userChart')
      if (!ctx || userChart.value) return

      const days = parseInt(chartTimeframe.value)
      const dates = Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - 1 - i)
        return format(date, 'MMM dd')
      })

      // Generate sample data for user registrations
      const data = Array.from({ length: days }, () => Math.floor(Math.random() * 10))

      userChart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'New Users',
              data: data,
              borderColor: '#4e73df',
              backgroundColor: 'rgba(78, 115, 223, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#e3e6f0',
              },
            },
            x: {
              grid: {
                color: '#e3e6f0',
              },
            },
          },
        },
      })
    }

    const createCategoryChart = () => {
      const ctx = document.getElementById('categoryChart')
      if (!ctx || categoryChart.value) return

      const categories = ['Healthcare', 'Mental Health', 'Legal Aid', 'Education', 'Employment']
      const data = [25, 20, 15, 22, 18]
      const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']

      categoryChart.value = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [
            {
              data: data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      })
    }

    const updateCharts = () => {
      if (userChart.value) {
        userChart.value.destroy()
        userChart.value = null
      }
      setTimeout(() => {
        createUserChart()
      }, 100)
    }

    const refreshData = () => {
      authStore.initializeStore()
      resourcesStore.initializeStore()
      ratingsStore.initializeStore()
      emailStore.initializeStore()
      generateSystemLogs()
      generateAlerts()
    }

    const exportDashboardData = () => {
      const dashboardReport = {
        generatedAt: new Date().toISOString(),
        metrics: dashboardData.value,
        recentUsers: recentUsers.value,
        systemLogs: systemLogs.value.slice(0, 10),
        alerts: alerts.value,
      }

      const dataStr = JSON.stringify(dashboardReport, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.json`
      link.click()
    }

    const sendBulkEmail = () => {
      console.log('Send Bulk Email button clicked') // 调试信息

      // 检查 Bootstrap 可用性
      console.log('Bootstrap availability:', {
        bootstrap: typeof bootstrap,
        Modal: typeof bootstrap !== 'undefined' ? typeof bootstrap.Modal : 'undefined',
        window: typeof window,
      })

      try {
        // 尝试使用 Bootstrap Modal
        const modalElement = document.getElementById('bulkEmailModal')
        console.log('Modal element found:', modalElement)

        if (modalElement) {
          // 检查 Bootstrap 是否可用
          if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            console.log('Using Bootstrap Modal')
            const modal = new bootstrap.Modal(modalElement)
            modal.show()
          } else {
            console.log('Bootstrap not available, using fallback')
            // 备用方案：直接显示模态框
            modalElement.style.display = 'block'
            modalElement.classList.add('show')
            modalElement.style.backgroundColor = 'rgba(0,0,0,0.5)'
            document.body.classList.add('modal-open')

            // 添加背景遮罩
            const backdrop = document.createElement('div')
            backdrop.className = 'modal-backdrop fade show'
            backdrop.onclick = closeBulkEmailModal
            document.body.appendChild(backdrop)
          }
        } else {
          console.error('Modal element not found')
          alert('邮件发送功能暂时不可用，请稍后重试')
        }
      } catch (error) {
        console.error('Error opening modal:', error)
        alert('打开邮件发送窗口时出错：' + error.message)
      }
    }

    const closeBulkEmailModal = () => {
      const modalElement = document.getElementById('bulkEmailModal')
      if (modalElement) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) {
            modal.hide()
          }
        } else {
          // 备用方案：直接隐藏模态框
          modalElement.style.display = 'none'
          modalElement.classList.remove('show')
          document.body.classList.remove('modal-open')

          // 移除背景遮罩
          const backdrop = document.querySelector('.modal-backdrop')
          if (backdrop) {
            backdrop.remove()
          }
        }
      }
    }

    const sendBulkEmailAction = async () => {
      try {
        let recipients = []

        switch (bulkEmailForm.value.recipientGroup) {
          case 'all':
            recipients = authStore.users
            break
          case 'admins':
            recipients = authStore.users.filter((user) => user.role === 'admin')
            break
          case 'users':
            recipients = authStore.users.filter((user) => user.role === 'user')
            break
          case 'recent':
            const weekAgo = subDays(new Date(), 7)
            recipients = authStore.users.filter((user) =>
              isAfter(new Date(user.registeredAt), weekAgo)
            )
            break
        }

        const emailData = {
          subject: bulkEmailForm.value.subject,
          message: bulkEmailForm.value.message,
          fromName: 'Migrant Health Charity Admin',
        }

        await emailStore.sendBulkEmail(recipients, emailData)

        // 使用新的关闭函数
        closeBulkEmailModal()

        alert(`Bulk email sent to ${recipients.length} recipients successfully!`)

        // Reset form
        bulkEmailForm.value = {
          recipientGroup: 'all',
          priority: 'normal',
          subject: '',
          message: '',
          includeUnsubscribe: true,
        }
      } catch (error) {
        console.error('Bulk email error:', error)
        alert('Failed to send bulk email. Please try again.')
      }
    }

    const generateReport = () => {
      // Navigate to export component
      window.open('/export', '_blank')
    }

    const backupData = () => {
      const backupData = {
        timestamp: new Date().toISOString(),
        users: authStore.users,
        resources: resourcesStore.resources,
        ratings: ratingsStore.ratings,
        emails: emailStore.sentEmails,
      }

      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`
      link.click()

      alert('Data backup downloaded successfully!')
    }

    const editUser = (user) => {
      console.log('Edit user:', user)
      // Implement user editing functionality
    }

    const deleteUser = (user) => {
      if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
        console.log('Delete user:', user)
        // Implement user deletion functionality
      }
    }

    const dismissAlert = (alertId) => {
      alerts.value = alerts.value.filter((alert) => alert.id !== alertId)
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      try {
        return format(new Date(dateString), 'MMM dd, HH:mm')
      } catch {
        return dateString
      }
    }

    const getStatusColor = (status) => {
      const colorMap = {
        Success: 'success',
        Warning: 'warning',
        Error: 'danger',
        Info: 'info',
      }
      return colorMap[status] || 'secondary'
    }

    onMounted(() => {
      refreshData()
      setTimeout(() => {
        createUserChart()
        createCategoryChart()
      }, 100)
    })

    return {
      authStore,
      dashboardData,
      recentUsers,
      userColumns,
      userActions,
      systemLogs,
      alerts,
      chartTimeframe,
      bulkEmailForm,
      refreshData,
      exportDashboardData,
      sendBulkEmail,
      sendBulkEmailAction,
      closeBulkEmailModal,
      generateReport,
      backupData,
      editUser,
      deleteUser,
      dismissAlert,
      updateCharts,
      formatDateTime,
      getStatusColor,
    }
  },
}
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fc;
  min-height: 100vh;
}

.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}

.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.text-xs {
  font-size: 0.75rem;
}

.font-weight-bold {
  font-weight: 700 !important;
}

.text-gray-800 {
  color: #5a5c69 !important;
}

.text-gray-300 {
  color: #dddfeb !important;
}

.progress-sm {
  height: 0.5rem;
}

.card {
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
  border: 1px solid #e3e6f0 !important;
}

.card-header {
  background-color: #f8f9fc !important;
  border-bottom: 1px solid #e3e6f0 !important;
}

.btn-group button {
  margin-bottom: 0.5rem;
}

.quick-action-btn {
  height: 80px;
  font-size: 0.9rem;
  text-align: center;
}

.modal-lg {
  max-width: 800px;
}

@media (max-width: 768px) {
  .col-xl-3,
  .col-xl-4,
  .col-xl-8,
  .col-lg-5,
  .col-lg-6,
  .col-lg-7 {
    width: 100%;
    margin-bottom: 1rem;
  }

  .btn-group {
    flex-direction: column;
    width: 100%;
  }

  .btn-group button {
    width: 100%;
  }
}

/* Chart containers */
#userChart,
#categoryChart {
  max-height: 300px;
}

/* Alert animations */
.alert {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
