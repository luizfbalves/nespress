import type { QueryParams } from '@/global'
import { safeDecorator } from './safe-decorator'

function decorator(param?: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
      throw new Error(`param decorator @Param can only be applied into method params.`)
    }
    // Get the existing URL path parameters
    const params: QueryParams[] =
      Reflect.getMetadata('param:metadata', target.constructor, propertyKey) || []

    // Add the new parameter
    params.push({ index: parameterIndex, name: param })

    // Save the updated list of URL path parameters
    Reflect.defineMetadata('param:metadata', params, target.constructor, propertyKey)
  }
}

/**
 * Registers the request.params URL path parameters.
 * @param param - The name of the URL path parameter. If not provided, it will return all of them.
 * 
 * @example
 * @Get('/users/:id')
 * getUser(@Param('id') id: string) {
 *   return { userId: id }
 * }
 */
export const Param = (param?: string) => safeDecorator(decorator(param))

