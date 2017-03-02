export const requiredValidator = value =>
  value
    ? undefined
    : 'Required'

export const minLengthValidator = min =>
  value =>
    value && value.length < min
      ? `Must be ${min} characters or more`
      : undefined

export const maxLengthValidator = max =>
  value =>
    value && value.length > max
      ? `Must be ${max} characters or less`
      : undefined

export const numberValidator = value =>
  value && isNaN(Number(value))
    ? 'Must be a number'
    : undefined

export const emailValidator = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined

export const containNumberValidator = value =>
  value && !/[0-9]/.test(value)
    ? 'Must contain at least one number'
    : undefined

export const containLowercaseValidator = value =>
  value && !/[a-z]/.test(value)
    ? 'Must contain at least one lowercase letter'
    : undefined

export const containUppercaseValidator = value =>
  value && !/[A-Z]/.test(value)
    ? 'Must contain at least one uppercase letter'
    : undefined

export const passwordValidator = value =>
  value && !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(value)
    ? 'Must contain at least eight characters, and at least one lowercase letter, one uppercase letter, and one number'
    : undefined
