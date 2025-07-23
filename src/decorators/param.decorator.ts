import { safeDecorator } from './safe-decorator'

function decorator(name?: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
      throw new Error(`param decorator @PARAM can only be applied into method params.`)
    }

    const params: { index: number; name?: string }[] =
      Reflect.getMetadata('param:metadata', target.constructor, propertyKey) || []

    params.push({ index: parameterIndex, name })

    Reflect.defineMetadata('param:metadata', params, target.constructor, propertyKey)
  }
}

/**
 * Registers the request params for a route handler.
 * @param name - The name of the parameter. If not provided, returns all params.
 */
export const Param = (name?: string) => safeDecorator(decorator(name))
export const PARAM = Param
