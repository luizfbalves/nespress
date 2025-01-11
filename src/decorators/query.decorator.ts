import type { QueryParams } from '@/global'
import { safeDecorator } from './safe-decorator'

function decorator(query?: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
      throw new Error(`param decorator @QUERY can only be applied into method params.`)
    }
    // Get the existing query string parameters
    const queries: QueryParams[] = Reflect.getMetadata('query:metadata', target.constructor) || []

    // Add the new parameter
    queries.push({ index: parameterIndex, name: query })

    // Save the updated list of query string parameters
    Reflect.defineMetadata('query:metadata', queries, target.constructor, propertyKey)
  }
}

/**
 * Registers a route parameter as a query string parameter.
 * @param query - The name of the query string parameter. If not provided, it will return all of them.
 */
export const QUERY = (query?: string) => safeDecorator(decorator(query))
