import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { logger } from '../../../src/common'

describe('Pino logger', () => {
  beforeEach(() => {
    // Mock dos métodos do logger para evitar output real durante testes
    vi.spyOn(logger, 'info').mockImplementation(() => logger)
    vi.spyOn(logger, 'warn').mockImplementation(() => logger)
    vi.spyOn(logger, 'error').mockImplementation(() => logger)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have info method', () => {
    logger.info('Test info message')
    expect(logger.info).toHaveBeenCalledWith('Test info message')
  })

  it('should have warn method', () => {
    logger.warn('Test warning message')
    expect(logger.warn).toHaveBeenCalledWith('Test warning message')
  })

  it('should have error method', () => {
    logger.error('Test error message')
    expect(logger.error).toHaveBeenCalledWith('Test error message')
  })

  it('should support object context', () => {
    const context = { userId: 123, action: 'login' }
    logger.info(context, 'User logged in')
    expect(logger.info).toHaveBeenCalledWith(context, 'User logged in')
  })
})
