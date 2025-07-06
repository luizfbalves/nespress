import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import { Body } from '@/decorators/body.decorator'

// helper to apply Body using decorator syntax

describe('Body decorator validation', () => {
  it('should throw when used outside a controller', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      class TestClass {
        method(@Body body: any) {}
      }
      // create an instance to avoid unused variable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const t = new TestClass()
    }).not.toThrow()

    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(errorSpy.mock.calls[0][0]).toContain('@BODY can only be used within classes decorated with @Controller.')

    exitSpy.mockRestore()
    errorSpy.mockRestore()
  })

})
