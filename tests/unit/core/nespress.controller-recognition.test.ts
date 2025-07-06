import 'reflect-metadata'
import { beforeEach, describe, expect, it } from 'vitest'

// Map para simular metadados
const metadataMap = new Map<string, any>()
const originalReflect = global.Reflect

global.Reflect = {
  ...originalReflect,
  defineMetadata(key: string, value: any, target: any) {
    const targetKey = `${key}-${target.name}`
    metadataMap.set(targetKey, value)
  },
  getMetadata(key: string, target: any) {
    const targetKey = `${key}-${target.name}`
    return metadataMap.get(targetKey)
  },
  hasMetadata(key: string, target: any) {
    const targetKey = `${key}-${target.name}`
    return metadataMap.has(targetKey)
  },
}

function Controller() {
  return function (target: any) {
    Reflect.defineMetadata('controller:metadata', true, target)
    Object.defineProperty(target, '__isController', { value: true })
  }
}

// Função que simula o registro de controllers
function registerControllers(controllers: any[]) {
  const registered: any[] = []
  controllers.forEach((controller) => {
    const isController =
      Reflect.hasMetadata('controller:metadata', controller) ||
      (controller as any).__isController

    if (isController) {
      registered.push(controller)
    }
  })
  return registered
}

describe('Reconhecimento de controllers', () => {
  beforeEach(() => {
    metadataMap.clear()
  })

  it('deve registrar apenas classes decoradas com @Controller', () => {
    @Controller()
    class Decorated {}

    class Plain {}

    const result = registerControllers([Decorated, Plain])

    expect(result).toContain(Decorated)
    expect(result).not.toContain(Plain)
  })
})
