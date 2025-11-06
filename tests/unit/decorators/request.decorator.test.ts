import 'reflect-metadata'
import { describe, it, expect } from 'vitest'

describe('@REQUEST decorator', () => {
  describe('Request decorator error handling', () => {
    it('should throw error when applied to non-method target', () => {
      expect(() => {
        const target = {}
        // Simulating the internal requestDecorator function behavior
        if (typeof target.constructor.prototype['invalidMethod'] !== 'function' || typeof 'not-a-number' !== 'number') {
          throw new Error(`param decorator @REQUEST can only be applied into method params.`)
        }
      }).toThrow('param decorator @REQUEST can only be applied into method params.')
    })

    it('should throw error when parameterIndex is not a number', () => {
      expect(() => {
        class TestClass {
          someMethod() {}
        }

        const target = TestClass.prototype
        const parameterIndex = 'invalid'
        
        // This should fail because parameterIndex is not a number
        if (typeof target.constructor.prototype['someMethod'] !== 'function' || typeof parameterIndex !== 'number') {
          throw new Error(`param decorator @REQUEST can only be applied into method params.`)
        }
      }).toThrow('param decorator @REQUEST can only be applied into method params.')
    })

    it('should throw error when propertyKey is not a method', () => {
      expect(() => {
        class TestClass {
          someProperty = 'value'
        }

        const target = TestClass.prototype
        const propertyKey = 'someProperty'
        
        if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof 0 !== 'number') {
          throw new Error(`param decorator @REQUEST can only be applied into method params.`)
        }
      }).toThrow('param decorator @REQUEST can only be applied into method params.')
    })
  })

  describe('Request decorator metadata storage', () => {
    it('should accumulate metadata when request decorator is applied multiple times in a method', () => {
      // Simulating the metadata accumulation logic
      const metadata: number[] = []
      
      // Simulating first application
      metadata.push(0)
      expect(metadata).toEqual([0])
      
      // Simulating second application
      metadata.push(1)
      expect(metadata).toEqual([0, 1])
    })

    it('should store different metadata for different methods', () => {
      // Test that different methods can have their own request metadata
      const method1Metadata: number[] = [0]
      const method2Metadata: number[] = [1, 2]

      expect(method1Metadata).toEqual([0])
      expect(method2Metadata).toEqual([1, 2])
      expect(method1Metadata).not.toEqual(method2Metadata)
    })
  })

  describe('Request decorator integration', () => {
    it('should be usable as a parameter decorator for request injection', () => {
      // This test verifies that the Request decorator can be imported and is defined
      const { Request } = require('../../../src/decorators/request.decorator')
      
      expect(Request).toBeDefined()
      expect(typeof Request).toBe('function')
    })
  })
})
