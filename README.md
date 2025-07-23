# Nespress 🚀

<p align="center">
  <a href="README.pt-br.md">🇧🇷 Português Brasileiro</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/nespress.svg" alt="NPM version" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nespress">
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/t/luizfbalves/nespress">
</p>

## 📖 About

**Nespress** is an elegant wrapper for Express that allows you to use decorators to define routes, similar to NestJS. The project makes it easy to develop RESTful APIs with TypeScript, providing a simple and intuitive way to register controllers and their routes.

> **Note:** This package is under active development and may undergo changes. Beta version available for community testing and feedback.

## ✨ Features

- 🏷️ **Decorators** for defining routes and HTTP methods
- 🔄 **Automatic registration** of controllers and routes
- 💉 **Dependency injection** similar to NestJS
- 🧩 **Modular and extensible** - easy to integrate with other packages
- 📦 **Zero configuration** - start using in seconds
- 🔒 **Strong typing** with TypeScript

## 🚀 Installation

Choose your favorite package manager:

```bash
# NPM
npm install nespress

# Yarn
yarn add nespress

# Bun
bun i nespress
```

### TypeScript Configuration

Make sure to enable these options in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## 📝 Basic Usage

### Starting the server

```typescript
import { Nespress } from 'nespress'

const app = new Nespress({ controllers: [] })
app.start(3000)
```

### Creating a simple controller

```typescript
import { Controller, Get, Post, BODY, QUERY, PARAM } from 'nespress/decorators'

@Controller({ path: '/users', version: 1 })
export class UsersController {
  @Get()
  getAll() {
    return {
      statusCode: 200,
      data: ['John', 'Mary', 'Peter'],
    }
  }

  @Post()
  create(@BODY body: any) {
    return {
      statusCode: 201,
      message: 'User created',
      data: body,
    }
  }

  @Get('/:id')
  getById(@PARAM('id') id: string) {
    return {
      statusCode: 200,
      data: { id, name: 'User ' + id },
    }
  }

  @Get('/search')
  search(@QUERY('name') name: string) {
    return {
      statusCode: 200,
      data: { name },
    }
  }
}
```

### Registering the controller

```typescript
import { Nespress } from 'nespress'
import { UsersController } from './controllers/users.controller'

const app = new Nespress({
  controllers: [UsersController],
})

app.start(3000)
console.log('Server running at http://localhost:3000')
```

## 🧩 Dependency Injection

Nespress supports dependency injection in NestJS style:

```typescript
import { Controller, Get, Injectable, INJECT } from 'nespress/decorators'
import { Nespress } from 'nespress'

@Injectable()
class UserService {
  private users = ['John', 'Mary', 'Peter']

  getUsers() {
    return this.users
  }

  getUserById(id: number) {
    return this.users[id]
  }
}

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
}

const app = new Nespress({
  controllers: [UserController],
  providers: [UserService],
})

app.start(3000)
```

## 📌 Available Decorators

### Controller Decorators

- `@Controller(options)` - Defines a class as a controller
- `@Injectable()` - Marks a class as Injectable
- `@INJECT(Provider)` - Injects a provider into a property

### HTTP Method Decorators

- `@Get(path?)` - Defines a GET route
- `@Post(path?)` - Defines a POST route
- `@Put(path?)` - Defines a PUT route
- `@Delete(path?)` - Defines a DELETE route
- `@Patch(path?)` - Defines a PATCH route

### Parameter Decorators

- `@BODY` - Accesses the request body
- `@PARAM(name?)` - Accesses a URL parameter
- `@QUERY(name?)` - Accesses a query parameter
- `@HEADERS(name?)` - Accesses request headers

### Middleware Decorator

- `@Middleware(fn)` - Registers middleware for a route method

## 🧪 Advanced Examples

### Middlewares

```typescript
import { Controller, Get, Middleware } from 'nespress/decorators'

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.headers.authorization) {
    next()
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

@Controller({ path: '/admin' })
class AdminController {
  @Get('/dashboard')
  @Middleware(authMiddleware)
  getDashboard() {
    return {
      statusCode: 200,
      data: { message: 'Admin dashboard' },
    }
  }
}
```

### Nested Controllers

```typescript
@Controller({ path: '/api', version: 1 })
class ApiController {
  @Controller({ path: '/users' })
  class UsersController {
    @Get()
    getUsers() {
      return { statusCode: 200, data: ['John', 'Mary'] };
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add: awesome implementation'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📃 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ☕ and TypeScript.</p>
