import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import type { Express } from 'express'
import type { Server } from 'http'
import request from 'supertest'
import { NespressApp } from './app/app'

describe('Testes E2E - Controlador de Autenticação', () => {
  let app: Express
  let server: Server

  beforeAll(() => {
    const nespressApp = new NespressApp(3003)
    app = nespressApp.getExpressApp()
    server = nespressApp.start()

    // Garantir que o servidor tenha tempo para iniciar
    return new Promise((resolve) => setTimeout(resolve, 100))
  })

  afterAll(() => {
    return new Promise<void>((resolve) => {
      server.close(() => {
        resolve()
      })
    })
  })

  test('Deve fazer login com credenciais válidas', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'usuario1@example.com',
      password: 'senha123',
    })

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(response.body.data.token).toBeDefined()
    expect(response.body.data.user).toBeDefined()
    expect(response.body.data.user.email).toBe('usuario1@example.com')
  })

  test('Deve rejeitar login com credenciais inválidas', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'invalido@example.com',
      password: 'senha_errada',
    })

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBe('Credenciais inválidas')
  })

  test('Deve validar um token válido', async () => {
    // Primeiro faz login para obter um token
    const loginResponse = await request(app).post('/auth/login').send({
      email: 'usuario1@example.com',
      password: 'senha123',
    })

    const token = loginResponse.body.data.token

    // Depois valida o token
    const validateResponse = await request(app).get('/auth/validate').set('Authorization', `Bearer ${token}`)

    expect(validateResponse.status).toBe(200)
    expect(validateResponse.body.statusCode).toBe(200)
    expect(validateResponse.body.data.valid).toBe(true)
  })

  test('Deve rejeitar um token inválido', async () => {
    const invalidToken = 'token_invalido_1234567890'

    const response = await request(app).get('/auth/validate').set('Authorization', `Bearer ${invalidToken}`)

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBe('Token inválido')
  })

  test('Deve rejeitar validação sem token', async () => {
    const response = await request(app).get('/auth/validate')

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBe('Token inválido')
  })

  test('Deve rejeitar validação com token mal formatado', async () => {
    const response = await request(app).get('/auth/validate').set('Authorization', 'Token_Sem_Bearer')

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBe('Token inválido')
  })
})
