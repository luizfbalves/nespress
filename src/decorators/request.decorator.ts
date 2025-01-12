import { safeDecorator } from './safe-decorator'

function requestDecorator(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
    throw new Error(`param decorator @REQUEST can only be applied into method params.`)
  }

  // Get the existing list of request objects
  const requests: number[] = Reflect.getMetadata('request:metadata', target.constructor, propertyKey) || []

  // Add the new parameter
  requests.push(parameterIndex)

  // Save the updated list of request objects
  Reflect.defineMetadata('request:metadata', requests, target.constructor, propertyKey)
}

/**
 * get the express request object.
 */
export const REQUEST = safeDecorator(requestDecorator)
