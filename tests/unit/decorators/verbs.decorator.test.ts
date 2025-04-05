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

// Implementações simuladas dos decoradores de método HTTP
function createRouteDecorator(method: string) {
  return (path: string = '') => {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const routes = Reflect.getMetadata('routes:metadata', target.constructor) || []

      routes.push({
        method,
        path,
        handler: descriptor.value,
      })

      Reflect.defineMetadata('routes:metadata', routes, target.constructor)

      return descriptor
    }
  }
}

const Get = createRouteDecorator('get')
const Post = createRouteDecorator('post')
const Put = createRouteDecorator('put')
const Delete = createRouteDecorator('delete')
const Patch = createRouteDecorator('patch')

describe('Decoradores de Métodos HTTP', () => {
  beforeEach(() => {
    metadataMap.clear()
  })

  describe('@Get', () => {
    it('deve registrar uma rota GET corretamente', () => {
      // Arrange
      class TesteController {
        @Get('/usuarios')
        getUsuarios() {
          return { usuarios: [] }
        }
      }

      // Act
      const routes = Reflect.getMetadata('routes:metadata', TesteController)

      // Assert
      expect(routes).toBeDefined()
      expect(routes.length).toBe(1)
      expect(routes[0].method).toBe('get')
      expect(routes[0].path).toBe('/usuarios')
      expect(typeof routes[0].handler).toBe('function')
    })

    it('deve usar path vazio quando não especificado', () => {
      // Arrange
      class TesteController {
        @Get()
        listarTodos() {
          return { data: [] }
        }
      }

      // Act
      const routes = Reflect.getMetadata('routes:metadata', TesteController)

      // Assert
      expect(routes[0].path).toBe('')
    })
  })

  describe('@Post', () => {
    it('deve registrar uma rota POST corretamente', () => {
      // Arrange
      class TesteController {
        @Post('/usuarios')
        criarUsuario() {
          return { mensagem: 'Usuário criado' }
        }
      }

      // Act
      const routes = Reflect.getMetadata('routes:metadata', TesteController)

      // Assert
      expect(routes).toBeDefined()
      expect(routes.length).toBe(1)
      expect(routes[0].method).toBe('post')
      expect(routes[0].path).toBe('/usuarios')
    })
  })

  describe('@Put', () => {
    it('deve registrar uma rota PUT corretamente', () => {
      // Arrange
      class TesteController {
        @Put('/usuarios/:id')
        atualizarUsuario() {
          return { mensagem: 'Usuário atualizado' }
        }
      }

      // Act
      const routes = Reflect.getMetadata('routes:metadata', TesteController)

      // Assert
      expect(routes).toBeDefined()
      expect(routes.length).toBe(1)
      expect(routes[0].method).toBe('put')
      expect(routes[0].path).toBe('/usuarios/:id')
    })
  })

  describe('@Delete', () => {
    it('deve registrar uma rota DELETE corretamente', () => {
      // Arrange
      class TesteController {
        @Delete('/usuarios/:id')
        excluirUsuario() {
          return { mensagem: 'Usuário excluído' }
        }
      }

      // Act
      const routes = Reflect.getMetadata('routes:metadata', TesteController)

      // Assert
      expect(routes).toBeDefined()
      expect(routes.length).toBe(1)
      expect(routes[0].method).toBe('delete')
      expect(routes[0].path).toBe('/usuarios/:id')
    })
  })

  describe('@Patch', () => {
    it('deve registrar uma rota PATCH corretamente', () => {
      // Arrange
      class TesteController {
        @Patch('/usuarios/:id')
        atualizarParcial() {
          return { mensagem: 'Usuário parcialmente atualizado' }
        }
      }

      // Act
      const routes = Reflect.getMetadata('routes:metadata', TesteController)

      // Assert
      expect(routes).toBeDefined()
      expect(routes.length).toBe(1)
      expect(routes[0].method).toBe('patch')
      expect(routes[0].path).toBe('/usuarios/:id')
    })
  })

  it('deve registrar múltiplas rotas no mesmo controller', () => {
    // Arrange
    class ApiController {
      @Get('/recursos')
      listar() {
        return []
      }

      @Post('/recursos')
      criar() {
        return { id: 1 }
      }

      @Put('/recursos/:id')
      atualizar() {
        return { sucesso: true }
      }
    }

    // Act
    const routes = Reflect.getMetadata('routes:metadata', ApiController)

    // Assert
    expect(routes).toBeDefined()
    expect(routes.length).toBe(3)

    // Verificando se as rotas estão na ordem correta
    expect(routes[0].method).toBe('get')
    expect(routes[1].method).toBe('post')
    expect(routes[2].method).toBe('put')

    expect(routes[0].path).toBe('/recursos')
    expect(routes[1].path).toBe('/recursos')
    expect(routes[2].path).toBe('/recursos/:id')
  })
})
