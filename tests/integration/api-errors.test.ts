import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import 'reflect-metadata'
import { Controller, Get, Injectable, Inject } from '../../src/decorators'
import { Nespress } from '../../src/main'

// Serviço que vai causar erro
@Injectable()
class ErrorService {
  throwError() {
    throw new Error('Erro de reflect-metadata ao acessar metadados')
  }
}

@Controller('/test-errors')
class ErrorController {
  constructor(@Inject(ErrorService) private errorService: ErrorService) {}

  @Get('/reflect-error')
  reflectError() {
    throw new Error('Cannot read property of undefined at Reflect.getMetadata')
  }

  @Get('/service-error')
  serviceError() {
    return this.errorService.throwError()
  }

  @Get('/generic-error')
  genericError() {
    throw new Error('Erro genérico da aplicação')
  }
}

describe('API Error Messages UX', () => {
  let app: any

  beforeAll(async () => {
    const nespress = new Nespress({
      controllers: [ErrorController],
      providers: [ErrorService]
    })
    app = nespress.start(0) // Porta aleatória
  })

  it('deve retornar erro formatado para reflect-metadata', async () => {
    const response = await request(app)
      .get('/test-errors/reflect-error')
      .expect(500)

    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('suggestions')
    expect(Array.isArray(response.body.suggestions)).toBe(true)
    expect(response.body.suggestions.length).toBeGreaterThan(0)
  })

  it('deve retornar erro formatado para erro genérico', async () => {
    const response = await request(app)
      .get('/test-errors/generic-error')
      .expect(500)

    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toBe('Erro genérico da aplicação')
  })

  it('deve incluir stack trace apenas em desenvolvimento', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const response = await request(app)
      .get('/test-errors/service-error')
      .expect(500)

    // Em development, deve ter stack trace
    if (process.env.NODE_ENV === 'development') {
      expect(response.body).toHaveProperty('stack')
    }

    process.env.NODE_ENV = originalEnv
  })

  afterAll(() => {
    // Cleanup
  })
})