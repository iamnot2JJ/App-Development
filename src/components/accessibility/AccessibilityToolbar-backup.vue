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
              >
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
              :aria-label="screenReaderMode ? 'Disable screen reader mode' : 'Enable screen reader mode'"
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
              :aria-label="keyboardNavigation ? 'Disable keyboard navigation' : 'Enable keyboard navigation'"
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
    <div class="focus-indicator" v-if="keyboardNavigation"></div>

    <!-- Screen reader announcements -->
    <div class="sr-only" aria-live="polite" aria-atomic="true" ref="announcements">
      {{ currentAnnouncement }}
    </div>
  </div>
</template><script>
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
        
        // Apply high contrast immediately if enabled
        if (highContrast.value) {
          const elementsToUpdate = [document.documentElement, document.body]
          elementsToUpdate.forEach(element => {
            element.classList.add('high-contrast-mode')
          })
          const sections = document.querySelectorAll('main, section, header, footer, nav')
          sections.forEach(section => {
            section.classList.add('high-contrast-mode')
          })
        }
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
      console.log('High contrast toggled:', highContrast.value)
      
      // Apply high contrast class to document elements
      const elementsToUpdate = [document.documentElement, document.body]
      elementsToUpdate.forEach(element => {
        if (highContrast.value) {
          element.classList.add('high-contrast-mode')
        } else {
          element.classList.remove('high-contrast-mode')
        }
      })
      
      // Also add to all major sections
      const sections = document.querySelectorAll('main, section, header, footer, nav')
      sections.forEach(section => {
        if (highContrast.value) {
          section.classList.add('high-contrast-mode')
        } else {
          section.classList.remove('high-contrast-mode')
        }
      })
      
      announceChange(`High contrast ${highContrast.value ? 'enabled' : 'disabled'}`)
      saveSettings()
    }

    const increaseFontSize = () => {
      if (fontSize.value < 1.5) {
        fontSize.value = Math.min(1.5, Math.round((fontSize.value + 0.1) * 10) / 10)
        applyFontSize()
        announceChange(`Font size increased to ${Math.round(fontSize.value * 100)}%`)
        saveSettings()
        console.log('Font size increased to:', fontSize.value)
      }
    }

    const decreaseFontSize = () => {
      if (fontSize.value > 0.8) {
        fontSize.value = Math.max(0.8, Math.round((fontSize.value - 0.1) * 10) / 10)
        applyFontSize()
        announceChange(`Font size decreased to ${Math.round(fontSize.value * 100)}%`)
        saveSettings()
        console.log('Font size decreased to:', fontSize.value)
      }
    }

    const applyFontSize = () => {
      console.log('Applying font size:', fontSize.value)
      document.documentElement.style.fontSize = `${fontSize.value}rem`
      // Also apply to body for better compatibility
      document.body.style.fontSize = `${fontSize.value}rem`
      
      // Trigger a visual update
      document.body.classList.add('font-size-updated')
      setTimeout(() => {
        document.body.classList.remove('font-size-updated')
      }, 100)
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

      // Apply resets
      applyFontSize()
      disableScreenReaderFeatures()
      disableKeyboardNavigation()

      // Reset document styles
      document.documentElement.style.fontSize = '1rem'
      document.body.style.fontSize = '1rem'
      
      // Remove high contrast classes
      const elementsToReset = [document.documentElement, document.body]
      elementsToReset.forEach(element => {
        element.classList.remove('high-contrast-mode')
      })
      
      const sections = document.querySelectorAll('main, section, header, footer, nav')
      sections.forEach(section => {
        section.classList.remove('high-contrast-mode')
      })

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

      // Apply loaded settings
      if (fontSize.value !== 1) {
        applyFontSize()
      }
      if (keyboardNavigation.value) {
        enableKeyboardNavigation()
      }
      if (screenReaderMode.value) {
        enableScreenReaderFeatures()
      }

      // Add main content ID if it doesn't exist
      const main = document.querySelector('main')
      if (main && !main.id) {
        main.id = 'main-content'
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleGlobalKeyboard)
      disableKeyboardNavigation()
      // Reset document styles on unmount
      document.documentElement.style.fontSize = ''
      document.body.style.fontSize = ''
      
      // Remove high contrast classes
      const elementsToClean = [document.documentElement, document.body]
      elementsToClean.forEach(element => {
        element.classList.remove('high-contrast-mode')
      })
      
      const sections = document.querySelectorAll('main, section, header, footer, nav')
      sections.forEach(section => {
        section.classList.remove('high-contrast-mode')
      })
    })

    // Watch for changes and apply them immediately
    watch([highContrast, screenReaderMode, keyboardNavigation, fontSize], () => {
      if (keyboardNavigation.value) {
        enableKeyboardNavigation()
      } else {
        disableKeyboardNavigation()
      }
      
      if (screenReaderMode.value) {
        enableScreenReaderFeatures()
      } else {
        disableScreenReaderFeatures()
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
  transform: translateX(100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.accessibility-panel {
  transform: translateX(0);
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
    gap: 0.5rem !important;
  }

  .font-size-controls {
    order: 2;
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .accessibility-toolbar {
    min-height: 80px;
  }
  
  .toolbar-offset {
    height: 80px;
  }

  .accessibility-toggle-btn {
    width: 45px;
    height: 45px;
    top: 85px;
    right: 10px;
  }
  
  .btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 576px) {
  .accessibility-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem !important;
  }
  
  .font-size-controls {
    order: 1;
    width: 100%;
    justify-content: space-between;
  }
  
  .accessibility-toolbar {
    min-height: 120px;
  }
  
  .toolbar-offset {
    height: 120px;
  }
  
  .accessibility-toggle-btn {
    top: 125px;
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
