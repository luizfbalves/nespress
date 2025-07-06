import { safeDecorator } from './safe-decorator'

function bodyDecorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
    throw new Error(`param decorator @BODY can only be applied into method params.`)
  }

  if (!target.constructor.__isController && !Reflect.getMetadata('controller:metadata', target.constructor)) {
    throw new Error(`@BODY decorator can only be used within classes decorated with @Controller`)
  }

  const body: any[] = Reflect.getMetadata('body:metadata', target.constructor, propertyKey) || []

  body.push(parameterIndex)

  Reflect.defineMetadata('body:metadata', body, target.constructor, propertyKey)
}

/**
 * returns the express request.body object
 */
export const Body = safeDecorator(bodyDecorator)
