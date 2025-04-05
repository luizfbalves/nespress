import type { Express, NextFunction, Request, Response } from 'express'
import express from 'express'
import { AuthController, ProductController, UserController } from './controllers'
import { LoggingMiddleware, registerRoutesInExpress, setupReflectMock } from './mock-decorators'
import { LoggerService } from './services'

// Configura o mock do Reflect para simulação dos decoradores
setupReflectMock()

export class NespressApp {
  private app: Express
  private port: number
  private logger: LoggerService
  private controllers: any[] = []

  constructor(port = 3000) {
    this.app = express()
    this.port = port
    this.logger = new LoggerService()

    this.configureMiddleware()
    this.registerControllers()
    this.setupErrorHandling()
  }

  private configureMiddleware() {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    // Middleware global de logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      LoggingMiddleware(req, res, next)
    })

    // CORS simples
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      next()
    })
  }

  private registerControllers() {
    // Instanciar controladores e guardar as instâncias
    this.controllers = [new UserController(), new ProductController(), new AuthController()]

    // Registrar rotas no Express usando nossa função de registro
    try {
      registerRoutesInExpress(this.app)
    } catch (error) {
      // console.error('Erro ao registrar rotas:', error)
    }

    // Rota padrão para teste de saúde
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    // Rota para erro 404
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        statusCode: 404,
        error: 'Rota não encontrada',
        path: req.originalUrl,
      })
    })
  }

  private setupErrorHandling() {
    // Middleware global de tratamento de erros
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      this.logger.error(`Erro: ${err.message}`)

      res.status(500).json({
        statusCode: 500,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'production' ? undefined : err.message,
      })
    })
  }

  public getExpressApp(): Express {
    return this.app
  }

  public start() {
    return this.app.listen(this.port, () => {
      this.logger.log(`Servidor rodando na porta ${this.port}`)
    })
  }
}
