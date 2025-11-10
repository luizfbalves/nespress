/**
 * Interface para opções de formatação de erro
 */
export interface ErrorFormatterOptions {
  /** Contexto adicional para ajudar no debugging */
  context?: string
  /** Sugestões de solução para o usuário */
  suggestions?: string[]
  /** Se deve mostrar stack trace completo (development only) */
  showStack?: boolean
}

/**
 * Padrões de erros comuns e suas soluções
 */
const ERROR_PATTERNS = {
  NO_CONTROLLERS: {
    pattern: /No controllers found/i,
    message: 'Nenhum controller encontrado!',
    suggestions: [
      'Adicione o decorator @Controller() em suas classes de controller',
      'Exemplo: @Controller("/users") class UserController {}',
      'Certifique-se de passar os controllers no array "controllers" do construtor Nespress'
    ]
  },
  REFLECT_METADATA: {
    pattern: /reflect-metadata|Reflect\.(get|define)Metadata/i,
    message: 'Erro de metadados do decorator',
    suggestions: [
      'Verifique se importou "reflect-metadata" no início do arquivo',
      'Certifique-se que está usando decorators corretamente',
      'Verifique se a classe tem o decorator necessário (@Controller, @Injectable, etc.)'
    ]
  },
  INJECTABLE_NOT_FOUND: {
    pattern: /injectable|provider|dependency/i,
    message: 'Erro de injeção de dependência',
    suggestions: [
      'Adicione o decorator @Injectable() em suas classes de serviço',
      'Exemplo: @Injectable() class UserService {}',
      'Certifique-se de registrar os providers no array "providers" do construtor'
    ]
  },
  INVERSIFY_MISSING_METADATA: {
    pattern: /missing metadata|constructor requires.*arguments|emitDecoratorMetadata/i,
    message: 'Erro de configuração do Inversify',
    suggestions: [
      'Adicione o decorator @Injectable() na classe do serviço',
      'Verifique se "emitDecoratorMetadata": true está no tsconfig.json',
      'Use @Inject(ServiceClass) para parâmetros do construtor',
      'Registre todos os serviços no array "providers" do construtor Nespress'
    ]
  },
  MODULE_NOT_FOUND: {
    pattern: /module.*not found|cannot find module/i,
    message: 'Módulo não encontrado',
    suggestions: [
      'Verifique se o módulo está instalado: npm install <nome-do-módulo>',
      'Verifique se o caminho de importação está correto',
      'Reinicie o servidor após instalar novas dependências'
    ]
  }
}

/**
 * Formata erros de forma amigável e útil
 */
export class ErrorFormatter {
  /**
   * Formata uma mensagem de erro com sugestões úteis
   */
  static format(error: Error, options: ErrorFormatterOptions = {}): string {
    const { context = '', suggestions = [], showStack = false } = options
    const errorMessage = error.message || 'Erro desconhecido'
    
    // Identificar o tipo de erro baseado em padrões
    let matchedPattern = null
    for (const [key, pattern] of Object.entries(ERROR_PATTERNS)) {
      if (pattern.pattern.test(errorMessage)) {
        matchedPattern = pattern
        break
      }
    }

    // Construir mensagem formatada
    let formattedMessage = ''
    
    // Título do erro
    if (matchedPattern) {
      formattedMessage += `❌ ${matchedPattern.message}\n\n`
      formattedMessage += `📝 Detalhes: ${errorMessage}\n\n`
      
      // Adicionar sugestões padrão
      if (matchedPattern.suggestions.length > 0) {
        formattedMessage += '💡 Sugestões:\n'
        matchedPattern.suggestions.forEach((suggestion, index) => {
          formattedMessage += `   ${index + 1}. ${suggestion}\n`
        })
        formattedMessage += '\n'
      }
    } else {
      formattedMessage += `❌ Erro: ${errorMessage}\n\n`
    }

    // Adicionar contexto se fornecido
    if (context) {
      formattedMessage += `📍 Contexto: ${context}\n\n`
    }

    // Adicionar sugestões personalizadas
    if (suggestions.length > 0) {
      formattedMessage += '💡 Sugestões adicionais:\n'
      suggestions.forEach((suggestion, index) => {
        formattedMessage += `   ${index + 1}. ${suggestion}\n`
      })
      formattedMessage += '\n'
    }

    // Adicionar stack trace formatado se necessário
    if (showStack && error.stack) {
      formattedMessage += '🔍 Stack trace:\n'
      formattedMessage += this.formatStack(error.stack)
    }

    return formattedMessage.trim()
  }

  /**
   * Formata o stack trace removendo código irrelevante
   */
  private static formatStack(stack: string): string {
    const lines = stack.split('\n')
    const formattedLines: string[] = []

    for (const line of lines) {
      // Pular linhas de node_modules (vários formatos possíveis)
      if (line.includes('node_modules/') || 
          line.includes('node_modules\\') ||
          (line.includes('.js:') && line.includes('node_modules')) ||
          (line.includes('.mjs:') && line.includes('node_modules')) ||
          line.includes('tsx/dist/')) {
        continue
      }

      // Pular linhas internas do runtime
      if (line.includes('internal/') || 
          line.includes('Module._compile') ||
          line.includes('ModuleJob.run')) {
        continue
      }

      // Pular linhas com código minificado (identificadas por funções com nomes curtos como i, a, c, n, p, etc)
      // Exemplo: "function J6(i){return i.length===0?"":`"
      if (/function\s+[A-Z_][0-9]+\(/.test(line) || 
          /\)\}function\s+\w+\(/.test(line) ||
          line.includes('Binding constraints:') ||
          line.includes('service identifier:') ||
          line.includes('service redirections:')) {
        continue
      }

      // Manter apenas linhas relevantes do código do usuário
      formattedLines.push(line)
      
      // Limitar número de linhas para não sobrecarregar
      if (formattedLines.length >= 8) {
        formattedLines.push('    ... (stack trace truncado)')
        break
      }
    }

    return formattedLines.join('\n')
  }

  /**
   * Loga erro formatado usando o sistema de logs do Nespress (Pino)
   */
  static log(error: Error, options: ErrorFormatterOptions = {}): void {
    const { context, suggestions, showStack = false } = options
    
    // Importar o logger do Pino
    const { logger } = require('./logger')
    
    logger.error(
      {
        error: {
          message: error.message,
          name: error.name,
          stack: showStack ? error.stack : undefined,
        },
        context,
        suggestions,
      },
      error.message
    )
  }
}

/**
 * Função de conveniência para formatar e logar erros
 */
export function formatError(error: Error, options?: ErrorFormatterOptions): string {
  return ErrorFormatter.format(error, options)
}

/**
 * Função de conveniência para logar erros formatados
 */
export function logError(error: Error, options?: ErrorFormatterOptions): void {
  ErrorFormatter.log(error, options)
}

/**
 * Cria um erro limpo sem stack trace interno
 * Remove stack traces de node_modules e código minificado do inversify
 * 
 * @param error - Erro original
 * @returns Novo erro apenas com a mensagem, sem stack trace interno
 */
export function createCleanError(error: Error): Error {
  const cleanError = new Error(error.message)
  
  // Copiar propriedades customizadas se existirem
  if ((error as any).code) {
    (cleanError as any).code = (error as any).code
  }
  if ((error as any).statusCode) {
    (cleanError as any).statusCode = (error as any).statusCode
  }
  
  // Suprimir completamente o stack trace
  // Definir como string vazia para que o Bun não exiba código fonte
  cleanError.stack = ''
  
  // Sobrescrever o toString para retornar apenas a mensagem
  cleanError.toString = () => error.message
  
  return cleanError
}