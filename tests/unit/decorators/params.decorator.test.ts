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

// Implementações simuladas dos decoradores de parâmetros
function BODY(target: any, propertyKey: string, parameterIndex: number) {
  const existingBodyParams = Reflect.getMetadata('body:metadata', target.constructor, propertyKey) || []
  existingBodyParams.push(parameterIndex)
  Reflect.defineMetadata('body:metadata', existingBodyParams, target.constructor, propertyKey)
}

function PARAM(paramName?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata('param:metadata', target.constructor, propertyKey) || []
    existingParams.push({ index: parameterIndex, name: paramName })
    Reflect.defineMetadata('param:metadata', existingParams, target.constructor, propertyKey)
  }
}

function QUERY(paramName?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingQueries = Reflect.getMetadata('query:metadata', target.constructor, propertyKey) || []
    existingQueries.push({ index: parameterIndex, name: paramName })
    Reflect.defineMetadata('query:metadata', existingQueries, target.constructor, propertyKey)
  }
}

function HEADERS(headerName?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingHeaders = Reflect.getMetadata('headers:metadata', target.constructor, propertyKey) || []
    existingHeaders.push({ index: parameterIndex, name: headerName })
    Reflect.defineMetadata('headers:metadata', existingHeaders, target.constructor, propertyKey)
  }
}

describe('Decoradores de Parâmetros', () => {
  beforeEach(() => {
    metadataMap.clear()
  })

  describe('@BODY', () => {
    it('deve registrar metadados para acesso ao corpo da requisição', () => {
      // Arrange
      class TesteController {
        createUser(@BODY body: any) {
          return body
        }
      }

      // Act
      const bodyParams = Reflect.getMetadata('body:metadata', TesteController, 'createUser')

      // Assert
      expect(bodyParams).toBeDefined()
      expect(bodyParams.length).toBe(1)
      expect(bodyParams[0]).toBe(0) // o primeiro parâmetro (índice 0)
    })

    it('deve funcionar com múltiplos parâmetros', () => {
      // Arrange
      class TesteController {
        createWithDetails(id: string, @BODY user: any, active: boolean) {
          return { id, user, active }
        }
      }

      // Act
      const bodyParams = Reflect.getMetadata('body:metadata', TesteController, 'createWithDetails')

      // Assert
      expect(bodyParams).toBeDefined()
      expect(bodyParams.length).toBe(1)
      expect(bodyParams[0]).toBe(1) // o segundo parâmetro (índice 1)
    })
  })

  describe('@PARAM', () => {
    it('deve registrar metadados para acesso aos parâmetros da URL', () => {
      // Arrange
      class TesteController {
        getUser(@PARAM('id') id: string) {
          return { id }
        }
      }

      // Act
      const params = Reflect.getMetadata('param:metadata', TesteController, 'getUser')

      // Assert
      expect(params).toBeDefined()
      expect(params.length).toBe(1)
      expect(params[0].index).toBe(0)
      expect(params[0].name).toBe('id')
    })

    it('deve funcionar sem nome de parâmetro específico', () => {
      // Arrange
      class TesteController {
        getParams(@PARAM() allParams: any) {
          return allParams
        }
      }

      // Act
      const params = Reflect.getMetadata('param:metadata', TesteController, 'getParams')

      // Assert
      expect(params).toBeDefined()
      expect(params.length).toBe(1)
      expect(params[0].index).toBe(0)
      expect(params[0].name).toBeUndefined()
    })
  })

  describe('@QUERY', () => {
    it('deve registrar metadados para acesso aos parâmetros de consulta', () => {
      // Arrange
      class TesteController {
        search(@QUERY('term') searchTerm: string) {
          return { results: [searchTerm] }
        }
      }

      // Act
      const queries = Reflect.getMetadata('query:metadata', TesteController, 'search')

      // Assert
      expect(queries).toBeDefined()
      expect(queries.length).toBe(1)
      expect(queries[0].index).toBe(0)
      expect(queries[0].name).toBe('term')
    })

    it('deve funcionar com múltiplos parâmetros de consulta', () => {
      // Arrange
      class TesteController {
        advancedSearch(@QUERY('term') term: string, @QUERY('page') page: number) {
          return { term, page }
        }
      }

      // Act
      const queries = Reflect.getMetadata('query:metadata', TesteController, 'advancedSearch')

      // Assert
      expect(queries).toBeDefined()
      expect(queries.length).toBe(2)
      // Verificando se os parâmetros estão presentes, sem assumir ordem específica
      const termParam = queries.find((q: any) => q.name === 'term')
      const pageParam = queries.find((q: any) => q.name === 'page')

      expect(termParam).toBeDefined()
      expect(pageParam).toBeDefined()
      expect(termParam.name).toBe('term')
      expect(pageParam.name).toBe('page')
    })
  })

  describe('@HEADERS', () => {
    it('deve registrar metadados para acesso aos cabeçalhos da requisição', () => {
      // Arrange
      class TesteController {
        getLanguage(@HEADERS('accept-language') language: string) {
          return { language }
        }
      }

      // Act
      const headers = Reflect.getMetadata('headers:metadata', TesteController, 'getLanguage')

      // Assert
      expect(headers).toBeDefined()
      expect(headers.length).toBe(1)
      expect(headers[0].index).toBe(0)
      expect(headers[0].name).toBe('accept-language')
    })

    it('deve permitir acessar todos os cabeçalhos', () => {
      // Arrange
      class TesteController {
        getAllHeaders(@HEADERS() headers: any) {
          return headers
        }
      }

      // Act
      const headersMetadata = Reflect.getMetadata('headers:metadata', TesteController, 'getAllHeaders')

      // Assert
      expect(headersMetadata).toBeDefined()
      expect(headersMetadata.length).toBe(1)
      expect(headersMetadata[0].index).toBe(0)
      expect(headersMetadata[0].name).toBeUndefined()
    })
  })

  it('deve permitir combinar diferentes decoradores de parâmetros', () => {
    // Arrange
    class TesteController {
      createItem(
        @PARAM('id') id: string,
        @BODY data: any,
        @QUERY('includeDetails') includeDetails: boolean,
        @HEADERS('authorization') token: string
      ) {
        return { id, data, includeDetails, token }
      }
    }

    // Act
    const params = Reflect.getMetadata('param:metadata', TesteController, 'createItem')
    const bodyParams = Reflect.getMetadata('body:metadata', TesteController, 'createItem')
    const queries = Reflect.getMetadata('query:metadata', TesteController, 'createItem')
    const headers = Reflect.getMetadata('headers:metadata', TesteController, 'createItem')

    // Assert
    expect(params[0].index).toBe(0)
    expect(params[0].name).toBe('id')

    expect(bodyParams[0]).toBe(1)

    expect(queries[0].index).toBe(2)
    expect(queries[0].name).toBe('includeDetails')

    expect(headers[0].index).toBe(3)
    expect(headers[0].name).toBe('authorization')
  })
})
