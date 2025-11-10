import 'reflect-metadata'
import type { ClassType, NesPressConfigParams } from './global'

import { logger, logError, createCleanError } from './common'
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
class Nespress<C extends ClassType = ClassType, P extends ClassType = ClassType> {
  private core: NespressCore

  /**
   * Constructor
   * @param props - Configuration options
   * @param props.controllers - An array of controllers to register. Each controller should have the CONTROLLER decorator.
   * @param props.providers - An array of providers (services) to register for dependency injection.
   */
  constructor(props: NesPressConfigParams<C, P>) {
    const { controllers, providers = [] } = props

    try {
      // Registra os providers no container PRIMEIRO
      this.registerProviders(providers)

      // Registra os controllers no container APÓS os providers
      const validControllers = this.registerControllers(controllers)

      // Inicializa o core com os controllers válidos
      this.core = new NespressCore(validControllers)
    } catch (error: any) {
      // Se chegou aqui, o erro não foi tratado adequadamente
      // Log apenas se não for o erro de "No controllers" (que já terminou o processo)
      if (error && error.message && !error.message.includes('No controllers found')) {
        logError(error, {
          context: 'Nespress.constructor() - Inicialização da aplicação',
          suggestions: [
            'Verifique se todos os controllers têm o decorator @Controller()',
            'Verifique se todos os providers têm o decorator @Injectable()',
            'Verifique se "emitDecoratorMetadata": true está no tsconfig.json',
            'Verifique se "reflect-metadata" foi importado no início do arquivo'
          ]
        })
      }
      throw createCleanError(error)
    }
  }

  /**
   * Registra os providers no container de injeção de dependências
   * @param providers - Array de classes providers
   */
  private registerProviders(providers: P[]) {
    providers.forEach((provider) => {
      if (!Reflect.hasMetadata('injectable:metadata', provider)) {
        logger.warn(`Provider ${provider.name} não possui o decorador @Injectable(). Isso pode causar problemas.`)
      }

      // Registra o provider no container
      if (!container.isBound(provider)) {
        container.bind(provider).toSelf()
        logger.info(`REGISTRANDO PROVIDER => {${provider.name}}...`)
      }
    })
  }

  /**
   * Registra os controllers no container de injeção de dependências
   * @param controllers - Array de classes controllers
   */
  private registerControllers(controllers: C[]): C[] {
    const validControllers: C[] = []
    controllers.forEach((controller) => {
      const isController =
        Reflect.hasMetadata('controller:metadata', controller) ||
        (controller as any).__isController

      if (!isController) {
        logger.warn(`Controller ${controller.name} não possui o decorador @Controller(). Ele será ignorado.`)
        return
      }

      // Registra o controller no container
      if (!container.isBound(controller)) {
        try {
          container.bind(controller).toSelf()
          logger.info(`REGISTRANDO CONTROLLER => {${controller.name}}...`)
        } catch (error) {
          logError(error as Error, {
            context: `registerControllers() - Registro do controller ${controller.name}`,
            suggestions: [
              'Verifique se o controller tem o decorator @Controller()',
              'Verifique se as dependências do construtor estão corretamente injetadas',
              'Use @Inject(ServiceClass) para parâmetros do construtor',
              'Certifique-se que todos os serviços foram registrados no array "providers"'
            ]
          })
          throw createCleanError(error as Error)
        }
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
      const error = new Error('No controllers found! Please register at least one controller.')
      logError(error, {
        context: 'Nespress.start() - Verificação de controllers registrados',
        showStack: false
      })
      process.exit(2)
    }
    try {
      this.core.initialize(port)
      return this.core.app
    } catch (error: any) {
      logError(error, {
        context: 'Nespress.start() - Inicialização do servidor',
        suggestions: [
          'Verifique se todas as dependências estão instaladas',
          'Verifique se não há conflitos de porta',
          'Verifique se a configuração está correta'
        ]
      })
      // Não precisa relançar aqui, apenas encerrar o processo
      process.exit(1)
    }
  }
}

export { container, Nespress }
