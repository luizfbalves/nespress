import { describe, it, expect } from 'vitest'
import { formatError } from '../../src/common/error-formatter'

describe('API Error Messages UX', () => {
  it('deve formatar erro de "No controllers found"', () => {
    const error = new Error('No controllers found! Please register at least one controller.')
    const formatted = formatError(error, { showStack: false })
    
    expect(formatted).toContain('❌ Nenhum controller encontrado!')
    expect(formatted).toContain('💡 Sugestões:')
    expect(formatted).toContain('@Controller()')
  })

  it('deve formatar erro de reflect-metadata', () => {
    const error = new Error('Cannot read property of undefined at Reflect.getMetadata')
    const formatted = formatError(error, { context: 'Uso de decorator' })
    
    expect(formatted).toContain('❌ Erro de metadados do decorator')
    expect(formatted).toContain('reflect-metadata')
    expect(formatted).toContain('💡 Sugestões:')
  })

  it('deve formatar erro de injeção de dependência', () => {
    const error = new Error('Found unexpected missing metadata on type "UserController". Constructor requires at least 1 arguments, found 0 instead.')
    const formatted = formatError(error, { 
      context: 'Inicialização do controller'
    })
    
    expect(formatted).toContain('❌ Erro de configuração do Inversify')
    expect(formatted).toContain('💡 Sugestões:')
    expect(formatted).toContain('@Injectable()')
  })

  it('deve formatar erro de módulo não encontrado', () => {
    const error = new Error('Cannot find module "inversify"')
    const formatted = formatError(error)
    
    expect(formatted).toContain('❌ Módulo não encontrado')
    expect(formatted).toContain('npm install')
  })

  it('deve formatar stack trace limpo quando solicitado', () => {
    const error = new Error('Erro genérico de teste')
    error.stack = `Error: Erro genérico de teste
    at Object.<anonymous> (/home/engine/project/src/controllers/user.controller.ts:25:15)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
    at Object.transformer (/home/engine/project/node_modules/tsx/dist/register-D46fvsV_.cjs:3:1104)
    at Module.load (node:internal/modules/cjs/loader:1266:32)
    at ModuleJob.run (node:internal/modules/esm/module_job:325:25)`

    const formatted = formatError(error, { 
      context: 'Processamento de requisição',
      showStack: true 
    })
    
    expect(formatted).toContain('🔍 Stack trace:')
    expect(formatted).toContain('user.controller.ts:25:15')
    // Não deve conter linhas de node_modules
    expect(formatted).not.toContain('node_modules')
  })

  it('deve lidar com erro genérico sem padrão específico', () => {
    const error = new Error('Erro completamente genérico e desconhecido')
    const formatted = formatError(error, { 
      suggestions: ['Sugestão personalizada'] 
    })
    
    expect(formatted).toContain('❌ Erro: Erro completamente genérico e desconhecido')
    expect(formatted).toContain('💡 Sugestões adicionais:')
    expect(formatted).toContain('Sugestão personalizada')
  })
})