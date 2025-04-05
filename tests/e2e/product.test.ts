import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import type { Express } from 'express'
import type { Server } from 'http'
import request from 'supertest'
import { NespressApp } from './app/app'

describe('Testes E2E - Controlador de Produtos', () => {
  let app: Express
  let server: Server
  let authToken: string

  beforeAll(async () => {
    const nespressApp = new NespressApp(3002)
    app = nespressApp.getExpressApp()
    server = nespressApp.start()

    // Garantir que o servidor tenha tempo para iniciar
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Obter token de autenticação para os testes
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'usuario1@example.com', password: 'senha123' })

    authToken = loginResponse.body.data.token
  })

  afterAll(() => {
    return new Promise<void>((resolve) => {
      server.close(() => {
        resolve()
      })
    })
  })

  test('Deve obter uma lista de produtos com GET /v1/products', async () => {
    const response = await request(app).get('/v1/products')

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThan(0)
  })

  test('Deve filtrar produtos em estoque com GET /v1/products?inStock=true', async () => {
    const response = await request(app).get('/v1/products?inStock=true')

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)

    // Verifica se todos os produtos retornados estão em estoque
    const allInStock = response.body.data.every((product: any) => product.stock > 0)
    expect(allInStock).toBe(true)
  })

  test('Deve filtrar produtos por faixa de preço com GET /v1/products?minPrice=X&maxPrice=Y', async () => {
    const minPrice = 50
    const maxPrice = 150

    const response = await request(app).get(`/v1/products?minPrice=${minPrice}&maxPrice=${maxPrice}`)

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)

    // Verifica se todos os produtos estão na faixa de preço especificada
    const allInPriceRange = response.body.data.every(
      (product: any) => product.price >= minPrice && product.price <= maxPrice
    )
    expect(allInPriceRange).toBe(true)
  })

  test('Deve obter um produto específico com GET /v1/products/:id', async () => {
    const productId = 1
    const response = await request(app).get(`/v1/products/${productId}`)

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.id).toBe(productId)
  })

  test('Deve retornar 404 ao buscar um produto inexistente', async () => {
    const invalidProductId = 9999
    const response = await request(app).get(`/v1/products/${invalidProductId}`)

    expect(response.status).toBe(404)
    expect(response.body.statusCode).toBe(404)
    expect(response.body.error).toBe('Produto não encontrado')
  })

  test('Deve criar um novo produto com POST /v1/products quando autenticado', async () => {
    const newProduct = {
      name: 'Produto Teste E2E',
      description: 'Um produto criado durante teste E2E',
      price: 99.99,
      stock: 50,
    }

    const response = await request(app)
      .post('/v1/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newProduct)

    expect(response.status).toBe(201)
    expect(response.body.statusCode).toBe(201)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.name).toBe(newProduct.name)
    expect(response.body.data.price).toBe(newProduct.price)
    expect(response.body.data.id).toBeDefined()
  })

  test('Deve negar acesso a POST /v1/products sem autenticação', async () => {
    const newProduct = {
      name: 'Produto Rejeitado',
      description: 'Este produto não deve ser criado',
      price: 49.99,
      stock: 25,
    }

    const response = await request(app).post('/v1/products').send(newProduct)

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBeDefined()
  })

  test('Deve atualizar um produto existente com PUT /v1/products/:id quando autenticado', async () => {
    const productToUpdate = {
      name: 'Produto Atualizado',
      description: 'Descrição atualizada via teste E2E',
      price: 129.99,
    }

    const response = await request(app)
      .put('/v1/products/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send(productToUpdate)

    expect(response.status).toBe(200)
    expect(response.body.statusCode).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.name).toBe(productToUpdate.name)
    expect(response.body.data.price).toBe(productToUpdate.price)
  })

  test('Deve negar acesso a PUT /v1/products/:id sem autenticação', async () => {
    const productToUpdate = {
      name: 'Produto Rejeitado',
      price: 999.99,
    }

    const response = await request(app).put('/v1/products/1').send(productToUpdate)

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBeDefined()
  })

  test('Deve deletar um produto existente com DELETE /v1/products/:id quando autenticado', async () => {
    // Primeiro criamos um produto para depois deletá-lo
    const newProduct = {
      name: 'Produto para Deletar',
      description: 'Este produto será deletado em seguida',
      price: 19.99,
      stock: 5,
    }

    const createResponse = await request(app)
      .post('/v1/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newProduct)

    const productId = createResponse.body.data.id

    const deleteResponse = await request(app)
      .delete(`/v1/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(deleteResponse.status).toBe(204)
  })

  test('Deve negar acesso a DELETE /v1/products/:id sem autenticação', async () => {
    const response = await request(app).delete('/v1/products/2')

    expect(response.status).toBe(401)
    expect(response.body.statusCode).toBe(401)
    expect(response.body.error).toBeDefined()
  })
})
