import { initialize, registerControllers } from '@/core'

import 'reflect-metadata'
import type { NesPressConfigParams } from './global'

import { Buffer } from 'buffer'
import { log } from './common'

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer
}

/**
 * Nespress
 * =========
 *
 * Nespress is a wrapper around express that allows you to use decorators to define routes.
 * It also includes a simple way to register controllers and their routes.
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
  private registered = false
  /**
   * Constructor
   * @param props - Configuration options
   * @param props.controllers - An array of controllers to register. Each controller should have the CONTROLLER decorator.
   */
  constructor(props: NesPressConfigParams) {
    const { controllers } = props
    this.register(controllers)
  }

  protected register(controllers: any[]) {
    try {
      registerControllers(controllers)
      this.registered = true
    } catch (error: any) {
      log({ type: 'error', message: error.message })
      this.registered = false
    }
  }

  /**
   * Starts the server listening on the specified port.
   * @param port - The port to listen on. Defaults to 3000.
   * @returns The express app instance
   */
  start(port: number = 3000) {
    if (!this.registered) {
      return
    }

    initialize(port)
  }
}

export default Nespress
