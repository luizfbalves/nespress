import type { Request, Response } from 'express'
import express from 'express'
import { NespressApp } from './app'

// Cria uma rota básica para verificação
const app = express()
app.get('/teste', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Rota de teste funcionando!' })
})

// Inicia o app Nespress
const nespressApp = new NespressApp(4000)
const expressApp = nespressApp.getExpressApp()

// Tenta definir uma rota diretamente no Express
expressApp.get('/teste-direto', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Rota direta funcionando!' })
})

// Inicia o servidor
const server = nespressApp.start()
