import type { LogParams } from '@/global'

export const log = (props: LogParams) => {
  const { type, message, jumpLine } = props

  jumpLine === true && console.log('')

  const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())

  // TODO adicionar um prefixo com data e hora e id do processo no Node.js
  const processId = process.pid // ID do processo no Node.js
  const prefix = `\x1b[37m[${processId}] - [${date}]\x1b[0m` // Branco para a data e ID

  switch (type) {
    case 'success':
      console.log(`${prefix} \x1b[32m%s\x1b[0m`, message) // Verde para sucesso
      break

    case 'error':
      console.log(`${prefix} \x1b[31m%s\x1b[0m`, message) // Vermelho para erro
      break

    case 'warning':
      console.log(`${prefix} \x1b[33m%s\x1b[0m`, message) // Amarelo para aviso
      break

    default:
      console.log(`${prefix} ${message}`) // Padrão sem cor
      break
  }
}
