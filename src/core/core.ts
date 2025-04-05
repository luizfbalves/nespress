import { log } from '@/common'
import express, { type Request, type Response } from 'express'

import { resolveDependencies } from '../decorators/inject.decorator'
import type { QueryParams, RouteMetadataProps } from '../global'
import { container } from './inversify'

// Interface para plugins
interface NespressPlugin {
  register: (app: express.Application) => void
  name: string
}

class NespressCore {
  private expressInstance = express()
  private controllers: Function[]
  public registered = false
  private globalMiddlewares: any[] = []
  private plugins: NespressPlugin[] = []

  constructor(controllers: Function[] = []) {
    this.expressInstance.use(express.json())
    this.expressInstance.use(express.text())
    this.expressInstance.use(express.urlencoded({ extended: true }))
    this.expressInstance.set('Content-Type', 'application/json')
    this.controllers = controllers
    this.registerControllers()

    // Aplicar middlewares globais
    this.globalMiddlewares.forEach((middleware) => {
      this.expressInstance.use(middleware)
    })

    // Adicionar headers de segurança
    this.expressInstance.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.setHeader('X-Frame-Options', 'DENY')
      next()
    })

    // Adicionar middleware de monitoramento
    this.enablePerformanceMonitoring()
  }

  get app() {
    return this.expressInstance
  }

  /**
   * Registers routes for each controller. the classes should have the CONTROLLER decorator.
   *
   * @param controllers - An array of controller classes to register routes from.
   */
  registerControllers() {
    if (!this.controllers || this.controllers.length === 0) {
      throw new Error('No controllers found! Please register at least one controller.')
    }

    this.controllers.forEach((controller) => {
      const routes: RouteMetadataProps[] = Reflect.getMetadata('routes:metadata', controller) || []
      routes.forEach((route) => {
        this.registerRoute(controller, route)
      })
    })
    this.registered = true
  }

  private registerRoute(controller: Function, route: RouteMetadataProps) {
    const { method, path, handler } = route

    this.expressInstance[method](path, async (request: Request, response: Response) => {
      try {
        // Obter a instância do controller do container de injeção de dependências
        let controllerInstance

        // Se o controller está registrado no container, use-o
        if (container.isBound(controller)) {
          controllerInstance = container.get(controller)
        } else {
          // Caso não esteja, use o resolveDependencies
          controllerInstance = resolveDependencies(controller)
        }

        const params = this.buildParams(controller, handler, request, response)
        const result = await handler.call(controllerInstance, ...params)
        response.json(result)
      } catch (error: any) {
        const statusCode = error.statusCode || 500
        const errorResponse = {
          message: error.message || 'Erro interno do servidor',
          code: error.code,
          stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        }
        response.status(statusCode).json(errorResponse)
      }
    })
    log({ type: 'warning', message: `${method.toUpperCase()} => ${path}` })
  }

  private buildParams(controller: Function, handler: Function, request: Request, response: Response) {
    const params: any[] = []
    const queryMetadata: QueryParams[] = Reflect.getMetadata('query:metadata', controller, handler.name) || []
    const bodyMetadata: number[] = Reflect.getMetadata('body:metadata', controller, handler.name) || []
    const requestMetadata: number[] = Reflect.getMetadata('request:metadata', controller, handler.name) || []
    const responseMetadata: number[] = Reflect.getMetadata('response:metadata', controller, handler.name) || []

    this.buildParamsFromMetadata(params, bodyMetadata, request.body)
    this.buildParamsFromMetadata(params, queryMetadata, request.query)
    this.buildParamsFromMetadata(params, requestMetadata, request)
    this.buildParamsFromMetadata(params, responseMetadata, response)

    return params
  }

  private buildParamsFromMetadata(params: any[], metadata: number[] | QueryParams[], value: any) {
    if (metadata.length > 0) {
      for (const item of metadata) {
        if (typeof item === 'number') {
          params[item] = value
        } else {
          const { index, name } = item
          params[index] = name && name in value ? value[name] : value
        }
      }
    }
  }

  /**
   * Initializes the API server and starts listening on the specified port.
   */
  initialize(port: number) {
    this.expressInstance.listen(port, () => {
      log({
        type: 'success',
        message: `Server running on port => ${port}`,
      })
    })
  }

  addMiddleware(middleware: any) {
    this.globalMiddlewares.push(middleware)
    return this
  }

  // Método para gerar documentação
  generateDocs() {
    // Gera documentação Swagger baseada nos metadados dos controllers
    const swaggerDocs = {
      openapi: '3.0.0',
      info: {
        title: 'API gerada pelo Nespress',
        version: '1.0.0',
      },
      paths: {},
    }

    // Percorrer controllers e extrair rotas para documentação
    this.controllers.forEach((controller) => {
      const routes: RouteMetadataProps[] = Reflect.getMetadata('routes:metadata', controller) || []
      // Adicionar rotas ao swagger...
    })

    // Rota para acessar documentação
    this.expressInstance.get('/api-docs', (req, res) => {
      res.json(swaggerDocs)
    })
  }

  // Adicionar middleware de monitoramento
  private enablePerformanceMonitoring() {
    this.expressInstance.use((req, res, next) => {
      const start = Date.now()
      res.on('finish', () => {
        const duration = Date.now() - start
        log({
          message: `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`,
          type: duration > 500 ? 'warning' : 'default',
        })
      })
      next()
    })
  }

  // Método para adicionar plugins
  usePlugin(plugin: NespressPlugin) {
    this.plugins.push(plugin)
    plugin.register(this.expressInstance)
    log({ message: `PLUGIN REGISTRADO => ${plugin.name}` })
    return this
  }
}

export { NespressCore }
