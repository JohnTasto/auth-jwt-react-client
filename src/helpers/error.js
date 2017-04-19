import ExtendableError from 'es6-error'

export const AuthenticationError = class AuthenticationError extends ExtendableError {
  constructor(message = 'Not authenticated') {
    super(message)
  }
}

export const NetworkError = class NetworkError extends ExtendableError {
  constructor(message = 'Network error') {
    super(message)
  }
}
