<template>
  <div class="export-component">
    <div class="export-controls mb-3">
      <div class="row g-2">
        <div class="col-md-3">
          <select class="form-select" v-model="selectedFormat">
            <option value="csv">CSV Format</option>
            <option value="pdf">PDF Report</option>
            <option value="json">JSON Data</option>
            <option value="excel">Excel Spreadsheet</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="selectedDataType">
            <option value="resources">Resources</option>
            <option value="users">Users</option>
            <option value="ratings">Ratings</option>
            <option value="emails">Email History</option>
            <option value="analytics">Analytics Data</option>
          </select>
        </div>
        <div class="col-md-3">
          <input
            type="date"
            class="form-control"
            v-model="dateFrom"
            :max="dateTo || today"
            title="From Date"
          />
        </div>
        <div class="col-md-3">
          <input
            type="date"
            class="form-control"
            v-model="dateTo"
            :min="dateFrom"
            :max="today"
            title="To Date"
          />
        </div>
      </div>
    </div>

    <div class="export-options card mb-3" v-if="selectedFormat === 'pdf'">
      <div class="card-header">
        <h6 class="mb-0">PDF Options</h6>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Report Title</label>
            <input
              type="text"
              class="form-control"
              v-model="pdfOptions.title"
              placeholder="Enter report title"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Page Orientation</label>
            <select class="form-select" v-model="pdfOptions.orientation">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div class="col-md-6">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="pdfOptions.includeCharts"
                id="includeCharts"
              />
              <label class="form-check-label" for="includeCharts"> Include Charts </label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="pdfOptions.includeSummary"
                id="includeSummary"
              />
              <label class="form-check-label" for="includeSummary"> Include Summary </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-preview card mb-3" v-if="previewData.length > 0">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Data Preview ({{ previewData.length }} records)</h6>
        <button class="btn btn-sm btn-outline-secondary" @click="refreshPreview">
          <i class="fas fa-refresh"></i> Refresh
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive" style="max-height: 300px">
          <table class="table table-sm table-striped">
            <thead class="table-dark sticky-top">
              <tr>
                <th v-for="column in previewColumns" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewData.slice(0, 10)" :key="index">
                <td v-for="column in previewColumns" :key="column">
                  {{ formatCellValue(row[column]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <small class="text-muted" v-if="previewData.length > 10">
          Showing first 10 rows of {{ previewData.length }} total records
        </small>
      </div>
    </div>

    <div class="export-actions">
      <div class="row g-2">
        <div class="col-md-6">
          <button
            class="btn btn-primary w-100"
            @click="exportData"
            :disabled="loading || previewData.length === 0"
          >
            <span v-if="loading"> <i class="fas fa-spinner fa-spin"></i> Exporting... </span>
            <span v-else>
              <i class="fas fa-download"></i> Export {{ selectedFormat.toUpperCase() }}
            </span>
          </button>
        </div>
        <div class="col-md-6">
          <button
            class="btn btn-outline-secondary w-100"
            @click="scheduleExport"
            :disabled="loading"
          >
            <i class="fas fa-clock"></i> Schedule Export
          </button>
        </div>
      </div>
    </div>

    <div class="export-history mt-4" v-if="exportHistory.length > 0">
      <h6>Recent Exports</h6>
      <div class="list-group">
        <div
          v-for="export_item in exportHistory.slice(0, 5)"
          :key="export_item.id"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{{ export_item.filename }}</strong>
            <br />
            <small class="text-muted">
              {{ export_item.type }} • {{ formatDate(export_item.createdAt) }} •
              {{ export_item.size }}
            </small>
          </div>
          <div class="btn-group btn-group-sm">
            <button
              class="btn btn-outline-primary"
              @click="downloadExport(export_item)"
              title="Download"
            >
              <i class="fas fa-download"></i>
            </button>
            <button
              class="btn btn-outline-danger"
              @click="deleteExport(export_item.id)"
              title="Delete"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Export Modal -->
    <div class="modal fade" id="scheduleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Schedule Export</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="confirmScheduleExport">
              <div class="mb-3">
                <label class="form-label">Export Name</label>
                <input type="text" class="form-control" v-model="scheduleForm.name" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Frequency</label>
                <select class="form-select" v-model="scheduleForm.frequency" required>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Start Date</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  v-model="scheduleForm.startDate"
                  :min="new Date().toISOString().slice(0, 16)"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Email Recipients</label>
                <textarea
                  class="form-control"
                  v-model="scheduleForm.recipients"
                  placeholder="Enter email addresses separated by commas"
                  rows="3"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="confirmScheduleExport">
              Schedule Export
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useResourcesStore } from '../../stores/resources.js'
import { useAuthStore } from '../../stores/auth.js'
import { useRatingsStore } from '../../stores/ratings.js'
import { useEmailStore } from '../../stores/email.js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

export default {
  name: 'ExportComponent',
  setup() {
    const resourcesStore = useResourcesStore()
    const authStore = useAuthStore()
    const ratingsStore = useRatingsStore()
    const emailStore = useEmailStore()

    const selectedFormat = ref('csv')
    const selectedDataType = ref('resources')
    const dateFrom = ref('')
    const dateTo = ref('')
    const loading = ref(false)
    const previewData = ref([])
    const exportHistory = ref([])

    const today = new Date().toISOString().split('T')[0]

    const pdfOptions = ref({
      title: 'Data Export Report',
      orientation: 'portrait',
      includeCharts: true,
      includeSummary: true,
    })

    const scheduleForm = ref({
      name: '',
      frequency: 'weekly',
      startDate: '',
      recipients: '',
    })

    const previewColumns = computed(() => {
      if (previewData.value.length === 0) return []
      return Object.keys(previewData.value[0])
    })

    const getDataByType = (type) => {
      switch (type) {
        case 'resources':
          return resourcesStore.resources
        case 'users':
          return authStore.users
        case 'ratings':
          return ratingsStore.ratings
        case 'emails':
          return emailStore.sentEmails
        case 'analytics':
          return generateAnalyticsData()
        default:
          return []
      }
    }

    const generateAnalyticsData = () => {
      const resources = resourcesStore.resources
      const ratings = ratingsStore.ratings
      const users = authStore.users

      return [
        {
          metric: 'Total Resources',
          value: resources.length,
          category: 'Content',
          date: new Date().toISOString(),
        },
        {
          metric: 'Total Users',
          value: users.length,
          category: 'Users',
          date: new Date().toISOString(),
        },
        {
          metric: 'Total Ratings',
          value: ratings.length,
          category: 'Engagement',
          date: new Date().toISOString(),
        },
        {
          metric: 'Average Rating',
          value:
            ratings.length > 0
              ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
              : 0,
          category: 'Quality',
          date: new Date().toISOString(),
        },
      ]
    }

    const filterDataByDate = (data) => {
      if (!dateFrom.value && !dateTo.value) return data

      return data.filter((item) => {
        const itemDate = new Date(item.createdAt || item.registeredAt || item.sentAt || item.date)
        const from = dateFrom.value ? new Date(dateFrom.value) : new Date(0)
        const to = dateTo.value ? new Date(dateTo.value) : new Date()

        return itemDate >= from && itemDate <= to
      })
    }

    const refreshPreview = () => {
      let data = getDataByType(selectedDataType.value)
      data = filterDataByDate(data)
      previewData.value = data
    }

    const formatCellValue = (value) => {
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value)
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 50) + '...'
      }
      return value
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
      } catch {
        return dateString
      }
    }

    const exportCSV = (data) => {
      if (data.length === 0) return

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value || ''
            })
            .join(',')
        ),
      ].join('\n')

      downloadFile(csvContent, `${selectedDataType.value}-export-${Date.now()}.csv`, 'text/csv')
    }

    const exportJSON = (data) => {
      const jsonContent = JSON.stringify(data, null, 2)
      downloadFile(
        jsonContent,
        `${selectedDataType.value}-export-${Date.now()}.json`,
        'application/json'
      )
    }

    const exportPDF = (data) => {
      const doc = new jsPDF(pdfOptions.value.orientation)

      // Add title
      doc.setFontSize(20)
      doc.text(pdfOptions.value.title, 20, 20)

      // Add date range if specified
      if (dateFrom.value || dateTo.value) {
        doc.setFontSize(12)
        const dateRange = `Date Range: ${dateFrom.value || 'All'} to ${dateTo.value || 'All'}`
        doc.text(dateRange, 20, 35)
      }

      // Add summary if enabled
      if (pdfOptions.value.includeSummary) {
        doc.setFontSize(14)
        doc.text('Summary', 20, 50)
        doc.setFontSize(10)
        doc.text(`Total Records: ${data.length}`, 20, 60)
        doc.text(`Export Date: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, 70)
        doc.text(`Data Type: ${selectedDataType.value}`, 20, 80)
      }

      // Add table
      if (data.length > 0) {
        const headers = Object.keys(data[0])
        const rows = data.map((row) => headers.map((header) => formatCellValue(row[header])))

        doc.autoTable({
          head: [headers],
          body: rows,
          startY: pdfOptions.value.includeSummary ? 90 : 50,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [52, 58, 64] },
          alternateRowStyles: { fillColor: [248, 249, 250] },
        })
      }

      const filename = `${selectedDataType.value}-report-${Date.now()}.pdf`
      doc.save(filename)
    }

    const exportExcel = (data) => {
      // For demo purposes, we'll export as CSV with .xlsx extension
      // In a real application, you'd use a library like SheetJS
      if (data.length === 0) return

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join('\t'),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              return value || ''
            })
            .join('\t')
        ),
      ].join('\n')

      downloadFile(
        csvContent,
        `${selectedDataType.value}-export-${Date.now()}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    }

    const downloadFile = (content, filename, type) => {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Add to export history
      const exportRecord = {
        id: Date.now(),
        filename,
        type: selectedFormat.value.toUpperCase(),
        size: formatFileSize(blob.size),
        createdAt: new Date().toISOString(),
        url: url, // In a real app, this would be a permanent URL
      }

      exportHistory.value.unshift(exportRecord)
      localStorage.setItem('exportHistory', JSON.stringify(exportHistory.value))
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const exportData = async () => {
      try {
        loading.value = true

        const data = filterDataByDate(getDataByType(selectedDataType.value))

        if (data.length === 0) {
          alert('No data to export')
          return
        }

        switch (selectedFormat.value) {
          case 'csv':
            exportCSV(data)
            break
          case 'pdf':
            exportPDF(data)
            break
          case 'json':
            exportJSON(data)
            break
          case 'excel':
            exportExcel(data)
            break
        }

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Export error:', error)
        alert('Export failed. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const scheduleExport = () => {
      const modal = new bootstrap.Modal(document.getElementById('scheduleModal'))
      modal.show()
    }

    const confirmScheduleExport = () => {
      // In a real application, this would create a scheduled job
      console.log('Scheduling export:', scheduleForm.value)

      const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'))
      modal.hide()

      alert('Export scheduled successfully!')

      // Reset form
      scheduleForm.value = {
        name: '',
        frequency: 'weekly',
        startDate: '',
        recipients: '',
      }
    }

    const downloadExport = (exportItem) => {
      // In a real application, this would download from a server
      console.log('Downloading:', exportItem.filename)
      alert('Download feature would be implemented with server storage')
    }

    const deleteExport = (exportId) => {
      if (confirm('Are you sure you want to delete this export?')) {
        exportHistory.value = exportHistory.value.filter((item) => item.id !== exportId)
        localStorage.setItem('exportHistory', JSON.stringify(exportHistory.value))
      }
    }

    // Load export history
    onMounted(() => {
      const stored = localStorage.getItem('exportHistory')
      if (stored) {
        exportHistory.value = JSON.parse(stored)
      }
      refreshPreview()
    })

    // Watch for changes and refresh preview
    watch([selectedDataType, dateFrom, dateTo], refreshPreview)

    return {
      selectedFormat,
      selectedDataType,
      dateFrom,
      dateTo,
      today,
      loading,
      previewData,
      previewColumns,
      exportHistory,
      pdfOptions,
      scheduleForm,
      refreshPreview,
      formatCellValue,
      formatDate,
      exportData,
      scheduleExport,
      confirmScheduleExport,
      downloadExport,
      deleteExport,
    }
  },
}
</script>

<style scoped>
.export-component {
  max-width: 1200px;
  margin: 0 auto;
}

.export-controls .form-select,
.export-controls .form-control {
  border-radius: 6px;
}

.data-preview {
  border: 1px solid #dee2e6;
}

.table-responsive {
  border-radius: 6px;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.export-actions button {
  border-radius: 6px;
  font-weight: 500;
}

.export-history .list-group-item {
  border-radius: 6px !important;
  margin-bottom: 0.25rem;
  border: 1px solid #dee2e6;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
}

@media (max-width: 768px) {
  .export-controls .row {
    gap: 0.5rem;
  }

  .export-controls .col-md-3 {
    width: 100%;
  }

  .export-actions .col-md-6 {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }
}

/* Loading animation */
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
