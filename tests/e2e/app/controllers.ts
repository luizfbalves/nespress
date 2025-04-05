import {
  AuthMiddleware,
  BODY,
  Controller,
  Delete,
  Get,
  HEADERS,
  INJECTABLE,
  Middleware,
  PARAM,
  Post,
  Put,
  QUERY,
} from './mock-decorators'
import { AuthService, LoggerService, ProductService, UserService } from './services'

// Desativando os erros do linter sobre tipos de retorno
/* eslint-disable @typescript-eslint/no-explicit-any */

@INJECTABLE()
@Controller({ path: '/users', version: 1 })
export class UserController {
  constructor(
    private userService: UserService = new UserService(),
    private logger: LoggerService = new LoggerService()
  ) {
    // console.log('UserController instanciado')
  }

  @Get()
  getAllUsers(): any {
    this.logger.log('Obtendo todos os usuários')
    return {
      statusCode: 200,
      data: this.userService.getAllUsers(),
    }
  }

  @Get('/:id')
  getUserById(@PARAM('id') id: string): any {
    const userId = parseInt(id, 10)
    const user = this.userService.getUserById(userId)

    if (!user) {
      return {
        statusCode: 404,
        error: 'Usuário não encontrado',
      }
    }

    return {
      statusCode: 200,
      data: user,
    }
  }

  @Post()
  @Middleware(AuthMiddleware)
  createUser(@BODY() body: any): any {
    try {
      const newUser = this.userService.createUser(body)
      this.logger.log(`Usuário criado: ${newUser.id}`)

      return {
        statusCode: 201,
        data: newUser,
      }
    } catch (error: any) {
      return {
        statusCode: 400,
        error: error.message,
      }
    }
  }

  @Put('/:id')
  @Middleware(AuthMiddleware)
  updateUser(@PARAM('id') id: string, @BODY() body: any): any {
    const userId = parseInt(id, 10)
    const updatedUser = this.userService.updateUser(userId, body)

    if (!updatedUser) {
      return {
        statusCode: 404,
        error: 'Usuário não encontrado',
      }
    }

    return {
      statusCode: 200,
      data: updatedUser,
    }
  }

  @Delete('/:id')
  @Middleware(AuthMiddleware)
  deleteUser(@PARAM('id') id: string): any {
    const userId = parseInt(id, 10)
    const deleted = this.userService.deleteUser(userId)

    if (!deleted) {
      return {
        statusCode: 404,
        error: 'Usuário não encontrado',
      }
    }

    return {
      statusCode: 204,
      data: null,
    }
  }
}

@INJECTABLE()
@Controller({ path: '/products', version: 1 })
export class ProductController {
  constructor(
    private productService: ProductService = new ProductService(),
    private logger: LoggerService = new LoggerService()
  ) {
    // console.log('ProductController instanciado')
  }

  @Get()
  getAllProducts(
    @QUERY('inStock') inStock?: string,
    @QUERY('minPrice') minPrice?: string,
    @QUERY('maxPrice') maxPrice?: string
  ): any {
    this.logger.log('Obtendo todos os produtos')

    // Filtragem por estoque
    if (inStock === 'true') {
      return {
        statusCode: 200,
        data: this.productService.getProductsInStock(),
      }
    }

    // Filtragem por faixa de preço
    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice)
      const max = parseFloat(maxPrice)

      return {
        statusCode: 200,
        data: this.productService.getProductsByPriceRange(min, max),
      }
    }

    // Retorna todos os produtos
    return {
      statusCode: 200,
      data: this.productService.getAllProducts(),
    }
  }

  @Get('/:id')
  getProductById(@PARAM('id') id: string): any {
    const productId = parseInt(id, 10)
    const product = this.productService.getProductById(productId)

    if (!product) {
      return {
        statusCode: 404,
        error: 'Produto não encontrado',
      }
    }

    return {
      statusCode: 200,
      data: product,
    }
  }

  @Post()
  @Middleware(AuthMiddleware)
  createProduct(@BODY() body: any): any {
    try {
      const newProduct = this.productService.createProduct(body)
      this.logger.log(`Produto criado: ${newProduct.id}`)

      return {
        statusCode: 201,
        data: newProduct,
      }
    } catch (error: any) {
      return {
        statusCode: 400,
        error: error.message,
      }
    }
  }

  @Put('/:id')
  @Middleware(AuthMiddleware)
  updateProduct(@PARAM('id') id: string, @BODY() body: any): any {
    const productId = parseInt(id, 10)
    const updatedProduct = this.productService.updateProduct(productId, body)

    if (!updatedProduct) {
      return {
        statusCode: 404,
        error: 'Produto não encontrado',
      }
    }

    return {
      statusCode: 200,
      data: updatedProduct,
    }
  }

  @Delete('/:id')
  @Middleware(AuthMiddleware)
  deleteProduct(@PARAM('id') id: string): any {
    const productId = parseInt(id, 10)
    const deleted = this.productService.deleteProduct(productId)

    if (!deleted) {
      return {
        statusCode: 404,
        error: 'Produto não encontrado',
      }
    }

    return {
      statusCode: 204,
      data: null,
    }
  }
}

@INJECTABLE()
@Controller({ path: '/auth' })
export class AuthController {
  constructor(
    private authService: AuthService = new AuthService(),
    private userService: UserService = new UserService()
  ) {
    // console.log('AuthController instanciado')
  }

  @Post('/login')
  login(@BODY() body: { email: string; password: string }): any {
    // Simplificação - em um caso real haveria validação de senha
    const user = this.userService.getAllUsers().find((u) => u.email === body.email)

    if (!user) {
      return {
        statusCode: 401,
        error: 'Credenciais inválidas',
      }
    }

    const token = this.authService.generateToken(user.id)

    return {
      statusCode: 200,
      data: {
        token,
        user,
      },
    }
  }

  @Get('/validate')
  validateToken(@HEADERS('authorization') auth: string): any {
    const token = auth?.split(' ')[1]

    if (!token || !this.authService.isValidToken(token)) {
      return {
        statusCode: 401,
        error: 'Token inválido',
      }
    }

    return {
      statusCode: 200,
      data: {
        valid: true,
      },
    }
  }
}
