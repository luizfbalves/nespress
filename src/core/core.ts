import { log } from '@/common'
import express, { type Request, type Response } from 'express'

import type { QueryParams, RouteMetadataProps } from '../global'

class NespressCore {
  private expressInstance = express()
  private controllers: Function[]
  public registered = false

  constructor(controllers: Function[] = []) {
    this.expressInstance.use(express.json())
    this.expressInstance.use(express.text())
    this.expressInstance.use(express.urlencoded({ extended: true }))
    this.expressInstance.set('Content-Type', 'application/json')
    this.controllers = controllers
    this.registerControllers()
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

      log({ message: `REGISTERING CONTROLLER ROUTES => {${controller.name}}...` })
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
        const params = this.buildParams(controller, handler, request, response)
        const result = await handler.call(controller, ...params)
        response.json(result)
      } catch (error: any) {
        //TODO melhorar exibição de erro, deixar o codigo mais dinamico
        response.status(500).json({
          message: 'Internal Server Error',
          error: error.message || error,
        })
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
}

export { NespressCore }
