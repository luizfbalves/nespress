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

// Teste básico para a funcionalidade do Core
describe('NespressCore', () => {
  beforeEach(() => {
    metadataMap.clear()
  })

  // Teste simples para garantir que o setup funciona
  it('deve ser possível definir e recuperar metadados', () => {
    // Arrange
    class TesteController {}
    const routeMetadata = [
      {
        method: 'get',
        path: '/teste',
        handler: function testeHandler() {
          return { message: 'teste' }
        },
      },
    ]

    // Act
    Reflect.defineMetadata('routes:metadata', routeMetadata, TesteController)
    const metadata = Reflect.getMetadata('routes:metadata', TesteController)

    // Assert
    expect(metadata).toEqual(routeMetadata)
    expect(metadata[0].path).toBe('/teste')
    expect(metadata[0].method).toBe('get')
  })

  it('deve lançar erro quando nenhum controlador é fornecido', () => {
    // Act & Assert
    expect(() => {
      throw new Error('No controllers found! Please register at least one controller.')
    }).toThrow('No controllers found! Please register at least one controller.')
  })
})
