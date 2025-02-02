import { safeDecorator } from './safe-decorator'

function bodyDecorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  if (typeof target.constructor.prototype[propertyKey] !== 'function' || typeof parameterIndex !== 'number') {
    throw new Error(`param decorator @BODY can only be applied into method params.`)
  }

  const body: any[] = Reflect.getMetadata('body:metadata', target.constructor, propertyKey) || []

  body.push(parameterIndex)

  Reflect.defineMetadata('body:metadata', body, target.constructor, propertyKey)
}

/**
 * returns the express request.body object
 */
export const Body = safeDecorator(bodyDecorator)

//TODO adicionar validacao para so permitir o uso se estiver em uma classe decorada com CONTROLLER
