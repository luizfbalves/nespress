import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { container } from '../core/inversify'
import { logError } from '../common'

/**
 * Decorador para injetar serviços em propriedades de uma classe.
 * Similar ao @Inject() do NestJS.
 *
 * @param serviceIdentifier - O identificador do serviço a ser injetado (classe ou símbolo)
 * @returns Um decorador de propriedade
 *
 * @example
 * class UserController {
 *   @INJECT(UserService)
 *   private userService: UserService;
 * }
 */
export function Inject(serviceIdentifier: any) {
  return function (target: Object, propertyKey: string | symbol | undefined, parameterIndex?: number) {
    // Se parameterIndex está definido, é para parâmetro do construtor
    if (typeof parameterIndex === 'number') {
      // Usa o inject do Inversify para parâmetros do construtor
      return inject(serviceIdentifier)(target, propertyKey, parameterIndex)
    }
    
    // Se não, é para propriedade (comportamento anterior)
    if (typeof propertyKey === 'string') {
      const injectMetadata = Reflect.getMetadata('inject:metadata', target.constructor) || {}
      injectMetadata[propertyKey] = serviceIdentifier
      Reflect.defineMetadata('inject:metadata', injectMetadata, target.constructor)
    }
  }
}

/**
 * Decorador para marcar uma classe como injetável.
 * Similar ao @Injectable() do NestJS.
 *
 * @returns Um decorador de classe
 *
 * @example
 * @INJECTABLE()
 * class UserService {
 *   findAll() {
 *     return ['user1', 'user2'];
 *   }
 * }
 */
export function Injectable() {
  return function (target: any) {
    // Adiciona metadados para indicar que a classe tem o decorador @INJECTABLE()
    Reflect.defineMetadata('injectable:metadata', true, target)
    // Continua usando o injectable do InversifyJS
    return injectable()(target)
  }
}

/**
 * Decorador para parâmetros de construtor
 * Use este decorador para cada parâmetro no construtor que deve ser injetado
 *
 * @param serviceIdentifier - A classe ou identificador do serviço a injetar
 * @returns Um decorador de parâmetro
 *
 * @example
 * class UserController {
 *   constructor(@INJECT_PARAM(UserService) private userService: UserService) {}
 * }
 */
export function InjectParam(serviceIdentifier: any) {
  return inject(serviceIdentifier)
}

/**
 * Função para resolver as dependências de uma classe
 * @param target - A classe alvo
 * @returns Uma instância da classe com as dependências injetadas
 */
export function resolveDependencies(target: any) {
  // Se a classe está registrada no container, usa o container para criar a instância
  if (container.isBound(target)) {
    return container.get(target)
  }

  // Verificar os parâmetros do construtor e tentar injetá-los
  const paramTypes = Reflect.getMetadata('design:paramtypes', target) || []

  // Se não houver parâmetros no construtor, cria uma instância sem dependências
  if (paramTypes.length === 0) {
    return new target()
  }

  // Resolver as dependências para o construtor
  const resolvedParams = paramTypes.map((paramType: any) => {
    // Tenta obter a dependência do container
    try {
      return container.get(paramType)
    } catch (error) {
      const errorObj = error as Error
      logError(errorObj, {
        context: `Dependency injection - Construtor de ${target.name}`,
        suggestions: [
          `Adicione o decorator @Injectable() na classe ${paramType.name}`,
          `Registre ${paramType.name} no array "providers" do construtor Nespress`,
          'Verifique se a dependência está corretamente exportada'
        ],
        showStack: false
      })
      // Retorna undefined se não conseguir resolver
      return undefined
    }
  })

  // Cria uma nova instância com os parâmetros resolvidos
  const instance = new target(...resolvedParams)

  // Obtém os metadados de injeção para propriedades
  const injectMetadata = Reflect.getMetadata('inject:metadata', target) || {}

  // Injeta as dependências de propriedades
  for (const propertyKey in injectMetadata) {
    const serviceIdentifier = injectMetadata[propertyKey]
    // Resolve a dependência do container
    try {
      instance[propertyKey] = container.get(serviceIdentifier)
    } catch (error) {
      const errorObj = error as Error
      const serviceName = typeof serviceIdentifier === 'string' ? serviceIdentifier : serviceIdentifier.name
      logError(errorObj, {
        context: `Dependency injection - Propriedade ${propertyKey} em ${target.name}`,
        suggestions: [
          `Adicione o decorator @Injectable() na classe ${serviceName}`,
          `Registre ${serviceName} no array "providers" do construtor Nespress`,
          `Verifique se a propriedade ${propertyKey} está corretamente decorada com @Inject(${serviceName})`
        ],
        showStack: false
      })
    }
  }

  return instance
}
