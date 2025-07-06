import type { LogParams } from '@/global'

export const log = (props: LogParams) => {
  const { type, message, jumpLine } = props

  if (jumpLine) console.log('')

  const timestamp = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const prefix = `\x1b[37m[${process.pid}] - [${timestamp}]\x1b[0m`

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
