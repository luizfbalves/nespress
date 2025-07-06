import { describe, it, expect, vi, afterEach } from 'vitest'
import { log } from '../../../src/common'

// Preserve PID for assertion
const pid = process.pid

describe('log utility', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should prepend pid and date on success log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log({ type: 'success', message: 'works' })

    const [[firstArg, secondArg]] = spy.mock.calls
    const regex = new RegExp(`\\x1b\\[37m\\[${pid}\\] - \\[.+\\]\\x1b\\[0m`)
    expect(firstArg).toMatch(regex)
    expect(secondArg).toBe('works')
  })

  it('should stringify non-string messages', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    log({ message: { ok: true } })

    const [[firstArg]] = spy.mock.calls
    const regex = new RegExp(`\\x1b\\[37m\\[${pid}\\] - \\[.+\\]\\x1b\\[0m`)
    expect(firstArg).toMatch(regex)
    expect(firstArg.endsWith(' {"ok":true}')).toBe(true)
  })
})
