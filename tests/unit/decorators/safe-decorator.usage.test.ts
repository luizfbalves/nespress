import 'reflect-metadata'
import { describe, it, expect } from 'vitest'
import { safeDecorator } from '../../../src/decorators/safe-decorator'

describe('safeDecorator utility', () => {
  it('should execute decorator function without throwing', () => {
    const decoratorFn = (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      Reflect.defineMetadata('test:metadata', true, target)
    }

    const safeDecoratorFn = safeDecorator(decoratorFn)

    class TestClass {
      testMethod() {}
    }

    expect(() => {
      safeDecoratorFn(TestClass.prototype, 'testMethod', 0)
    }).not.toThrow()
  })

  it('should preserve decorator behavior', () => {
    const decoratorFn = (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      const meta: any[] = Reflect.getMetadata('items', target.constructor, propertyKey) || []
      meta.push(parameterIndex)
      Reflect.defineMetadata('items', meta, target.constructor, propertyKey)
    }

    const safeDecoratorFn = safeDecorator(decoratorFn)

    class TestClass {
      method1(@safeDecoratorFn param1: any) {}
      method2(@safeDecoratorFn param1: any, @safeDecoratorFn param2: any) {}
    }

    const meta1 = Reflect.getMetadata('items', TestClass, 'method1')
    const meta2 = Reflect.getMetadata('items', TestClass, 'method2')

    expect(meta1).toBeDefined()
    expect(meta2).toBeDefined()
  })
})
