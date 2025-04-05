import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import type { Express } from 'express'
import type { Server } from 'http'
import request from 'supertest'
import { NespressApp } from './app/app'

describe('Testes E2E - Controlador de Usuários', () => {
  let app: Express
  let server: Server
  let authToken: string

  beforeAll(() => {
    const nespressApp = new NespressApp(3001)
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

  test('Deve obter uma lista de usuários com GET /v1/users', async () => {
    const response = await request(app).get('/v1/users')

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThan(0)
  })

  test('Deve obter um usuário específico com GET /v1/users/:id', async () => {
    const userId = 1
    const response = await request(app).get(`/v1/users/${userId}`)

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.id).toBe(userId)
  })

  test('Deve retornar 404 ao buscar um usuário inexistente', async () => {
    const invalidUserId = 9999
    const response = await request(app).get(`/v1/users/${invalidUserId}`)

    expect(response.status).toBe(404)
    expect(response.body.statusCode).toBe(404)
    expect(response.body.error).toBe('Usuário não encontrado')
  })

  test('Deve autenticar e obter um token', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'usuario1@example.com', password: 'senha123' })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.data.token).toBeDefined()

    // Salvar o token para os próximos testes
    authToken = loginResponse.body.data.token
  })

  test('Deve criar um novo usuário com POST /v1/users quando autenticado', async () => {
    const newUser = {
      name: 'Novo Usuário',
      email: 'novousuario@example.com',
      role: 'user',
    }

    const response = await request(app).post('/v1/users').set('Authorization', `Bearer ${authToken}`).send(newUser)

    expect(response.status).toBe(201)
    expect(response.body.statusCode).toBe(201)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.name).toBe(newUser.name)
    expect(response.body.data.email).toBe(newUser.email)
    expect(response.body.data.id).toBeDefined()
  })

  test('Deve negar acesso a POST /v1/users sem autenticação', async () => {
    const newUser = {
      name: 'Usuário Rejeitado',
      email: 'rejeitado@example.com',
      role: 'user',
    }

    const response = await request(app).post('/v1/users').send(newUser)

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBeDefined()
  })

  test('Deve atualizar um usuário existente com PUT /v1/users/:id quando autenticado', async () => {
    const userToUpdate = {
      name: 'Usuário Atualizado',
      email: 'atualizado@example.com',
    }

    const response = await request(app)
      .put('/v1/users/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send(userToUpdate)

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.name).toBe(userToUpdate.name)
    expect(response.body.data.email).toBe(userToUpdate.email)
  })

  test('Deve negar acesso a PUT /v1/users/:id sem autenticação', async () => {
    const userToUpdate = {
      name: 'Usuário Rejeitado',
      email: 'rejeitado@example.com',
    }

    const response = await request(app).put('/v1/users/1').send(userToUpdate)

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBeDefined()
  })

  test('Deve deletar um usuário existente com DELETE /v1/users/:id quando autenticado', async () => {
    // Primeiro criamos um usuário para depois deletá-lo
    const newUser = {
      name: 'Usuário para Deletar',
      email: 'delete@example.com',
      role: 'user',
    }

    const createResponse = await request(app)
      .post('/v1/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newUser)

    const userId = createResponse.body.data.id

    const deleteResponse = await request(app).delete(`/v1/users/${userId}`).set('Authorization', `Bearer ${authToken}`)

    expect(deleteResponse.status).toBe(204)
  })

  test('Deve negar acesso a DELETE /v1/users/:id sem autenticação', async () => {
    const response = await request(app).delete('/v1/users/2')

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBeDefined()
  })
})
