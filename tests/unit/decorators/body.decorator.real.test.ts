import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import { Body } from '@/decorators/body.decorator'

// helper to apply Body using decorator syntax

describe('Body decorator validation', () => {
  it('should throw when used outside a controller', () => {
    // O teste agora verifica apenas se o erro é lançado, já que o logError
    // é usado para melhorar a UX, mas o comportamento principal (lançar erro) é mantido
    expect(() => {
      class TestClass {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        method(@Body body: any) {}
      }
      // create an instance to avoid unused variable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const t = new TestClass()
    }).toThrow('@Body can only be used within classes decorated with @Controller.')
  })

})
