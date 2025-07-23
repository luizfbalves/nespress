import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import { Param } from '@/decorators/param.decorator'

describe('Param decorator', () => {
  it('should register metadata for parameters', () => {
    class TestController {
      method(@Param('id') id: string) {
        return id
      }
    }

    const metadata = Reflect.getMetadata('param:metadata', TestController, 'method')
    expect(metadata).toBeDefined()
    expect(metadata.length).toBe(1)
    expect(metadata[0].index).toBe(0)
    expect(metadata[0].name).toBe('id')
  })

  it('should fail when used outside a method', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    class Wrong {}
    // @ts-expect-error testing wrong usage
    Param()(Wrong.prototype, 'prop', 0)

    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(errorSpy.mock.calls[0][0]).toContain('param decorator @PARAM can only be applied into method params.')

    exitSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
