<template>
  <div class="interactive-table">
    <div class="table-controls mb-3">
      <div class="row">
        <div class="col-md-6">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Search all columns..."
              v-model="globalSearch"
              @input="performSearch"
            />
            <button class="btn btn-outline-secondary" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="pageSize" @change="updatePageSize">
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-success w-100" @click="exportData">
            <i class="fas fa-download"></i> Export CSV
          </button>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="sortBy(column.key)"
              :class="{ sortable: column.sortable !== false }"
            >
              {{ column.label }}
              <i v-if="column.sortable !== false" :class="getSortIcon(column.key)" class="ms-2"></i>
            </th>
            <th v-if="actions.length > 0">Actions</th>
          </tr>
          <tr v-if="showColumnSearch">
            <th v-for="column in columns" :key="`search-${column.key}`">
              <input
                type="text"
                class="form-control form-control-sm"
                :placeholder="`Search ${column.label}...`"
                v-model="columnSearches[column.key]"
                @input="performColumnSearch"
              />
            </th>
            <th v-if="actions.length > 0">
              <button class="btn btn-sm btn-outline-light" @click="showColumnSearch = false">
                <i class="fas fa-times"></i>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.id || row[idField]">
            <td v-for="column in columns" :key="column.key">
              <span v-if="column.type === 'date'">
                {{ formatDate(row[column.key]) }}
              </span>
              <span
                v-else-if="column.type === 'badge'"
                :class="`badge bg-${getBadgeColor(row[column.key])}`"
              >
                {{ row[column.key] }}
              </span>
              <span v-else-if="column.type === 'currency'">
                ${{ Number(row[column.key]).toFixed(2) }}
              </span>
              <span v-else>
                {{ row[column.key] }}
              </span>
            </td>
            <td v-if="actions.length > 0">
              <div class="btn-group btn-group-sm">
                <button
                  v-for="action in actions"
                  :key="action.name"
                  :class="`btn btn-outline-${action.variant || 'primary'}`"
                  @click="action.handler(row)"
                  :title="action.title"
                >
                  <i :class="action.icon"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredData.length === 0" class="text-center py-4">
      <i class="fas fa-search display-1 text-muted mb-3"></i>
      <h5>No data found</h5>
      <p class="text-muted">Try adjusting your search criteria</p>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
        <span v-if="filteredData.length !== data.length">
          (filtered from {{ data.length }} total entries)
        </span>
      </div>

      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
              First
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button
              class="page-link"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
            >
              Previous
            </button>
          </li>

          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="goToPage(page)">
              {{ page }}
            </button>
          </li>

          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button
              class="page-link"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              Next
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button
              class="page-link"
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
            >
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <div class="mt-2">
      <button
        class="btn btn-sm btn-outline-secondary"
        @click="showColumnSearch = !showColumnSearch"
      >
        <i class="fas fa-filter"></i> Column Search
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'

export default {
  name: 'InteractiveDataTable',
  props: {
    data: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    actions: {
      type: Array,
      default: () => [],
    },
    idField: {
      type: String,
      default: 'id',
    },
  },
  emits: ['row-action'],
  setup(props, { emit }) {
    const globalSearch = ref('')
    const columnSearches = ref({})
    const sortColumn = ref('')
    const sortDirection = ref('asc')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const showColumnSearch = ref(false)

    // Initialize column searches
    props.columns.forEach((column) => {
      columnSearches.value[column.key] = ''
    })

    const filteredData = computed(() => {
      let filtered = [...props.data]

      // Global search
      if (globalSearch.value) {
        const searchTerm = globalSearch.value.toLowerCase()
        filtered = filtered.filter((row) => {
          return props.columns.some((column) => {
            const value = row[column.key]
            return value && value.toString().toLowerCase().includes(searchTerm)
          })
        })
      }

      // Column-specific search
      Object.keys(columnSearches.value).forEach((columnKey) => {
        const searchTerm = columnSearches.value[columnKey]
        if (searchTerm) {
          filtered = filtered.filter((row) => {
            const value = row[columnKey]
            return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          })
        }
      })

      // Sort
      if (sortColumn.value) {
        filtered.sort((a, b) => {
          const aVal = a[sortColumn.value]
          const bVal = b[sortColumn.value]

          let comparison = 0
          if (aVal > bVal) comparison = 1
          if (aVal < bVal) comparison = -1

          return sortDirection.value === 'asc' ? comparison : -comparison
        })
      }

      return filtered
    })

    const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredData.value.slice(start, end)
    })

    const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
    const endIndex = computed(() =>
      Math.min(startIndex.value + pageSize.value, filteredData.value.length)
    )

    const visiblePages = computed(() => {
      const range = 2
      const start = Math.max(1, currentPage.value - range)
      const end = Math.min(totalPages.value, currentPage.value + range)

      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const sortBy = (column) => {
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
      }
      currentPage.value = 1
    }

    const getSortIcon = (column) => {
      if (sortColumn.value !== column) return 'fas fa-sort text-muted'
      return sortDirection.value === 'asc'
        ? 'fas fa-sort-up text-white'
        : 'fas fa-sort-down text-white'
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const updatePageSize = () => {
      currentPage.value = 1
    }

    const performSearch = () => {
      currentPage.value = 1
    }

    const performColumnSearch = () => {
      currentPage.value = 1
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return format(new Date(dateString), 'MMM dd, yyyy')
      } catch {
        return dateString
      }
    }

    const getBadgeColor = (value) => {
      const colorMap = {
        active: 'success',
        inactive: 'secondary',
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        high: 'danger',
        medium: 'warning',
        low: 'info',
        urgent: 'danger',
        normal: 'primary',
      }
      return colorMap[value.toLowerCase()] || 'primary'
    }

    const exportData = () => {
      const csvContent = [
        // Header
        props.columns.map((col) => col.label).join(','),
        // Data rows
        ...filteredData.value.map((row) =>
          props.columns
            .map((col) => {
              const value = row[col.key]
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value
            })
            .join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `data-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Reset page when data changes
    watch(
      () => props.data,
      () => {
        currentPage.value = 1
      }
    )

    return {
      globalSearch,
      columnSearches,
      sortColumn,
      sortDirection,
      currentPage,
      pageSize,
      showColumnSearch,
      filteredData,
      totalPages,
      paginatedData,
      startIndex,
      endIndex,
      visiblePages,
      sortBy,
      getSortIcon,
      goToPage,
      updatePageSize,
      performSearch,
      performColumnSearch,
      formatDate,
      getBadgeColor,
      exportData,
    }
  },
}
</script>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.table th {
  border-top: none;
}

.page-link {
  color: #6c757d;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.775rem;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .pagination {
    justify-content: center;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
