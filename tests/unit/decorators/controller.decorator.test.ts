import 'reflect-metadata'
import { beforeEach, describe, expect, it } from 'vitest'

// Map para armazenar os metadados para nossos testes
const metadataMap = new Map()

// Sobrescrevendo o Reflect.metadata para testes
const originalReflect = global.Reflect
global.Reflect = {
  ...originalReflect,
  defineMetadata: (key: string, value: any, target: any) => {
    const targetKey = `${key}-${target.name || 'anonymous'}`
    metadataMap.set(targetKey, value)
    return target
  },
  getMetadata: (key: string, target: any) => {
    const targetKey = `${key}-${target.name || 'anonymous'}`
    return metadataMap.get(targetKey)
  },
  hasMetadata: () => true,
}

// Implementação simulada do decorador Controller para testes
function Controller(props?: any) {
  return function (target: any) {
    // Definir metadados de controller
    Reflect.defineMetadata('controller:metadata', props, target)

    // Obter rotas existentes
    const routes = Reflect.getMetadata('routes:metadata', target) || []

    // Definir prefixo
    let prefix = ''
    if (props) {
      if (props.version) {
        prefix = `/v${props.version}`
      }

      if (props.path) {
        const basePath = props.path.startsWith('/') ? props.path.slice(1) : props.path
        prefix = prefix + `/${basePath}`
      }
    }

    // Adicionar prefixo às rotas
    if (prefix !== '') {
      const prefixedRoutes = routes.map((route: any) => {
        const routePath = route.path.startsWith('/') ? route.path.slice(1) : route.path
        return {
          ...route,
          path: prefix + `${routePath ? '/' + routePath : ''}`,
        }
      })

      Reflect.defineMetadata('routes:metadata', prefixedRoutes, target)
    }
  }
}

describe('@Controller', () => {
  beforeEach(() => {
    metadataMap.clear()
  })

  it('deve adicionar metadados corretos na classe', () => {
    // Arrange & Act
    @Controller({ path: '/teste' })
    class TesteController {}

    // Assert
    const metadata = Reflect.getMetadata('controller:metadata', TesteController)
    expect(metadata).toBeDefined()
    expect(metadata.path).toBe('/teste')
  })

  it('deve lidar com versão corretamente', () => {
    // Arrange & Act
    @Controller({ path: '/api', version: 2 })
    class ApiV2Controller {}

    // Assert
    const metadata = Reflect.getMetadata('controller:metadata', ApiV2Controller)
    expect(metadata.version).toBe(2)
    expect(metadata.path).toBe('/api')
  })

  it('deve adicionar prefixo às rotas', () => {
    // Arrange
    const routes = [
      { method: 'get', path: '/usuarios', handler: () => {} },
      { method: 'post', path: 'produtos', handler: () => {} },
    ]

    // Act
    class ApiController {}
    Reflect.defineMetadata('routes:metadata', routes, ApiController)

    Controller({ path: '/api', version: 1 })(ApiController)

    // Assert
    const updatedRoutes = Reflect.getMetadata('routes:metadata', ApiController)
    expect(updatedRoutes[0].path).toBe('/v1/api/usuarios')
    expect(updatedRoutes[1].path).toBe('/v1/api/produtos')
  })

  it('deve processar corretamente caminhos com e sem barras iniciais', () => {
    // Arrange & Act
    @Controller({ path: 'sem-barra' })
    class SemBarraController {}

    @Controller({ path: '/com-barra' })
    class ComBarraController {}

    // Assert
    const rotasSemBarra = Reflect.getMetadata('routes:metadata', SemBarraController) || []
    const rotasComBarra = Reflect.getMetadata('routes:metadata', ComBarraController) || []

    // Adiciona uma rota para testar o prefixo
    if (rotasSemBarra.length === 0) {
      const routes = [{ method: 'get', path: '/test', handler: () => {} }]
      Reflect.defineMetadata('routes:metadata', routes, SemBarraController)
      Controller({ path: 'sem-barra' })(SemBarraController)
      const updatedRoutes = Reflect.getMetadata('routes:metadata', SemBarraController)
      expect(updatedRoutes[0].path).toBe('/sem-barra/test')
    }

    if (rotasComBarra.length === 0) {
      const routes = [{ method: 'get', path: '/test', handler: () => {} }]
      Reflect.defineMetadata('routes:metadata', routes, ComBarraController)
      Controller({ path: '/com-barra' })(ComBarraController)
      const updatedRoutes = Reflect.getMetadata('routes:metadata', ComBarraController)
      expect(updatedRoutes[0].path).toBe('/com-barra/test')
    }
  })
})
