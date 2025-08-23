<template>
  <div class="accessibility-wrapper">
    <!-- Floating accessibility button -->
    <button
      v-if="!showToolbar"
      class="accessibility-toggle-btn"
      @click="showToolbar = true"
      aria-label="Open accessibility toolbar"
      title="Open Accessibility Options (Alt+A)"
      tabindex="0"
    >
      <i class="fas fa-universal-access"></i>
    </button>

    <!-- Accessibility panel (sidebar style) -->
    <div
      v-if="showToolbar"
      class="accessibility-panel"
      role="dialog"
      aria-label="Accessibility Settings"
      aria-modal="false"
    >
      <div class="panel-header">
        <h3 class="panel-title">
          <i class="fas fa-universal-access me-2"></i>
          Accessibility
        </h3>
        <button
          class="close-btn"
          @click="showToolbar = false"
          aria-label="Close accessibility panel"
          title="Close (Esc)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="panel-content">
        <!-- High Contrast -->
        <div class="control-section">
          <div class="control-group">
            <button
              class="btn-accessibility"
              :class="{ active: highContrast }"
              @click="toggleHighContrast"
              :aria-label="highContrast ? 'Disable high contrast' : 'Enable high contrast'"
              :aria-pressed="highContrast"
            >
              <i class="fas fa-adjust me-2"></i>
              {{ highContrast ? 'High Contrast ON' : 'High Contrast OFF' }}
            </button>
          </div>
        </div>

        <!-- Font Size -->
        <div class="control-section">
          <label class="section-title">Font Size</label>
          <div class="control-group">
            <div class="slider-container">
              <button
                class="btn-sm"
                @click="decreaseFontSize"
                :disabled="fontSize <= 0.8"
                aria-label="Decrease font size"
                title="Decrease Font Size (Alt+-)"
              >
                <i class="fas fa-minus"></i>
              </button>
              <input
                type="range"
                class="font-slider"
                v-model="fontSize"
                min="0.8"
                max="1.5"
                step="0.1"
                @input="applyFontSize"
                aria-label="Font size slider"
              />
              <button
                class="btn-sm"
                @click="increaseFontSize"
                :disabled="fontSize >= 1.5"
                aria-label="Increase font size"
                title="Increase Font Size (Alt+=)"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="font-value">{{ Math.round(fontSize * 100) }}%</div>
          </div>
        </div>

        <!-- Screen Reader -->
        <div class="control-section">
          <div class="control-group">
            <button
              class="btn-accessibility"
              :class="{ active: screenReaderMode }"
              @click="toggleScreenReader"
              :aria-label="
                screenReaderMode ? 'Disable screen reader mode' : 'Enable screen reader mode'
              "
              :aria-pressed="screenReaderMode"
            >
              <i class="fas fa-volume-up me-2"></i>
              {{ screenReaderMode ? 'Screen Reader ON' : 'Screen Reader OFF' }}
            </button>
          </div>
        </div>

        <!-- Keyboard Navigation -->
        <div class="control-section">
          <div class="control-group">
            <button
              class="btn-accessibility"
              :class="{ active: keyboardNavigation }"
              @click="toggleKeyboardNavigation"
              :aria-label="
                keyboardNavigation ? 'Disable keyboard navigation' : 'Enable keyboard navigation'
              "
              :aria-pressed="keyboardNavigation"
            >
              <i class="fas fa-keyboard me-2"></i>
              {{ keyboardNavigation ? 'Keyboard Highlights ON' : 'Keyboard Highlights OFF' }}
            </button>
          </div>
        </div>

        <!-- Reset -->
        <div class="control-section">
          <div class="control-group">
            <button
              class="btn-reset"
              @click="resetAccessibility"
              aria-label="Reset all accessibility settings"
              title="Reset All Settings"
            >
              <i class="fas fa-undo me-2"></i>
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="showToolbar"
      class="accessibility-backdrop"
      @click="showToolbar = false"
      aria-hidden="true"
    ></div>

    <!-- Skip to content link -->
    <a href="#main-content" class="skip-link" @click="skipToContent"> Skip to main content </a>

    <!-- Focus indicator -->
    <div class="focus-indicator" v-if="keyboardNavigation" ref="focusIndicator"></div>

    <!-- Screen reader announcements -->
    <div class="sr-only" aria-live="polite" aria-atomic="true" ref="announcements">
      {{ currentAnnouncement }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'AccessibilityToolbar',
  setup() {
    const showToolbar = ref(false)
    const highContrast = ref(false)
    const fontSize = ref(1)
    const screenReaderMode = ref(false)
    const keyboardNavigation = ref(false)
    const currentAnnouncement = ref('')
    const announcements = ref(null)
    const focusIndicator = ref(null)

    // Load saved settings
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('accessibilitySettings')
        if (saved) {
          const settings = JSON.parse(saved)
          highContrast.value = settings.highContrast || false
          fontSize.value = settings.fontSize || 1
          screenReaderMode.value = settings.screenReaderMode || false
          keyboardNavigation.value = settings.keyboardNavigation || false

          // Apply high contrast immediately if enabled
          if (highContrast.value) {
            applyHighContrast()
          }
        }
        applyFontSize()
      } catch (error) {
        console.error('Error loading accessibility settings:', error)
      }
    }

    // Save settings
    const saveSettings = () => {
      try {
        const settings = {
          highContrast: highContrast.value,
          fontSize: fontSize.value,
          screenReaderMode: screenReaderMode.value,
          keyboardNavigation: keyboardNavigation.value,
        }
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings))
      } catch (error) {
        console.error('Error saving accessibility settings:', error)
      }
    }

    // Announce changes for screen readers
    const announceChange = (message) => {
      currentAnnouncement.value = message
      setTimeout(() => {
        currentAnnouncement.value = ''
      }, 1000)
    }

    // High contrast functions
    const applyHighContrast = () => {
      const elementsToUpdate = [document.documentElement, document.body]
      elementsToUpdate.forEach((element) => {
        element.classList.add('high-contrast-mode')
      })
      const sections = document.querySelectorAll('main, section, header, footer, nav')
      sections.forEach((section) => {
        section.classList.add('high-contrast-mode')
      })
    }

    const removeHighContrast = () => {
      const elementsToUpdate = [document.documentElement, document.body]
      elementsToUpdate.forEach((element) => {
        element.classList.remove('high-contrast-mode')
      })
      const sections = document.querySelectorAll('main, section, header, footer, nav')
      sections.forEach((section) => {
        section.classList.remove('high-contrast-mode')
      })
    }

    const toggleHighContrast = () => {
      highContrast.value = !highContrast.value
      console.log('High contrast toggled:', highContrast.value)

      if (highContrast.value) {
        applyHighContrast()
      } else {
        removeHighContrast()
      }

      announceChange(`High contrast ${highContrast.value ? 'enabled' : 'disabled'}`)
      saveSettings()
    }

    // Font size functions
    const increaseFontSize = () => {
      if (fontSize.value < 1.5) {
        fontSize.value = Math.min(1.5, Math.round((fontSize.value + 0.1) * 10) / 10)
        applyFontSize()
        announceChange(`Font size increased to ${Math.round(fontSize.value * 100)}%`)
        saveSettings()
      }
    }

    const decreaseFontSize = () => {
      if (fontSize.value > 0.8) {
        fontSize.value = Math.max(0.8, Math.round((fontSize.value - 0.1) * 10) / 10)
        applyFontSize()
        announceChange(`Font size decreased to ${Math.round(fontSize.value * 100)}%`)
        saveSettings()
      }
    }

    const applyFontSize = () => {
      console.log('Applying font size:', fontSize.value)
      document.documentElement.style.fontSize = `${fontSize.value}rem`
      document.body.style.fontSize = `${fontSize.value}rem`
      saveSettings()
    }

    // Screen reader functions
    const enableScreenReaderFeatures = () => {
      // Add more descriptive labels
      document.body.setAttribute('aria-label', 'Main application content')

      // Enhance form labels
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach((input) => {
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
          const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`)
          if (label) {
            input.setAttribute(
              'aria-labelledby',
              label.id || 'label-' + Math.random().toString(36).substr(2, 9)
            )
          }
        }
      })
    }

    const disableScreenReaderFeatures = () => {
      document.body.removeAttribute('aria-label')
    }

    const toggleScreenReader = () => {
      screenReaderMode.value = !screenReaderMode.value
      announceChange(`Screen reader mode ${screenReaderMode.value ? 'enabled' : 'disabled'}`)

      if (screenReaderMode.value) {
        enableScreenReaderFeatures()
      } else {
        disableScreenReaderFeatures()
      }
      saveSettings()
    }

    // Keyboard navigation functions
    const enableKeyboardNavigation = () => {
      document.addEventListener('keydown', handleTabNavigation)
      document.addEventListener('focusin', updateFocusIndicator)
      document.addEventListener('focusout', hideFocusIndicator)

      // Add focus styles
      const style = document.createElement('style')
      style.id = 'keyboard-nav-styles'
      style.textContent = `
        *:focus {
          outline: 3px solid #007bff !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 5px rgba(0, 123, 255, 0.25) !important;
        }

        .focus-indicator {
          position: absolute;
          pointer-events: none;
          z-index: 9999;
          border: 3px solid #007bff;
          background: rgba(0, 123, 255, 0.1);
          border-radius: 4px;
          transition: all 0.1s ease;
        }
      `
      document.head.appendChild(style)
    }

    const disableKeyboardNavigation = () => {
      document.removeEventListener('keydown', handleTabNavigation)
      document.removeEventListener('focusin', updateFocusIndicator)
      document.removeEventListener('focusout', hideFocusIndicator)

      const style = document.getElementById('keyboard-nav-styles')
      if (style) {
        style.remove()
      }
    }

    const updateFocusIndicator = (event) => {
      if (focusIndicator.value && event.target) {
        const rect = event.target.getBoundingClientRect()
        focusIndicator.value.style.left = rect.left + 'px'
        focusIndicator.value.style.top = rect.top + 'px'
        focusIndicator.value.style.width = rect.width + 'px'
        focusIndicator.value.style.height = rect.height + 'px'
        focusIndicator.value.style.display = 'block'
      }
    }

    const hideFocusIndicator = () => {
      if (focusIndicator.value) {
        focusIndicator.value.style.display = 'none'
      }
    }

    const handleTabNavigation = (event) => {
      if (event.key === 'Tab') {
        updateFocusIndicator(event)
      }
    }

    const toggleKeyboardNavigation = () => {
      keyboardNavigation.value = !keyboardNavigation.value
      announceChange(`Keyboard navigation ${keyboardNavigation.value ? 'enabled' : 'disabled'}`)

      if (keyboardNavigation.value) {
        enableKeyboardNavigation()
      } else {
        disableKeyboardNavigation()
      }
      saveSettings()
    }

    // Reset function
    const resetAccessibility = () => {
      highContrast.value = false
      fontSize.value = 1
      screenReaderMode.value = false
      keyboardNavigation.value = false

      // Apply resets
      removeHighContrast()
      applyFontSize()
      disableScreenReaderFeatures()
      disableKeyboardNavigation()

      announceChange('All accessibility settings have been reset')
      saveSettings()
    }

    // Skip to content
    const skipToContent = (event) => {
      event.preventDefault()
      const mainContent = document.getElementById('main-content') || document.querySelector('main')
      if (mainContent) {
        mainContent.focus()
        mainContent.scrollIntoView()
      }
    }

    // Global keyboard shortcuts
    const handleGlobalKeyboard = (event) => {
      // Alt + A to toggle accessibility toolbar
      if (event.altKey && event.key === 'a') {
        event.preventDefault()
        showToolbar.value = !showToolbar.value
        announceChange(`Accessibility toolbar ${showToolbar.value ? 'opened' : 'closed'}`)
      }

      // Alt + H for high contrast
      if (event.altKey && event.key === 'h') {
        event.preventDefault()
        toggleHighContrast()
      }

      // Alt + + for increase font size
      if (event.altKey && event.key === '=') {
        event.preventDefault()
        increaseFontSize()
      }

      // Alt + - for decrease font size
      if (event.altKey && event.key === '-') {
        event.preventDefault()
        decreaseFontSize()
      }

      // Escape to close toolbar
      if (event.key === 'Escape' && showToolbar.value) {
        showToolbar.value = false
        announceChange('Accessibility toolbar closed')
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      loadSettings()
      document.addEventListener('keydown', handleGlobalKeyboard)

      // Auto-detect user preferences
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        highContrast.value = true
        applyHighContrast()
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms')
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleGlobalKeyboard)
      disableKeyboardNavigation()
      disableScreenReaderFeatures()

      // Reset document styles on unmount
      document.documentElement.style.fontSize = ''
      document.body.style.fontSize = ''
      removeHighContrast()
    })

    return {
      showToolbar,
      highContrast,
      fontSize,
      screenReaderMode,
      keyboardNavigation,
      currentAnnouncement,
      announcements,
      focusIndicator,
      toggleHighContrast,
      increaseFontSize,
      decreaseFontSize,
      applyFontSize,
      toggleScreenReader,
      toggleKeyboardNavigation,
      resetAccessibility,
      skipToContent,
    }
  },
}
</script>

<style scoped>
/* Accessibility panel - sidebar style */
.accessibility-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: white;
  border-left: 2px solid #007bff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 1055;
  overflow-y: auto;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.panel-header {
  background: #007bff;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #0056b3;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-btn:hover,
.close-btn:focus {
  background: rgba(255, 255, 255, 0.2);
  outline: 2px solid white;
  outline-offset: 2px;
}

.panel-content {
  padding: 20px;
}

.control-section {
  margin-bottom: 25px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  margin-bottom: 10px;
  display: block;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-accessibility {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
}

.btn-accessibility:hover,
.btn-accessibility:focus {
  background: #218838;
  outline: 2px solid #28a745;
  outline-offset: 2px;
  transform: translateY(-1px);
}

.btn-accessibility.active {
  background: #dc3545;
}

.btn-accessibility.active:hover,
.btn-accessibility.active:focus {
  background: #c82333;
  outline-color: #dc3545;
}

.btn-reset {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
}

.btn-reset:hover,
.btn-reset:focus {
  background: #5a6268;
  outline: 2px solid #6c757d;
  outline-offset: 2px;
  transform: translateY(-1px);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.btn-sm {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sm:hover,
.btn-sm:focus {
  background: #0056b3;
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.btn-sm:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.font-slider {
  flex: 1;
  min-width: 120px;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.font-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.font-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.font-value {
  font-weight: 600;
  color: #495057;
  min-width: 45px;
  text-align: center;
  font-size: 14px;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* Toggle button */
.accessibility-toggle-btn {
  position: fixed;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1050;
  transition: all 0.3s ease;
}

.accessibility-toggle-btn:hover,
.accessibility-toggle-btn:focus {
  background: #0056b3;
  transform: translateY(-50%) scale(1.05);
  outline: 3px solid #007bff;
  outline-offset: 3px;
}

/* Backdrop */
.accessibility-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  transition: opacity 0.3s ease;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px 12px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1060;
  font-weight: bold;
  transition: top 0.3s ease;
}

.skip-link:focus {
  top: 6px;
}

/* Focus indicator */
.focus-indicator {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  border: 3px solid #007bff;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 4px;
  transition: all 0.1s ease;
  display: none;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .accessibility-panel {
    width: 100%;
    right: 0;
  }

  .accessibility-toggle-btn {
    top: auto;
    bottom: 20px;
    right: 20px;
    transform: none;
  }

  .accessibility-toggle-btn:hover,
  .accessibility-toggle-btn:focus {
    transform: scale(1.05);
  }
}

@media (max-width: 480px) {
  .panel-content {
    padding: 15px;
  }

  .accessibility-toggle-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
    bottom: 15px;
    right: 15px;
  }
}
</style>

<!-- Global High Contrast Styles -->
<style>
/* High contrast mode styles */
:deep(.high-contrast-mode),
:deep(.high-contrast-mode *) {
  background: #000000 !important;
  color: #ffffff !important;
  border-color: #ffffff !important;
}

:deep(.high-contrast-mode) .btn,
:deep(.high-contrast-mode) button {
  background: #ffffff !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
}

:deep(.high-contrast-mode) .btn:hover,
:deep(.high-contrast-mode) button:hover {
  background: #cccccc !important;
  color: #000000 !important;
}

:deep(.high-contrast-mode) .navbar {
  background: #000000 !important;
  border-bottom: 2px solid #ffffff !important;
}

:deep(.high-contrast-mode) .card {
  background: #000000 !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}

:deep(.high-contrast-mode) .form-control,
:deep(.high-contrast-mode) .form-select,
:deep(.high-contrast-mode) input,
:deep(.high-contrast-mode) textarea,
:deep(.high-contrast-mode) select {
  background: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
}

:deep(.high-contrast-mode) .table {
  background: #000000 !important;
  color: #ffffff !important;
}

:deep(.high-contrast-mode) .table th,
:deep(.high-contrast-mode) .table td {
  border-color: #ffffff !important;
  background: #000000 !important;
  color: #ffffff !important;
}

:deep(.high-contrast-mode) .table-striped tbody tr:nth-of-type(odd) {
  background: #333333 !important;
}

:deep(.high-contrast-mode) a {
  color: #ffffff !important;
  text-decoration: underline !important;
}

:deep(.high-contrast-mode) a:hover,
:deep(.high-contrast-mode) a:focus {
  color: #cccccc !important;
}

:deep(.high-contrast-mode) .dropdown-menu {
  background: #000000 !important;
  border: 2px solid #ffffff !important;
}

:deep(.high-contrast-mode) .dropdown-item {
  background: #000000 !important;
  color: #ffffff !important;
}

:deep(.high-contrast-mode) .dropdown-item:hover,
:deep(.high-contrast-mode) .dropdown-item:focus {
  background: #333333 !important;
  color: #ffffff !important;
}

:deep(.high-contrast-mode) .modal-content {
  background: #000000 !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}

/* Focus indicators for high contrast */
:deep(.high-contrast-mode) *:focus {
  outline: 3px solid #ffffff !important;
  outline-offset: 2px !important;
}
</style>
