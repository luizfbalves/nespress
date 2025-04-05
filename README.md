# Nespress

<p align="center">
  <img src="https://img.shields.io/npm/v/nespress.svg" alt="NPM version" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
  <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/nespress">
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/t/luizfbalves/nespress">
</p>

> **Note:** This package is under constant changes and is not yet ready for production use.

Nespress is a wrapper around Express that allows you to use decorators to define routes. It also includes a simple way to register controllers and their routes.

## Features

- Decorators for defining routes
- Automatic registration of controllers and their routes
- Support for Express request and response objects
- Dependency Injection support similar to NestJS

## Installation

You can install Nespress using npm:

```bash
npm install @luizfbalves/nespress
```

```bash
bun i @luizfbalves/nespress
```

```bash
yarn add @luizfbalves/nespress
```

Now you have to make sure you enabled this two tsconfig options to allow decorators.

```bash
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
```

## how to use

You can start the nesspress like this:

```typescript
import Nespress from '@luizfbalves/nespress'

const app = new Nespress({ controllers: [] })

app.start(3333)
```

But the api will warn you that you dont have controllers yet so you do this:

```typescript
import { BODY, Controller, Post } from '@luizfbalves/nespress/decorators'

@Controller({ path: '/users', version: 1 })
export class UsersController {
  constructor() {}

  @Post('/all')
  index(@BODY body: any) {
    return {
      statusCode: 200,
      body,
    }
  }

  @Get('/findbyphone')
  findByPhone(@QUERY('phone') phone: string) {
    return {
      statusCode: 200,
      phone,
    }
  }

  //just leave @QUERY decorator empty if you want to get all the query params
  @Get('/findbyphoneorid')
  findByPhone(@QUERY params: any) {
    return {
      statusCode: 200,
      query: {
        id: params.id,
        phone: params.phone,
      },
    }
  }
}
```

after creating a controller class go back to your main/index file and do this:

```typescript
import Nespress from '@luizfbalves/nespress'
import { UsersController } from './test'

const app = new Nespress({ controllers: [UsersController] })

app.start(3333)
```

thats it youre ready to go!

## Using Dependency Injection (NestJS Style)

Nespress supports dependency injection with a pattern similar to NestJS, where you register providers and controllers in the application configuration:

```typescript
import { Controller, Get, INJECTABLE, INJECT } from '@luizfbalves/nespress/decorators'
import { Nespress } from '@luizfbalves/nespress'

// 1. Create services and mark them as injectable
@INJECTABLE()
class UserService {
  private users = ['João', 'Maria', 'Pedro']

  getUsers() {
    return this.users
  }

  getUserById(id: number) {
    return this.users[id]
  }
}

@INJECTABLE()
class ProductService {
  private products = ['Café', 'Açúcar', 'Leite']

  getProducts() {
    return this.products
  }
}

// 2. Create controllers and inject services
@Controller({ path: '/users', version: 1 })
class UserController {
  @INJECT(UserService)
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
  @INJECT(ProductService)
  private productService!: ProductService

  @Get('/list')
  getProducts() {
    return {
      statusCode: 200,
      data: this.productService.getProducts(),
    }
  }
}

// 3. Configure Nespress with controllers and providers
const app = new Nespress({
  controllers: [UserController, ProductController],
  providers: [UserService, ProductService],
})

// 4. Start the server
app.start(3333)
```

With this approach, Nespress will:

1. Register all providers in the dependency injection container
2. Register all controllers in the container
3. Automatically resolve and inject dependencies when routes are called

This makes your application more modular and testable, following the principles of inversion of control.
