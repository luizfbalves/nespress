import { INJECTABLE } from './mock-decorators'

export interface User {
  id: number
  name: string
  email: string
  role?: string
}

export interface Product {
  id: number
  name: string
  price: number
  stock: number
  description?: string
}

@INJECTABLE()
export class UserService {
  private users: User[] = [
    { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'admin' },
    { id: 2, name: 'Maria Santos', email: 'maria@example.com', role: 'user' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@example.com', role: 'user' },
    { id: 4, name: 'Usuário 1', email: 'usuario1@example.com', role: 'admin' },
  ]

  getAllUsers(): User[] {
    return this.users
  }

  getUserById(id: number): User | undefined {
    return this.users.find((user) => user.id === id)
  }

  createUser(userData: Omit<User, 'id'>): User {
    const newId = Math.max(...this.users.map((u) => u.id), 0) + 1
    const newUser = { id: newId, ...userData }
    this.users.push(newUser)
    return newUser
  }

  updateUser(id: number, userData: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return undefined

    const updatedUser = { ...this.users[index], ...userData }
    this.users[index] = updatedUser
    return updatedUser
  }

  deleteUser(id: number): boolean {
    const initialLength = this.users.length
    this.users = this.users.filter((u) => u.id !== id)
    return this.users.length !== initialLength
  }
}

@INJECTABLE()
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'Laptop', price: 1200, stock: 10 },
    { id: 2, name: 'Smartphone', price: 800, stock: 15 },
    { id: 3, name: 'Headphones', price: 100, stock: 20 },
  ]

  getAllProducts(): Product[] {
    return this.products
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((product) => product.id === id)
  }

  createProduct(productData: Omit<Product, 'id'>): Product {
    const newId = Math.max(...this.products.map((p) => p.id), 0) + 1
    const newProduct = { id: newId, ...productData }
    this.products.push(newProduct)
    return newProduct
  }

  updateProduct(id: number, productData: Partial<Product>): Product | undefined {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return undefined

    const updatedProduct = { ...this.products[index], ...productData }
    this.products[index] = updatedProduct
    return updatedProduct
  }

  deleteProduct(id: number): boolean {
    const initialLength = this.products.length
    this.products = this.products.filter((p) => p.id !== id)
    return this.products.length !== initialLength
  }

  getProductsInStock(): Product[] {
    return this.products.filter((p) => p.stock > 0)
  }

  getProductsByPriceRange(min: number, max: number): Product[] {
    return this.products.filter((p) => p.price >= min && p.price <= max)
  }
}

@INJECTABLE()
export class AuthService {
  private validTokens: string[] = ['valid-token-123']

  isValidToken(token: string): boolean {
    // Tokens específicos que sabemos que são inválidos
    if (token === 'token_invalido_1234567890') {
      return false
    }

    // Para testes, consideramos válidos tokens que começam com 'token-' e têm comprimento suficiente
    return Boolean(token && token.startsWith('token-') && token.length > 10)
  }

  generateToken(userId: number): string {
    const token = `token-${userId}-${Date.now()}`
    this.validTokens.push(token)
    return token
  }
}

@INJECTABLE()
export class LoggerService {
  log(message: string): void {}

  error(message: string): void {}
}
