// Save data to localStorage
export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

// Retrieve data from localStorage
export const getFromStorage = (key) => {
  try {
    const serializedData = localStorage.getItem(key)
    return serializedData ? JSON.parse(serializedData) : null
  } catch (error) {
    console.error('Error retrieving from localStorage:', error)
    return null
  }
}

// Remove data from localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}

// Clear all app-related data from localStorage
export const clearAppStorage = () => {
  const keysToPreserve = [] // Add keys you want to preserve here
  const keysToRemove = Object.keys(localStorage).filter((key) => !keysToPreserve.includes(key))

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })
}

// Check if localStorage is available
export const isStorageAvailable = () => {
  try {
    const testKey = '__test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}
