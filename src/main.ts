import 'reflect-metadata'
import type { NesPressConfigParams } from './global'

import { log } from './common'
import { NespressCore } from './core'

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
 *   controllers: [MyController],
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
   */
  constructor(props: NesPressConfigParams) {
    const { controllers } = props
    this.core = new NespressCore(controllers)
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

export default Nespress
