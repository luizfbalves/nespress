import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleError, type ErrorHandlerOptions } from '../../../src/common/error-handler'

describe('Error Handler', () => {
  let mockRes: any

  beforeEach(() => {
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  describe('handleError with default options', () => {
    it('should send error with status 500 and message when no status code is provided', () => {
      const error = new Error('Test error')
      handleError(error, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
        })
      )
    })

    it('should send error with custom status code if provided', () => {
      const error = new Error('Not found')
      error.statusCode = 404

      handleError(error, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not found',
        })
      )
    })

    it('should include error code in payload when provided', () => {
      const error = new Error('Bad request')
      error.statusCode = 400
      error.code = 'INVALID_INPUT'

      handleError(error, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Bad request',
          code: 'INVALID_INPUT',
        })
      )
    })

    it('should handle null or undefined error gracefully', () => {
      handleError(null, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Erro interno do servidor',
        })
      )
    })

    it('should use default message when error message is not provided', () => {
      const error = { statusCode: 500 }
      handleError(error, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Erro interno do servidor',
        })
      )
    })
  })

  describe('handleError with debug mode', () => {
    it('should include stack trace in development mode when debug is true', () => {
      const error = new Error('Debug error')
      error.statusCode = 500

      handleError(error, mockRes, { debug: true })

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Debug error',
          stack: expect.any(String),
        })
      )
    })

    it('should include stack trace when debug is enabled explicitly', () => {
      const error = new Error('Test error')
      error.statusCode = 400
      error.code = 'ERROR_CODE'

      const options: ErrorHandlerOptions = { debug: true }
      handleError(error, mockRes, options)

      const callArg = mockRes.json.mock.calls[0][0]
      expect(callArg.stack).toBeDefined()
    })

    it('should not include stack trace when debug is false', () => {
      const error = new Error('Test error')
      error.statusCode = 400

      handleError(error, mockRes, { debug: false })

      const callArg = mockRes.json.mock.calls[0][0]
      expect(callArg.stack).toBeUndefined()
    })
  })

  describe('handleError with production mode', () => {
    it('should not include stack trace when NODE_ENV is production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = new Error('Production error')
      error.statusCode = 500

      handleError(error, mockRes)

      const callArg = mockRes.json.mock.calls[0][0]
      expect(callArg.stack).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })

    it('should include stack trace in development when NODE_ENV is not production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Dev error')
      error.statusCode = 500

      handleError(error, mockRes)

      const callArg = mockRes.json.mock.calls[0][0]
      expect(callArg.stack).toBeDefined()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('handleError with various error codes', () => {
    it('should not include code property when code is undefined', () => {
      const error = new Error('Test error')
      error.statusCode = 400
      error.code = undefined

      handleError(error, mockRes)

      const callArg = mockRes.json.mock.calls[0][0]
      expect(callArg.code).toBeUndefined()
    })

    it('should include numeric error codes', () => {
      const error = new Error('Error')
      error.statusCode = 400
      error.code = 1001

      handleError(error, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 1001,
        })
      )
    })

    it('should include string error codes', () => {
      const error = new Error('Validation failed')
      error.statusCode = 422
      error.code = 'VALIDATION_ERROR'

      handleError(error, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
        })
      )
    })
  })

  describe('handleError response structure', () => {
    it('should always include message in response', () => {
      const error = new Error('Generic error')
      error.statusCode = 500

      handleError(error, mockRes)

      const callArg = mockRes.json.mock.calls[0][0]
      expect(callArg).toHaveProperty('message')
      expect(typeof callArg.message).toBe('string')
    })

    it('should preserve error properties', () => {
      const error = new Error('Custom error')
      error.statusCode = 403
      error.code = 'FORBIDDEN'
      error.details = 'Access denied'

      handleError(error, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalled()
    })
  })

  describe('handleError status code resolution', () => {
    it('should default to 500 when statusCode is not set', () => {
      const error = new Error('Error without status')
      handleError(error, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
    })

    it('should use statusCode from error object', () => {
      const statusCodes = [400, 401, 403, 404, 500, 502, 503]

      statusCodes.forEach((code) => {
        mockRes.status.mockClear()
        mockRes.json.mockClear()

        const error = new Error(`Error ${code}`)
        error.statusCode = code

        handleError(error, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(code)
      })
    })
  })
})
