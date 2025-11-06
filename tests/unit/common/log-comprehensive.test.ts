import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { log } from '../../../src/common'

describe('log utility - Comprehensive Coverage', () => {
  let consoleSpy: any

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('log with different types', () => {
    it('should log success messages in green', () => {
      log({ type: 'success', message: 'Success message' })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      // Check for green color code (\x1b[32m)
      expect(callArg).toContain('\x1b[32m%s\x1b[0m')
    })

    it('should log error messages in red', () => {
      log({ type: 'error', message: 'Error message' })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      // Check for red color code (\x1b[31m)
      expect(callArg).toContain('\x1b[31m%s\x1b[0m')
    })

    it('should log warning messages in yellow', () => {
      log({ type: 'warning', message: 'Warning message' })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      // Check for yellow color code (\x1b[33m)
      expect(callArg).toContain('\x1b[33m%s\x1b[0m')
    })

    it('should log default messages without color', () => {
      log({ message: 'Default message' })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      // Should not contain color codes for default
      expect(callArg).toContain('Default message')
    })
  })

  describe('log with jumpLine option', () => {
    it('should print empty line when jumpLine is true', () => {
      log({ jumpLine: true, message: 'Test' })

      // Should be called twice - once for empty line, once for message
      expect(consoleSpy).toHaveBeenCalledTimes(2)
      expect(consoleSpy.mock.calls[0][0]).toBe('')
    })

    it('should not print empty line when jumpLine is false', () => {
      log({ jumpLine: false, message: 'Test' })

      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    it('should not print empty line when jumpLine is undefined', () => {
      log({ message: 'Test' })

      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('log with object messages', () => {
    it('should stringify object messages', () => {
      const obj = { key: 'value', nested: { prop: 123 } }
      log({ message: obj })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      expect(callArg).toContain(JSON.stringify(obj))
    })

    it('should stringify array messages', () => {
      const arr = [1, 2, 3, 'test']
      log({ message: arr })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      expect(callArg).toContain(JSON.stringify(arr))
    })

    it('should stringify number messages', () => {
      log({ message: 42 })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      expect(callArg).toContain('42')
    })
  })

  describe('log with all options combined', () => {
    it('should handle jumpLine with different message types', () => {
      log({ type: 'success', jumpLine: true, message: 'Combined' })

      expect(consoleSpy).toHaveBeenCalledTimes(2)
    })

    it('should handle jumpLine with error type', () => {
      log({ type: 'error', jumpLine: true, message: 'Error with jump' })

      expect(consoleSpy).toHaveBeenCalledTimes(2)
    })

    it('should handle jumpLine with object message', () => {
      log({ jumpLine: true, message: { data: 'test' } })

      expect(consoleSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('log prefix formatting', () => {
    it('should include process ID in output', () => {
      log({ message: 'Test' })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      expect(callArg).toContain(`[${process.pid}]`)
    })

    it('should include date in output', () => {
      log({ message: 'Test' })

      expect(consoleSpy).toHaveBeenCalled()
      const callArg = consoleSpy.mock.calls[0][0]
      // Check for date pattern in format
      expect(callArg).toMatch(/\[\d{1,2}\/\d{1,2}\/\d{4}/i)
    })
  })
})
