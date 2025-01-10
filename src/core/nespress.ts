import { log } from '@/common'
import express, { type Request, type Response } from 'express'

import type { RouteMetadataProps } from '../global'
const nespress = express()

nespress.use(express.json())
nespress.use(express.text())
nespress.use(express.urlencoded({ extended: true }))

/**
 * Registers routes for each controller. the classes should have the CONTROLLER decorator.
 *
 * @param controllers - An array of controller classes to register routes from.
 */
function registerControllers(controllers: any[]) {
  if (!controllers || controllers.length === 0) {
    throw new Error('No controllers found! Please register at least one controller.')
  }

  for (const controller of controllers) {
    const routes: RouteMetadataProps[] = Reflect.getMetadata('routes:metadata', controller) || []

    log({ message: `REGISTERING CONTROLLER ROUTES => {${controller.name}}...` })
    if (routes) {
      for (const route of routes) {
        const { method, path, handler } = route

        nespress[method](path, async (req: Request, res: Response) => {
          try {
            const body: number[] = Reflect.getMetadata('body:metadata', controller, handler.name) || []
            const params: any[] = []

            if (body.length > 0) {
              for (const index of body) {
                params[index] = req.body
              }
            }

            const result = await handler.call(controller, ...params)
            res.json(result)
          } catch (error: any) {
            //TODO melhorar exibição de erro, deixar o codigo mais dinamico
            res.status(500).json({
              message: 'Internal Server Error',
              error: error.message || error,
            })
          }
        })
        log({ type: 'warning', message: `${method.toUpperCase()} => ${path}` })
      }
    }
  }
}

/**
 * Initializes the API server and starts listening on the specified port.
 */
function initialize(port: number) {
  nespress.listen(port, () => {
    log({
      type: 'success',
      message: `Server running on port => ${port}`,
    })
  })
}

export { initialize, nespress, registerControllers }
