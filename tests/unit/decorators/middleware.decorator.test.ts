import 'reflect-metadata'
import { describe, expect, it } from 'vitest'
import { Middleware } from '@/decorators/middleware.decorator'

describe('Middleware Decorator', () => {
  it('should register middleware for a method', () => {
    const mw = (_req: any, _res: any, next: any) => next()
    class TestCtrl {
      @Middleware(mw)
      list() {}
    }

    const result = Reflect.getMetadata('middleware:metadata', TestCtrl, 'list')
    expect(result).toBeDefined()
    expect(result.length).toBe(1)
    expect(result[0]).toBe(mw)
  })

  it('should allow multiple middlewares', () => {
    const m1 = (_r: any, _s: any, n: any) => n()
    const m2 = (_r: any, _s: any, n: any) => n()

    class TestCtrl {
      @Middleware(m1)
      @Middleware(m2)
      run() {}
    }

    const result = Reflect.getMetadata('middleware:metadata', TestCtrl, 'run')
    expect(result.length).toBe(2)
    expect(result).toContain(m1)
    expect(result).toContain(m2)
  })
})
