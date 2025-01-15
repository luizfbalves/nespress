import { safeDecorator } from './safe-decorator'

/**
 * Creates a decorator that registers a route handler for a given HTTP method and path.
 * @param method - The HTTP method to register (e.g. 'get', 'post', 'put', etc.)
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
function createRouteHandler(method: string, path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error(`@${method.toUpperCase()} can only be applied to methods.`)
    }

    const routes: any[] = Reflect.getMetadata('routes:metadata', target.constructor) || []
    routes.push({ method, path, handler: descriptor.value })
    Reflect.defineMetadata('routes:metadata', routes, target.constructor)
  }
}

/**
 * Registers a route handler for a GET request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export const Get = (path: string) => safeDecorator(createRouteHandler('get', path))

/**
 * Registers a route handler for a POST request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export const Post = (path: string) => safeDecorator(createRouteHandler('post', path))

/**
 * Registers a route handler for a PUT request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export const Put = (path: string) => safeDecorator(createRouteHandler('put', path))

/**
 * Registers a route handler for a DELETE request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export const Delete = (path: string) => safeDecorator(createRouteHandler('delete', path))

/**
 * Registers a route handler for a PATCH request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export const Patch = (path: string) => safeDecorator(createRouteHandler('patch', path))
