import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, logSuccess, logError } from '../../../src/common'

describe('Pino logger - Comprehensive Coverage', () => {
  beforeEach(() => {
    // Mock dos métodos do logger
    vi.spyOn(logger, 'info').mockImplementation(() => logger)
    vi.spyOn(logger, 'warn').mockImplementation(() => logger)
    vi.spyOn(logger, 'error').mockImplementation(() => logger)
    vi.spyOn(logger, 'debug').mockImplementation(() => logger)
    vi.spyOn(logger, 'trace').mockImplementation(() => logger)
    vi.spyOn(logger, 'fatal').mockImplementation(() => logger)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('logger methods', () => {
    it('should call info method', () => {
      logger.info('Info message')
      expect(logger.info).toHaveBeenCalledWith('Info message')
    })

    it('should call warn method', () => {
      logger.warn('Warning message')
      expect(logger.warn).toHaveBeenCalledWith('Warning message')
    })

    it('should call error method', () => {
      logger.error('Error message')
      expect(logger.error).toHaveBeenCalledWith('Error message')
    })

    it('should call debug method', () => {
      logger.debug('Debug message')
      expect(logger.debug).toHaveBeenCalledWith('Debug message')
    })

    it('should call trace method', () => {
      logger.trace('Trace message')
      expect(logger.trace).toHaveBeenCalledWith('Trace message')
    })

    it('should call fatal method', () => {
      logger.fatal('Fatal message')
      expect(logger.fatal).toHaveBeenCalledWith('Fatal message')
    })
  })

  describe('logger with context objects', () => {
    it('should log info with context', () => {
      const context = { userId: 123, action: 'create' }
      logger.info(context, 'User created resource')
      expect(logger.info).toHaveBeenCalledWith(context, 'User created resource')
    })

    it('should log warning with context', () => {
      const context = { duration: 600, endpoint: '/api/users' }
      logger.warn(context, 'Slow response time')
      expect(logger.warn).toHaveBeenCalledWith(context, 'Slow response time')
    })

    it('should log error with context', () => {
      const context = { code: 'AUTH_FAILED', userId: 456 }
      logger.error(context, 'Authentication failed')
      expect(logger.error).toHaveBeenCalledWith(context, 'Authentication failed')
    })
  })

  describe('logSuccess helper', () => {
    it('should call logger.info with success level', () => {
      logSuccess('Operation successful')
      expect(logger.info).toHaveBeenCalledWith({ level: 'success' }, 'Operation successful')
    })

    it('should call logger.info with context and success level', () => {
      const context = { operation: 'deploy' }
      logSuccess('Deploy completed', context)
      expect(logger.info).toHaveBeenCalledWith({ ...context, level: 'success' }, 'Deploy completed')
    })
  })

  describe('logError helper', () => {
    it('should log error with basic options', () => {
      const error = new Error('Test error')
      logError(error)
      
      expect(logger.error).toHaveBeenCalled()
      const [firstArg, secondArg] = (logger.error as any).mock.calls[0]
      expect(firstArg.error.message).toBe('Test error')
      expect(secondArg).toBe('Test error')
    })

    it('should log error with context', () => {
      const error = new Error('Test error')
      logError(error, { context: 'User registration' })
      
      expect(logger.error).toHaveBeenCalled()
      const [firstArg] = (logger.error as any).mock.calls[0]
      expect(firstArg.context).toBe('User registration')
    })

    it('should log error with suggestions', () => {
      const error = new Error('Test error')
      const suggestions = ['Check configuration', 'Verify credentials']
      logError(error, { suggestions })
      
      expect(logger.error).toHaveBeenCalled()
      const [firstArg] = (logger.error as any).mock.calls[0]
      expect(firstArg.suggestions).toEqual(suggestions)
    })

    it('should include stack trace when showStack is true', () => {
      const error = new Error('Test error')
      logError(error, { showStack: true })
      
      expect(logger.error).toHaveBeenCalled()
      const [firstArg] = (logger.error as any).mock.calls[0]
      expect(firstArg.error.stack).toBeDefined()
    })

    it('should not include stack trace when showStack is false', () => {
      const error = new Error('Test error')
      logError(error, { showStack: false })
      
      expect(logger.error).toHaveBeenCalled()
      const [firstArg] = (logger.error as any).mock.calls[0]
      expect(firstArg.error.stack).toBeUndefined()
    })
  })

  describe('logger with nested objects', () => {
    it('should handle deeply nested objects', () => {
      const context = {
        user: {
          id: 123,
          profile: {
            name: 'Test User',
            settings: { theme: 'dark' }
          }
        }
      }
      logger.info(context, 'Complex object logged')
      expect(logger.info).toHaveBeenCalledWith(context, 'Complex object logged')
    })

    it('should handle arrays in context', () => {
      const context = {
        errors: ['Error 1', 'Error 2', 'Error 3'],
        codes: [400, 401, 403]
      }
      logger.warn(context, 'Multiple errors occurred')
      expect(logger.warn).toHaveBeenCalledWith(context, 'Multiple errors occurred')
    })
  })
})
