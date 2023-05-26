import CustomAPIError from './custom-api.js'
import { StatusCodes } from 'http-status-codes'

class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.FORBIDDEN
  }
}

export default UnauthorizedError
