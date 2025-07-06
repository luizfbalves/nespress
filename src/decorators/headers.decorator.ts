import { safeDecorator } from './safe-decorator'

function decorator(header?: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
      throw new Error(`param decorator @HEADERS can only be applied into method params.`)
    }

    const headers: { index: number; name?: string }[] =
      Reflect.getMetadata('headers:metadata', target.constructor, propertyKey) || []

    headers.push({ index: parameterIndex, name: header })

    Reflect.defineMetadata('headers:metadata', headers, target.constructor, propertyKey)
  }
}

/**
 * Registers request header parameters for a method.
 * @param header - The name of the header. If omitted, injects the entire headers object.
 */
export const Headers = (header?: string) => safeDecorator(decorator(header))
export const HEADERS = Headers
