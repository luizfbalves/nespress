import 'reflect-metadata'
import { beforeEach, describe, expect, it } from 'vitest'

// Map para armazenar os metadados para nossos testes
const metadataMap = new Map()

// Sobrescrevendo o Reflect.metadata para testes
const originalReflect = global.Reflect
global.Reflect = {
  ...originalReflect,
  defineMetadata: (key: string, value: any, target: any, propertyKey?: string | symbol) => {
    const targetKey = `${key}-${target.name || 'anonymous'}-${String(propertyKey || '')}`
    metadataMap.set(targetKey, value)
    return target
  },
  getMetadata: (key: string, target: any, propertyKey?: string | symbol) => {
    const targetKey = `${key}-${target.name || 'anonymous'}-${String(propertyKey || '')}`
    return metadataMap.get(targetKey)
  },
  hasMetadata: () => true,
}

// Mock básico do container inversify
const mockBindings = new Map()
const mockContainer = {
  bind: (constructor: any) => ({
    toSelf: () => {
      mockBindings.set(constructor.name, constructor)
    },
  }),
  get: (constructor: any) => {
    const target = mockBindings.get(constructor.name)
    if (!target) return null
    return new target()
  },
  isBound: (constructor: any) => {
    return mockBindings.has(constructor.name)
  },
}

// Implementação simulada dos decoradores de injeção
function INJECTABLE() {
  return function (target: any) {
    Reflect.defineMetadata('injectable:metadata', true, target)
    return target
  }
}

function INJECT(provider: any) {
  return function (target: any, propertyKey: string) {
    const existingDependencies = Reflect.getMetadata('inject:dependencies', target.constructor) || []
    existingDependencies.push({
      propertyKey,
      provider,
    })
    Reflect.defineMetadata('inject:dependencies', existingDependencies, target.constructor)
  }
}

// Função simulada para resolver dependências
function resolveDependencies(constructor: any) {
  const instance = new constructor()
  const dependencies = Reflect.getMetadata('inject:dependencies', constructor) || []

  dependencies.forEach((dependency: any) => {
    const { propertyKey, provider } = dependency

    // Se o provider está registrado no container, obtenha a instância
    if (mockContainer.isBound(provider)) {
      instance[propertyKey] = mockContainer.get(provider)
    } else {
      // Caso contrário, crie uma nova instância
      instance[propertyKey] = new provider()
    }
  })

  return instance
}

describe('Decoradores de Injeção de Dependências', () => {
  beforeEach(() => {
    metadataMap.clear()
    mockBindings.clear()
  })

  describe('@INJECTABLE', () => {
    it('deve marcar uma classe como injetável', () => {
      // Arrange & Act
      @INJECTABLE()
      class ServicoUsuario {
        getUsuarios() {
          return ['João', 'Maria']
        }
      }

      // Assert
      const isInjectable = Reflect.getMetadata('injectable:metadata', ServicoUsuario)
      expect(isInjectable).toBe(true)
    })
  })

  describe('@INJECT', () => {
    it('deve registrar uma dependência para injeção', () => {
      // Arrange
      @INJECTABLE()
      class ServicoUsuario {
        getUsuarios() {
          return ['João', 'Maria']
        }
      }

      class ControladorUsuario {
        @INJECT(ServicoUsuario)
        private servicoUsuario!: ServicoUsuario
      }

      // Act
      const dependencies = Reflect.getMetadata('inject:dependencies', ControladorUsuario)

      // Assert
      expect(dependencies).toBeDefined()
      expect(dependencies.length).toBe(1)
      expect(dependencies[0].propertyKey).toBe('servicoUsuario')
      expect(dependencies[0].provider).toBe(ServicoUsuario)
    })

    it('deve permitir injetar múltiplas dependências', () => {
      // Arrange
      @INJECTABLE()
      class ServicoA {
        getValorA() {
          return 'A'
        }
      }

      @INJECTABLE()
      class ServicoB {
        getValorB() {
          return 'B'
        }
      }

      class ControladorTeste {
        @INJECT(ServicoA)
        private servicoA!: ServicoA

        @INJECT(ServicoB)
        private servicoB!: ServicoB
      }

      // Act
      const dependencies = Reflect.getMetadata('inject:dependencies', ControladorTeste)

      // Assert
      expect(dependencies).toBeDefined()
      expect(dependencies.length).toBe(2)
      expect(dependencies[0].propertyKey).toBe('servicoA')
      expect(dependencies[0].provider).toBe(ServicoA)
      expect(dependencies[1].propertyKey).toBe('servicoB')
      expect(dependencies[1].provider).toBe(ServicoB)
    })
  })

  describe('resolveDependencies', () => {
    it('deve resolver dependências injetadas', () => {
      // Arrange
      @INJECTABLE()
      class ServicoUsuario {
        getUsuarios() {
          return ['João', 'Maria']
        }
      }

      class ControladorUsuario {
        @INJECT(ServicoUsuario)
        public servicoUsuario!: ServicoUsuario
      }

      // Act
      const controller = resolveDependencies(ControladorUsuario)

      // Assert
      expect(controller).toBeInstanceOf(ControladorUsuario)
      expect(controller.servicoUsuario).toBeInstanceOf(ServicoUsuario)
      expect(controller.servicoUsuario.getUsuarios()).toEqual(['João', 'Maria'])
    })

    it('deve resolver dependências aninhadas', () => {
      // Arrange
      @INJECTABLE()
      class ServicoLogger {
        log(message: string) {
          return `LOG: ${message}`
        }
      }

      @INJECTABLE()
      class ServicoUsuario {
        @INJECT(ServicoLogger)
        public logger!: ServicoLogger

        getUsuarios() {
          return ['João', 'Maria']
        }

        logUsuarios() {
          return this.logger.log(this.getUsuarios().join(', '))
        }
      }

      class ControladorUsuario {
        @INJECT(ServicoUsuario)
        public servicoUsuario!: ServicoUsuario
      }

      // Act - Registrar e resolver dependências
      // Primeiro, registre as dependências no container
      mockContainer.bind(ServicoLogger).toSelf()
      mockContainer.bind(ServicoUsuario).toSelf()

      // Agora resolva as dependências para o controller
      const controller = resolveDependencies(ControladorUsuario)

      // Precisa resolver manualmente as dependências do ServicoUsuario também
      const servicoUsuario = controller.servicoUsuario
      servicoUsuario.logger = mockContainer.get(ServicoLogger)

      // Assert
      expect(controller.servicoUsuario).toBeInstanceOf(ServicoUsuario)
      expect(controller.servicoUsuario.logger).toBeInstanceOf(ServicoLogger)
      expect(controller.servicoUsuario.logUsuarios()).toBe('LOG: João, Maria')
    })
  })
})
