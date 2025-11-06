import 'reflect-metadata'
import { describe, it, expect } from 'vitest'
import { Body } from '../../../src/decorators/body.decorator'
import { Get, Post, Put, Delete, Patch } from '../../../src/decorators/verbs.decorator'

describe('Body Decorator Additional Coverage', () => {
  it('should be available as a parameter decorator', () => {
    expect(Body).toBeDefined()
    expect(typeof Body).toBe('function')
  })
})

describe('HTTP Verbs Decorators Extended Coverage', () => {
  describe('Supported HTTP methods', () => {
    it('should support all standard HTTP methods', () => {
      class StandardMethodsController {
        @Get('/resource')
        get() {
          return {}
        }

        @Post('/resource')
        post() {
          return {}
        }

        @Put('/resource')
        put() {
          return {}
        }

        @Delete('/resource')
        delete() {
          return {}
        }

        @Patch('/resource')
        patch() {
          return {}
        }
      }

      const routes = Reflect.getMetadata('routes:metadata', StandardMethodsController)
      expect(routes).toBeDefined()
      expect(routes?.length).toBe(5)

      const methods = routes?.map((r: any) => r.method)
      expect(methods).toContain('get')
      expect(methods).toContain('post')
      expect(methods).toContain('put')
      expect(methods).toContain('delete')
      expect(methods).toContain('patch')
    })
  })

  describe('HTTP methods with various path formats', () => {
    it('should register routes with different path formats', () => {
      class PathFormatController {
        @Get('/')
        root() {
          return {}
        }

        @Post('/users')
        createUser() {
          return {}
        }

        @Put('/users/:id')
        updateUser() {
          return {}
        }

        @Delete('/users/:id')
        deleteUser() {
          return {}
        }

        @Patch('/users/:id/status')
        patchUserStatus() {
          return {}
        }
      }

      const routes = Reflect.getMetadata('routes:metadata', PathFormatController)
      expect(routes).toBeDefined()
      expect(routes?.length).toBe(5)

      const paths = routes?.map((r: any) => r.path)
      expect(paths).toContain('/')
      expect(paths).toContain('/users')
      expect(paths).toContain('/users/:id')
      expect(paths).toContain('/users/:id/status')
    })
  })

  describe('HTTP methods with various paths', () => {
    it('should handle paths with leading and trailing slashes', () => {
      class PathController {
        @Get('/')
        root() {
          return {}
        }

        @Get('/api')
        api() {
          return {}
        }

        @Get('/api/')
        apiTrailing() {
          return {}
        }

        @Post('api/v1/users')
        createUser() {
          return {}
        }
      }

      const routes = Reflect.getMetadata('routes:metadata', PathController)
      expect(routes).toBeDefined()
      expect(routes?.length).toBe(4)
    })
  })

  describe('HTTP methods integration', () => {
    it('should register multiple routes of different methods on same controller', () => {
      class MultiMethodController {
        @Get('/items')
        listItems() {
          return []
        }

        @Post('/items')
        createItem() {
          return {}
        }

        @Put('/items/:id')
        updateItem() {
          return {}
        }

        @Delete('/items/:id')
        deleteItem() {
          return {}
        }

        @Patch('/items/:id')
        patchItem() {
          return {}
        }
      }

      const routes = Reflect.getMetadata('routes:metadata', MultiMethodController)
      expect(routes).toBeDefined()
      expect(routes?.length).toBe(5)

      const methods = routes?.map((r: any) => r.method)
      expect(methods).toContain('get')
      expect(methods).toContain('post')
      expect(methods).toContain('put')
      expect(methods).toContain('delete')
      expect(methods).toContain('patch')
    })
  })
})
