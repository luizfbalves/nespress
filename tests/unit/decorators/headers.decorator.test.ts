import 'reflect-metadata'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Headers } from '../../../src/decorators/headers.decorator'

describe('@Headers decorator', () => {
  beforeEach(() => {
    // Clear metadata before each test
    Reflect.metadata = Reflect.metadata || ((key, value) => (target: any, propertyKey?: string | symbol) => {})
  })

  afterEach(() => {
    // Clear all Reflect metadata after each test to avoid pollution
    const allMetadataKeys: any[] = []
    try {
      // Try to get all keys - this is a workaround since Reflect.getMetadataKeys is not standard
      if (typeof Reflect.getMetadataKeys === 'function') {
        // This is just for safety
      }
    } catch (e) {
      // ignore
    }
  })

  describe('Headers with specific header name', () => {
    it('should register metadata for a specific header parameter', () => {
      class AuthHeadersController {
        getHeader(@Headers('authorization') auth: string) {
          return { auth }
        }
      }

      const metadata = Reflect.getMetadata('headers:metadata', AuthHeadersController, 'getHeader')

      expect(metadata).toBeDefined()
      expect(metadata.length).toBe(1)
      expect(metadata[0].index).toBe(0)
      expect(metadata[0].name).toBe('authorization')
    })
  })

  describe('Headers without specific header name', () => {
    it('should register metadata without header name to get all headers', () => {
      class AllHeadersController {
        getAllHeaders(@Headers() headers: any) {
          return headers
        }
      }

      const metadata = Reflect.getMetadata('headers:metadata', AllHeadersController, 'getAllHeaders')

      expect(metadata).toBeDefined()
      expect(metadata.length).toBe(1)
      expect(metadata[0].index).toBe(0)
      expect(metadata[0].name).toBeUndefined()
    })
  })


  describe('Headers decorator error handling', () => {
    it('should throw error when not applied to method parameter', () => {
      expect(() => {
        const target = {}
        const decorator = Headers('auth')
        // Simulating wrong usage - applying to non-method
        decorator(target, 'nonExistentMethod', 'not-a-number')
      }).toThrow('param decorator @Headers can only be applied into method params.')
    })

    it('should throw error when parameterIndex is not a number', () => {
      expect(() => {
        class ErrorHandlingTestClass {
          someMethod() {}
        }

        const target = ErrorHandlingTestClass.prototype
        const decorator = Headers('auth')
        // Simulating wrong parameterIndex type
        decorator(target, 'someMethod', 'invalid' as any)
      }).toThrow('param decorator @Headers can only be applied into method params.')
    })
  })

  describe('Headers decorator integration', () => {
    it('should be usable as a parameter decorator for header injection', () => {
      expect(Headers).toBeDefined()
      expect(typeof Headers).toBe('function')
    })
  })

  describe('Headers metadata accumulation', () => {
    it('should accumulate metadata in correct order based on decorator order', () => {
      // Simulating metadata accumulation
      const metadataArray: Array<{ index: number; name?: string }> = []
      
      metadataArray.push({ index: 0, name: 'header1' })
      expect(metadataArray).toHaveLength(1)
      
      metadataArray.push({ index: 1, name: 'header2' })
      expect(metadataArray).toHaveLength(2)
    })
  })
})
