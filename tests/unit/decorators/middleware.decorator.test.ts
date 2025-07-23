import 'reflect-metadata'
import { beforeEach, describe, expect, it } from 'vitest'
import { Middleware } from '@/decorators/middleware.decorator'

// isolated metadata map similar to other decorator tests
const metadataMap = new Map()
const originalReflect = global.Reflect
global.Reflect = {
  ...originalReflect,
  defineMetadata: (key: string, value: any, target: any, propertyKey?: string | symbol) => {
    const targetKey = `${key}-${target.name || 'anonymous'}-${String(propertyKey || '')}`
    metadataMap.set(targetKey, value)
    return target
  },
  getMetadata: (key: string, target: any, propertyKey?: string | symbol) => {
    const targetKey = `${key}-${target.name || 'anonymous'}-${String(propertyKey || '')}`
    return metadataMap.get(targetKey)
  },
  hasMetadata: () => true,
}

beforeEach(() => {
  metadataMap.clear()
})

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
