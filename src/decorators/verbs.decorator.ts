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
export function GET(path: string) {
  return createRouteHandler('get', path)
}

/**
 * Registers a route handler for a POST request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export function POST(path: string) {
  return createRouteHandler('post', path)
}

/**
 * Registers a route handler for a PUT request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export function PUT(path: string) {
  return createRouteHandler('put', path)
}

/**
 * Registers a route handler for a DELETE request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export function DELETE(path: string) {
  return createRouteHandler('delete', path)
}

/**
 * Registers a route handler for a PATCH request.
 * @param path - The path to register the route for (e.g. '/', '/users', etc.)
 */
export function PATCH(path: string) {
  return createRouteHandler('patch', path)
}

//TODO adicionar validacao para so permitir o uso se estiver em uma classe decorada com CONRTOLLER
