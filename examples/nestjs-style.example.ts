import { Controller, Get, Inject, Injectable } from '../src/decorators'
import { Nespress } from '../src/main'

// 1. Crie os serviços e marque-os como injetáveis

@Injectable()
class UserService {
  private users = ['João', 'Maria', 'Pedro']

  getUsers() {
    return this.users
  }

  getUserById(id: number) {
    return this.users[id]
  }
}

@Injectable()
class ProductService {
  private products = ['Café', 'Açúcar', 'Leite']

  getProducts() {
    return this.products
  }
}

// 2. Crie os controllers e injete os serviços como dependências

@Controller({ path: '/users', version: 1 })
class UserController {
  @Inject(UserService)
  private userService!: UserService

  @Get('/list')
  getUsers() {
    return {
      statusCode: 200,
      data: this.userService.getUsers(),
    }
  }

  @Get('/user/:id')
  getUserById(id: string) {
    return {
      statusCode: 200,
      data: this.userService.getUserById(parseInt(id)),
    }
  }
}

@Controller({ path: '/products', version: 1 })
class ProductController {
  @Inject(ProductService)
  private productService!: ProductService

  @Get('/list')
  getProducts() {
    return {
      statusCode: 200,
      data: this.productService.getProducts(),
    }
  }
}

// 3. Configure o Nespress com controllers e providers
const app = new Nespress({
  controllers: [UserController, ProductController],
  providers: [UserService, ProductService],
})

// 4. Inicie o servidor
app.start(3333)

/*
 * Agora você pode acessar:
 * - GET /v1/users/list
 * - GET /v1/users/user/:id
 * - GET /v1/products/list
 */
