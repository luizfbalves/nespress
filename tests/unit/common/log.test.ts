import { describe, it, expect, vi } from 'vitest'
import { log } from '@/common'

describe('log utility', () => {
  it('should prefix messages with timestamp and pid', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    log({ type: 'success', message: 'Test message' })

    expect(spy).toHaveBeenCalled()
    const [firstArg, secondArg] = spy.mock.calls[0]
    const regex = new RegExp(`^\\x1b\\[37m\\[${process.pid}\\] - \\[.+\\]\\x1b\\[0m \\x1b\\[32m%s\\x1b\\[0m$`)
    expect(firstArg).toMatch(regex)
    expect(secondArg).toBe('Test message')

    spy.mockRestore()
  })
})
