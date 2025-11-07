import { logError } from '../common'

export function safeDecorator(decorator: Function) {
  return (...args: any[]) => {
    try {
      decorator(...args)
    } catch (error) {
      const errorObj = error as Error
      
      // Melhorar a mensagem de erro para decorators
      if (errorObj.message.includes('reflect-metadata')) {
        logError(errorObj, {
          context: 'Decorator execution - Erro de metadados',
          suggestions: [
            'Verifique se importou "reflect-metadata" no início do arquivo',
            'Certifique-se que a classe tem o decorator necessário (@Controller, @Injectable, etc.)',
            'Verifique a sintaxe do decorator e seus parâmetros'
          ],
          showStack: false
        })
      } else {
        logError(errorObj, {
          context: 'Decorator execution - Erro genérico',
          suggestions: [
            'Verifique a sintaxe do decorator',
            'Verifique se os parâmetros estão corretos',
            'Verifique se o decorator está sendo aplicado no lugar correto'
          ]
        })
      }
      
      throw errorObj
    }
  }
}
