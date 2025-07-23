import { safeDecorator } from './safe-decorator'

function decorator(middleware: Function) {
  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('@Middleware can only be applied to methods.')
    }

    const middlewares: Function[] =
      Reflect.getMetadata('middleware:metadata', target.constructor, propertyKey) || []

    middlewares.push(middleware)

    Reflect.defineMetadata('middleware:metadata', middlewares, target.constructor, propertyKey)
  }
}

/**
 * Registers middlewares to be executed before the route handler.
 * @param middleware - Express style middleware function
 */
export const Middleware = (middleware: Function) => safeDecorator(decorator(middleware))
