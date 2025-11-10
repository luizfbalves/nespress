import pino from 'pino'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Garantir que o diretório de logs exista
const logsDir = join(process.cwd(), 'logs')
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true })
}

/**
 * Configuração do logger Pino
 * 
 * Características:
 * - Pretty print sempre habilitado para saída no console
 * - Transporte para arquivo JSON em logs/nespress.log
 * - Níveis: trace, debug, info, warn, error, fatal
 * - Nível configurável via LOG_LEVEL (padrão: info)
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      {
        // Pretty print para console
        target: 'pino-pretty',
        level: process.env.LOG_LEVEL || 'info',
        options: {
          colorize: true,
          translateTime: 'SYS:dd/mm/yyyy, HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
          singleLine: false,
        },
      },
      {
        // Arquivo JSON para logs persistentes
        target: 'pino/file',
        level: process.env.LOG_LEVEL || 'info',
        options: {
          destination: join(logsDir, 'nespress.log'),
          mkdir: true,
        },
      },
    ],
  },
})

/**
 * Logger principal do Nespress
 * 
 * @example
 * // Log básico
 * logger.info('Servidor iniciado')
 * 
 * // Log com contexto adicional
 * logger.info({ userId: 123, action: 'login' }, 'Usuário autenticado')
 * 
 * // Log de erro
 * logger.error({ err: error, context: 'auth' }, 'Falha na autenticação')
 */
export { logger }

/**
 * Função auxiliar para logs de sucesso
 * Compatibilidade com o padrão anterior do nespress
 */
export const logSuccess = (message: string, context?: object) => {
  logger.info({ ...context, level: 'success' }, message)
}

/**
 * Função auxiliar para logs de erro formatados
 * Mantém compatibilidade com a estrutura anterior
 */
export const logError = (
  error: Error,
  options?: {
    context?: string
    suggestions?: string[]
    showStack?: boolean
  }
) => {
  const { context, suggestions, showStack = false } = options || {}
  
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

