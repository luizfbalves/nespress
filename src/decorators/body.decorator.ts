export function BODY(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  const body: any[] = Reflect.getMetadata('body:metadata', target.constructor) || []
  body.push(parameterIndex)
  Reflect.defineMetadata('body:metadata', body, target.constructor, propertyKey)
}

//TODO adicionar validacao para so permitir o uso se estiver em uma classe decorada com CONRTOLLER
