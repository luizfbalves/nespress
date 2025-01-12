import { safeDecorator } from './safe-decorator'

function responseDecorator(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
  if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
    throw new Error('param decorator @RESPONSE can only be applied into method params.')
  }

  const responses: number[] = Reflect.getMetadata('response:metadata', target.constructor, propertyKey) || []

  responses.push(parameterIndex)

  Reflect.defineMetadata('response:metadata', responses, target.constructor, propertyKey)
}

/**
 *returns the express response object
 */
export const RESPONSE = safeDecorator(responseDecorator)
