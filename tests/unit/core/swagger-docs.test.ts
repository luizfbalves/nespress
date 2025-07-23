import 'reflect-metadata'
import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const metadataFuncs = {
  defineMetadata: Reflect.defineMetadata,
  getMetadata: Reflect.getMetadata,
  hasMetadata: Reflect.hasMetadata,
}
let Controller: any
let Get: any
let Post: any
let Query: any
let NespressCore: any

let DocsController: any

// manual body metadata registration will be set after controller definition

describe('Swagger docs generation', () => {
  const realReflect = global.Reflect

  beforeAll(() => {
    const vm = require('vm')
    global.Reflect = vm.runInNewContext('Reflect')
    global.Reflect.defineMetadata = metadataFuncs.defineMetadata
    global.Reflect.getMetadata = metadataFuncs.getMetadata
    global.Reflect.hasMetadata = metadataFuncs.hasMetadata
    const decorators = require('@/decorators')
    Controller = decorators.Controller
    Get = decorators.Get
    Post = decorators.Post
    Query = decorators.Query
    NespressCore = require('@/core/core').NespressCore

    @Controller({ path: '/users' })
    class D {
      @Get('')
      list(@Query('page') page: string) {
        return { page }
      }

      @Post('/:id')
      update(body: any) {
        return { body }
      }
    }

    DocsController = D
    Reflect.defineMetadata('body:metadata', [0], DocsController, 'update')
  })

  afterAll(() => {
    const vm = require('vm')
    global.Reflect = vm.runInNewContext('Reflect')
    global.Reflect.defineMetadata = metadataFuncs.defineMetadata
    global.Reflect.getMetadata = metadataFuncs.getMetadata
    global.Reflect.hasMetadata = metadataFuncs.hasMetadata
  })

  it('should expose OpenAPI spec at /api-docs', async () => {
    const core = new NespressCore([DocsController])
    core.generateDocs()

    const res = await request(core.app).get('/api-docs').expect(200)

    expect(res.body.openapi).toBe('3.0.0')
    expect(res.body.paths['/users']).toBeDefined()
    expect(res.body.paths['/users/{id}']).toBeDefined()
    expect(res.body.paths['/users'].get.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ in: 'query', name: 'page' }),
      ])
    )
  })
})
