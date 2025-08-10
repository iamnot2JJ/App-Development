<template>
  <div class="accessibility-wrapper" :class="accessibilityClasses">
    <div class="accessibility-toolbar" v-if="showToolbar">
      <div class="container-fluid">
        <div class="d-flex align-items-center justify-content-between py-2">
          <div class="accessibility-controls d-flex align-items-center gap-3">
            <button
              class="btn btn-sm btn-outline-light"
              @click="toggleHighContrast"
              :aria-label="highContrast ? 'Disable high contrast' : 'Enable high contrast'"
              title="Toggle High Contrast"
            >
              <i class="fas fa-adjust"></i>
              <span class="d-none d-md-inline ms-1">High Contrast</span>
            </button>

            <div class="font-size-controls d-flex align-items-center gap-1">
              <span class="text-light small d-none d-md-inline">Font Size:</span>
              <button
                class="btn btn-sm btn-outline-light"
                @click="decreaseFontSize"
                :disabled="fontSize <= 0.8"
                aria-label="Decrease font size"
                title="Decrease Font Size"
              >
                <i class="fas fa-minus"></i>
              </button>
              <span class="text-light small font-size-display"
                >{{ Math.round(fontSize * 100) }}%</span
              >
              <button
                class="btn btn-sm btn-outline-light"
                @click="increaseFontSize"
                :disabled="fontSize >= 1.5"
                aria-label="Increase font size"
                title="Increase Font Size"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <button
              class="btn btn-sm btn-outline-light"
              @click="toggleScreenReader"
              :aria-label="
                screenReaderMode ? 'Disable screen reader mode' : 'Enable screen reader mode'
              "
              title="Toggle Screen Reader Mode"
            >
              <i class="fas fa-volume-up"></i>
              <span class="d-none d-md-inline ms-1">Screen Reader</span>
            </button>

            <button
              class="btn btn-sm btn-outline-light"
              @click="toggleKeyboardNavigation"
              :aria-label="
                keyboardNavigation ? 'Disable keyboard navigation' : 'Enable keyboard navigation'
              "
              title="Toggle Keyboard Navigation Highlights"
            >
              <i class="fas fa-keyboard"></i>
              <span class="d-none d-md-inline ms-1">Keyboard Nav</span>
            </button>

            <button
              class="btn btn-sm btn-outline-light"
              @click="resetAccessibility"
              aria-label="Reset accessibility settings"
              title="Reset All Accessibility Settings"
            >
              <i class="fas fa-undo"></i>
              <span class="d-none d-md-inline ms-1">Reset</span>
            </button>
          </div>

          <button
            class="btn btn-sm btn-outline-light"
            @click="showToolbar = false"
            aria-label="Close accessibility toolbar"
            title="Close Accessibility Toolbar"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <button
      v-if="!showToolbar"
      class="accessibility-toggle-btn"
      @click="showToolbar = true"
      aria-label="Open accessibility toolbar"
      title="Open Accessibility Options"
    >
      <i class="fas fa-universal-access"></i>
    </button>

    <!-- Skip to content link -->
    <a href="#main-content" class="skip-link" @click="skipToContent"> Skip to main content </a>

    <!-- Focus indicator -->
    <div class="focus-indicator" v-if="keyboardNavigation"></div>

    <!-- Screen reader announcements -->
    <div class="sr-only" aria-live="polite" aria-atomic="true" ref="announcements">
      {{ currentAnnouncement }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

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

    const accessibilityClasses = computed(() => ({
      'high-contrast': highContrast.value,
      'screen-reader-mode': screenReaderMode.value,
      'keyboard-navigation': keyboardNavigation.value,
    }))

    // Load saved settings
    const loadSettings = () => {
      const saved = localStorage.getItem('accessibilitySettings')
      if (saved) {
        const settings = JSON.parse(saved)
        highContrast.value = settings.highContrast || false
        fontSize.value = settings.fontSize || 1
        screenReaderMode.value = settings.screenReaderMode || false
        keyboardNavigation.value = settings.keyboardNavigation || false
      }
      applyFontSize()
    }

    // Save settings
    const saveSettings = () => {
      const settings = {
        highContrast: highContrast.value,
        fontSize: fontSize.value,
        screenReaderMode: screenReaderMode.value,
        keyboardNavigation: keyboardNavigation.value,
      }
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings))
    }

    const toggleHighContrast = () => {
      highContrast.value = !highContrast.value
      announceChange(`High contrast ${highContrast.value ? 'enabled' : 'disabled'}`)
      saveSettings()
    }

    const increaseFontSize = () => {
      if (fontSize.value < 1.5) {
        fontSize.value = Math.min(1.5, fontSize.value + 0.1)
        applyFontSize()
        announceChange(`Font size increased to ${Math.round(fontSize.value * 100)}%`)
        saveSettings()
      }
    }

    const decreaseFontSize = () => {
      if (fontSize.value > 0.8) {
        fontSize.value = Math.max(0.8, fontSize.value - 0.1)
        applyFontSize()
        announceChange(`Font size decreased to ${Math.round(fontSize.value * 100)}%`)
        saveSettings()
      }
    }

    const applyFontSize = () => {
      document.documentElement.style.fontSize = `${fontSize.value}rem`
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

    const toggleKeyboardNavigation = () => {
      keyboardNavigation.value = !keyboardNavigation.value
      announceChange(
        `Keyboard navigation highlights ${keyboardNavigation.value ? 'enabled' : 'disabled'}`
      )

      if (keyboardNavigation.value) {
        enableKeyboardNavigation()
      } else {
        disableKeyboardNavigation()
      }
      saveSettings()
    }

    const resetAccessibility = () => {
      highContrast.value = false
      fontSize.value = 1
      screenReaderMode.value = false
      keyboardNavigation.value = false

      applyFontSize()
      disableScreenReaderFeatures()
      disableKeyboardNavigation()

      announceChange('All accessibility settings have been reset')
      saveSettings()
    }

    const skipToContent = (event) => {
      event.preventDefault()
      const mainContent = document.getElementById('main-content') || document.querySelector('main')
      if (mainContent) {
        mainContent.focus()
        mainContent.scrollIntoView()
        announceChange('Skipped to main content')
      }
    }

    const announceChange = (message) => {
      currentAnnouncement.value = message
      setTimeout(() => {
        currentAnnouncement.value = ''
      }, 1000)
    }

    const enableScreenReaderFeatures = () => {
      // Add additional ARIA labels and descriptions
      document.querySelectorAll('img:not([alt])').forEach((img) => {
        img.setAttribute('alt', 'Image')
      })

      // Announce page navigation
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const newHeading = Array.from(mutation.addedNodes).find(
              (node) => node.nodeType === 1 && /^H[1-6]$/.test(node.tagName)
            )
            if (newHeading) {
              announceChange(`New section: ${newHeading.textContent}`)
            }
          }
        })
      })

      observer.observe(document.body, { childList: true, subtree: true })
    }

    const disableScreenReaderFeatures = () => {
      // Remove added ARIA labels if needed
    }

    const enableKeyboardNavigation = () => {
      // Add focus styles for better keyboard navigation
      const style = document.createElement('style')
      style.id = 'keyboard-nav-styles'
      style.textContent = `
        .keyboard-navigation *:focus {
          outline: 3px solid #007bff !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
        }

        .keyboard-navigation button:focus,
        .keyboard-navigation input:focus,
        .keyboard-navigation select:focus,
        .keyboard-navigation textarea:focus,
        .keyboard-navigation a:focus {
          background-color: rgba(0, 123, 255, 0.1) !important;
        }
      `
      document.head.appendChild(style)

      // Add keyboard event listeners
      document.addEventListener('keydown', handleKeyboardNavigation)
    }

    const disableKeyboardNavigation = () => {
      const style = document.getElementById('keyboard-nav-styles')
      if (style) {
        style.remove()
      }
      document.removeEventListener('keydown', handleKeyboardNavigation)
    }

    const handleKeyboardNavigation = (event) => {
      // Tab navigation enhancements
      if (event.key === 'Tab') {
        announceChange('Navigating with keyboard')
      }

      // Escape key to close modals/dropdowns
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.show')
        if (activeModal) {
          const closeBtn = activeModal.querySelector('[data-bs-dismiss="modal"]')
          if (closeBtn) {
            closeBtn.click()
            announceChange('Modal closed')
          }
        }
      }

      // Arrow key navigation for lists and tables
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const focusedElement = document.activeElement
        if (focusedElement && focusedElement.closest('.list-group, table')) {
          handleArrowNavigation(event, focusedElement)
        }
      }
    }

    const handleArrowNavigation = (event, element) => {
      const container = element.closest('.list-group, table')
      const focusableElements = container.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const currentIndex = Array.from(focusableElements).indexOf(element)

      let nextIndex = currentIndex

      switch (event.key) {
        case 'ArrowDown':
          nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1)
          break
        case 'ArrowUp':
          nextIndex = Math.max(0, currentIndex - 1)
          break
        case 'ArrowRight':
          if (container.tagName === 'TABLE') {
            const nextCell = element
              .closest('td, th')
              ?.nextElementSibling?.querySelector(
                'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
              )
            if (nextCell) {
              nextCell.focus()
              event.preventDefault()
              return
            }
          }
          break
        case 'ArrowLeft':
          if (container.tagName === 'TABLE') {
            const prevCell = element
              .closest('td, th')
              ?.previousElementSibling?.querySelector(
                'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
              )
            if (prevCell) {
              prevCell.focus()
              event.preventDefault()
              return
            }
          }
          break
      }

      if (nextIndex !== currentIndex && focusableElements[nextIndex]) {
        focusableElements[nextIndex].focus()
        event.preventDefault()
      }
    }

    // Auto-detect user preferences
    const detectUserPreferences = () => {
      // Check for prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms')
      }

      // Check for prefers-contrast
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        highContrast.value = true
      }

      // Check for forced-colors (Windows High Contrast mode)
      if (window.matchMedia('(forced-colors: active)').matches) {
        highContrast.value = true
      }
    }

    // Keyboard shortcuts
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
    }

    onMounted(() => {
      loadSettings()
      detectUserPreferences()
      document.addEventListener('keydown', handleGlobalKeyboard)

      // Add main content ID if it doesn't exist
      const main = document.querySelector('main')
      if (main && !main.id) {
        main.id = 'main-content'
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleGlobalKeyboard)
      disableKeyboardNavigation()
    })

    // Watch for changes and apply them
    watch([highContrast, screenReaderMode, keyboardNavigation], () => {
      if (keyboardNavigation.value) {
        enableKeyboardNavigation()
      } else {
        disableKeyboardNavigation()
      }
    })

    return {
      showToolbar,
      highContrast,
      fontSize,
      screenReaderMode,
      keyboardNavigation,
      currentAnnouncement,
      announcements,
      accessibilityClasses,
      toggleHighContrast,
      increaseFontSize,
      decreaseFontSize,
      toggleScreenReader,
      toggleKeyboardNavigation,
      resetAccessibility,
      skipToContent,
    }
  },
}
</script>

<style scoped>
.accessibility-toolbar {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-bottom: 2px solid #3498db;
  position: sticky;
  top: 0;
  z-index: 1050;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.accessibility-toggle-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1040;
  transition: all 0.3s ease;
}

.accessibility-toggle-btn:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1060;
  font-weight: bold;
}

.skip-link:focus {
  top: 6px;
}

.font-size-display {
  min-width: 40px;
  text-align: center;
}

.focus-indicator {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  border: 3px solid #007bff;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 4px;
  transition: all 0.1s ease;
}

/* High contrast mode styles */
:deep(.high-contrast) {
  filter: contrast(150%) brightness(110%);
}

:deep(.high-contrast) .card {
  border: 2px solid #000 !important;
  background: #fff !important;
  color: #000 !important;
}

:deep(.high-contrast) .btn-primary {
  background: #000 !important;
  border-color: #000 !important;
  color: #fff !important;
}

:deep(.high-contrast) .btn-secondary {
  background: #666 !important;
  border-color: #666 !important;
  color: #fff !important;
}

:deep(.high-contrast) .text-muted {
  color: #000 !important;
}

:deep(.high-contrast) .bg-light {
  background: #fff !important;
  color: #000 !important;
}

:deep(.high-contrast) .bg-dark {
  background: #000 !important;
  color: #fff !important;
}

/* Screen reader mode styles */
:deep(.screen-reader-mode) img {
  border: 2px solid #007bff;
}

:deep(.screen-reader-mode) button,
:deep(.screen-reader-mode) a {
  position: relative;
}

:deep(.screen-reader-mode) button:focus::after,
:deep(.screen-reader-mode) a:focus::after {
  content: ' (focused)';
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Keyboard navigation styles */
:deep(.keyboard-navigation) {
  --focus-outline: 3px solid #007bff;
  --focus-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Responsive design */
@media (max-width: 768px) {
  .accessibility-controls {
    flex-wrap: wrap;
    gap: 1rem !important;
  }

  .font-size-controls {
    order: 2;
    width: 100%;
    justify-content: center;
  }

  .accessibility-toggle-btn {
    width: 45px;
    height: 45px;
    top: 5px;
    right: 5px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  .accessibility-toolbar,
  .accessibility-toggle-btn {
    display: none !important;
  }
}
</style>
