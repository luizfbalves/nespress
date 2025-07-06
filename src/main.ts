import 'reflect-metadata'
import type { NesPressConfigParams } from './global'

import { log } from './common'
import { NespressCore } from './core'
import { container } from './core/inversify'

/**
 *
 * NESPRESS
 * ========
 *
 * Nespress is a wrapper around Express that allows you to use decorators to define routes.
 * It also provides a simple way to register controllers and their routes. It is designed to be easy to use and to provide a simple way to create RESTful APIs.
 *
 * @example
 * import { Nespress } from '@luizfbalves/nespress'
 *
 * const nespress = new Nespress({
 *   controllers: [UsersController],
 *   providers: [UserService]
 * })
 *
 * nespress.start()
 */
class Nespress {
  private core: NespressCore

  /**
   * Constructor
   * @param props - Configuration options
   * @param props.controllers - An array of controllers to register. Each controller should have the CONTROLLER decorator.
   * @param props.providers - An array of providers (services) to register for dependency injection.
   */
  constructor(props: NesPressConfigParams) {
    const { controllers, providers = [] } = props

    // Registra os providers no container
    this.registerProviders(providers)

    // Registra os controllers no container e obtém apenas os válidos
    const validControllers = this.registerControllers(controllers)

    // Inicializa o core com os controllers válidos
    this.core = new NespressCore(validControllers)
  }

  /**
   * Registra os providers no container de injeção de dependências
   * @param providers - Array de classes providers
   */
  private registerProviders(providers: any[]) {
    providers.forEach((provider) => {
      if (!Reflect.hasMetadata('injectable:metadata', provider)) {
        log({
          type: 'warning',
          message: `Provider ${provider.name} não possui o decorador @Injectable(). Isso pode causar problemas.`,
        })
      }

      // Registra o provider no container
      if (!container.isBound(provider)) {
        container.bind(provider).toSelf()
        log({ message: `REGISTRANDO PROVIDER => {${provider.name}}...` })
      }
    })
  }

  /**
   * Registra os controllers no container de injeção de dependências
   * @param controllers - Array de classes controllers
   */
  private registerControllers(controllers: any[]): any[] {
    const validControllers: any[] = []
    controllers.forEach((controller) => {
      const isController =
        Reflect.hasMetadata('controller:metadata', controller) ||
        (controller as any).__isController

      if (!isController) {
        log({
          type: 'warning',
          message: `Controller ${controller.name} não possui o decorador @Controller(). Ele será ignorado.`,
        })
        return
      }

      // Registra o controller no container
      if (!container.isBound(controller)) {
        container.bind(controller).toSelf()
        log({ message: `REGISTRANDO CONTROLLER => {${controller.name}}...` })
      }

      validControllers.push(controller)
    })
    return validControllers
  }

  /**
   * Starts the server listening on the specified port.
   * @param port - The port to listen on. Defaults to 3000.
   * @returns The Express app instance
   */
  start(port: number = 3000) {
    if (!this.core.registered) {
      log({ type: 'error', message: 'No controllers found! Please register at least one controller.' })
      process.exit(2)
    }
    try {
      this.core.initialize(port)
      return this.core.app
    } catch (error: any) {
      log({ type: 'error', message: error.message })
      process.exit(1)
    }
  }
}

export { container, Nespress }
