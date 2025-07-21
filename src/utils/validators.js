// Required field validator
export const required = (value) => {
  return !!value || 'This field is required'
}

// Email format validator
export const email = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'Please enter a valid email address'
}

// Minimum length validator
export const minLength = (length) => {
  return (value) => {
    return (value && value.length >= length) || `Must be at least ${length} characters`
  }
}

// Password strength validator
export const strongPassword = (value) => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return (
    pattern.test(value) ||
    'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
  )
}

// Password match validator
export const passwordMatch = (password, confirmPassword) => {
  return password === confirmPassword || 'Passwords do not match'
}

// Number range validator
export const numberRange = (min, max) => {
  return (value) => {
    const num = Number(value)
    return (num >= min && num <= max) || `Must be between ${min} and ${max}`
  }
}

// 添加缺失的验证函数
export const sameAs = (refValue) => (value) => {
  return value === refValue || 'Values must match'
}
