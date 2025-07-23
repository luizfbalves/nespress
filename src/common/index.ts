import type { LogParams } from '@/global'

export const log = ({ type = 'default', message, jumpLine }: LogParams) => {

  jumpLine === true && console.log('')

  const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
  const processId = process.pid
  const prefix = `\x1b[37m[${processId}] - [${date}]\x1b[0m`
  const formatted = typeof message === 'string' ? message : JSON.stringify(message)

  switch (type) {
    case 'success':
      console.log(`${prefix} \x1b[32m%s\x1b[0m`, formatted) // Verde para sucesso
      break

    case 'error':
      console.log(`${prefix} \x1b[31m%s\x1b[0m`, formatted) // Vermelho para erro
      break

    case 'warning':
      console.log(`${prefix} \x1b[33m%s\x1b[0m`, formatted) // Amarelo para aviso
      break

    default:
      console.log(`${prefix} ${formatted}`) // Padrão sem cor
      break
  }
}

export { handleError } from './error-handler'
