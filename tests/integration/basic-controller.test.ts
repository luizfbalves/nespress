import express from 'express'
import 'reflect-metadata'
import supertest from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

// Simulação básica das classes e decoradores
const metadataMap = new Map()

// Mock para Reflect.metadata
global.Reflect = {
  ...global.Reflect,
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

// Decoradores simulados
function Controller(options: { path: string; version?: number } = { path: '' }) {
  return function (target: any) {
    Reflect.defineMetadata('controller:metadata', options, target)

    // Processar rotas com prefixo
    const routes = Reflect.getMetadata('routes:metadata', target) || []
    let prefix = options.version ? `/v${options.version}` : ''
    const basePath = options.path.startsWith('/') ? options.path.slice(1) : options.path
    prefix += `/${basePath}`

    const prefixedRoutes = routes.map((route: any) => {
      const routePath = route.path.startsWith('/') ? route.path.slice(1) : route.path
      return {
        ...route,
        path: prefix + `${routePath ? '/' + routePath : ''}`,
      }
    })

    Reflect.defineMetadata('routes:metadata', prefixedRoutes, target)
  }
}

function createMethodDecorator(method: string) {
  return (path: string = '') => {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const routes = Reflect.getMetadata('routes:metadata', target.constructor) || []
      routes.push({
        method,
        path,
        handler: descriptor.value,
        propertyKey,
      })
      Reflect.defineMetadata('routes:metadata', routes, target.constructor)
      return descriptor
    }
  }
}

const Get = createMethodDecorator('get')
const Post = createMethodDecorator('post')

function BODY(target: any, propertyKey: string, parameterIndex: number) {
  const bodyParams = Reflect.getMetadata('body:metadata', target.constructor, propertyKey) || []
  bodyParams.push(parameterIndex)
  Reflect.defineMetadata('body:metadata', bodyParams, target.constructor, propertyKey)
}

// Simulação básica do Core
class MockNespressCore {
  private app = express()
  private controllers: any[] = []

  constructor(controllers: any[]) {
    this.controllers = controllers
    this.app.use(express.json())
    this.registerControllers()
  }

  private registerControllers() {
    this.controllers.forEach((controller) => {
      const routes = Reflect.getMetadata('routes:metadata', controller) || []
      const instance = new controller()

      routes.forEach((route: any) => {
        const { method, path, handler, propertyKey } = route

        // Pegar parâmetros do body
        const bodyParams = Reflect.getMetadata('body:metadata', controller, propertyKey) || []

        ;(this.app as any)[method](path, async (req: any, res: any) => {
          try {
            // Constrói os argumentos para o handler
            const args: any[] = []

            // Adiciona o body nas posições corretas
            bodyParams.forEach((index: number) => {
              args[index] = req.body
            })

            // Executa o handler
            const result = await handler.apply(instance, args)
            res.json(result)
          } catch (error: any) {
            res.status(500).json({ error: error.message })
          }
        })
      })
    })
  }

  get expressApp() {
    return this.app
  }
}

// Teste de integração
describe('Integração básica de controladores', () => {
  let app: any

  beforeEach(() => {
    metadataMap.clear()
  })

  it('deve registrar e responder a rotas básicas', async () => {
    // Criar controlador de teste
    @Controller({ path: '/api', version: 1 })
    class TesteController {
      @Get('/hello')
      hello() {
        return { message: 'Hello World!' }
      }

      @Post('/echo')
      echo(@BODY body: any) {
        return { echoed: body }
      }
    }

    // Inicializar app
    const core = new MockNespressCore([TesteController])
    app = core.expressApp

    // Testar rota GET
    const response1 = await supertest(app).get('/v1/api/hello').expect(200)

    expect(response1.body).toEqual({ message: 'Hello World!' })

    // Testar rota POST
    const testData = { name: 'João', age: 30 }
    const response2 = await supertest(app).post('/v1/api/echo').send(testData).expect(200)

    expect(response2.body).toEqual({ echoed: testData })
  })

  it('deve suportar múltiplos controladores', async () => {
    @Controller({ path: '/users' })
    class UserController {
      @Get()
      getAll() {
        return { users: ['User1', 'User2'] }
      }
    }

    @Controller({ path: '/products' })
    class ProductController {
      @Get()
      getAll() {
        return { products: ['Product1', 'Product2'] }
      }
    }

    // Inicializar app com múltiplos controladores
    const core = new MockNespressCore([UserController, ProductController])
    app = core.expressApp

    // Testar primeiro controlador
    const usersResponse = await supertest(app).get('/users').expect(200)

    expect(usersResponse.body).toEqual({ users: ['User1', 'User2'] })

    // Testar segundo controlador
    const productsResponse = await supertest(app).get('/products').expect(200)

    expect(productsResponse.body).toEqual({ products: ['Product1', 'Product2'] })
  })
})
