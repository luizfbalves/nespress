# Nespress 🚀

<p align="center">
  <a href="README.md">🇺🇸 English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/nespress.svg" alt="NPM version" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nespress">
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/t/luizfbalves/nespress">
</p>

## 📖 Sobre

**Nespress** é um elegante wrapper para Express que permite utilizar decoradores para definir rotas, similar ao NestJS. O projeto facilita o desenvolvimento de APIs RESTful com TypeScript, fornecendo uma maneira simples e intuitiva de registrar controladores e suas rotas.

> **Nota:** Este pacote está em desenvolvimento ativo e pode sofrer alterações. Versão beta disponível para testes e feedback da comunidade.

## ✨ Funcionalidades

- 🏷️ **Decoradores** para definição de rotas e métodos HTTP
- 🔄 **Registro automático** de controladores e rotas
- 💉 **Injeção de dependências** similar ao NestJS
- 🧩 **Modular e extensível** - fácil de integrar com outros pacotes
- 📦 **Zero configuração** - comece a usar em segundos
- 🔒 **Tipagem forte** com TypeScript

## 🚀 Instalação

Escolha seu gerenciador de pacotes favorito:

```bash
# NPM
npm install nespress

# Yarn
yarn add nespress

# Bun
bun i nespress
```

### Configuração do TypeScript

Certifique-se de habilitar estas opções no seu `tsconfig.json`:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## 📝 Uso Básico

### Iniciando o servidor

```typescript
import { Nespress } from 'nespress'

const app = new Nespress({ controllers: [] })
app.start(3000)
```

### Criando um controlador simples

```typescript
import { Controller, Get, Post, BODY, QUERY, PARAM } from 'nespress/decorators'

@Controller({ path: '/users', version: 1 })
export class UsersController {
  @Get()
  getAll() {
    return {
      statusCode: 200,
      data: ['João', 'Maria', 'Pedro'],
    }
  }

  @Post()
  create(@BODY body: any) {
    return {
      statusCode: 201,
      message: 'Usuário criado',
      data: body,
    }
  }

  @Get('/:id')
  getById(@PARAM('id') id: string) {
    return {
      statusCode: 200,
      data: { id, name: 'Usuário ' + id },
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

### Registrando o controlador

```typescript
import { Nespress } from 'nespress'
import { UsersController } from './controllers/users.controller'

const app = new Nespress({
  controllers: [UsersController],
})

app.start(3000)
console.log('Servidor rodando em http://localhost:3000')
```

## 🧩 Injeção de Dependências

Nespress suporta injeção de dependências no estilo NestJS:

```typescript
import { Controller, Get, Injectable, INJECT } from 'nespress/decorators'
import { Nespress } from 'nespress'

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

## 📌 Decoradores Disponíveis

### Decoradores de Controlador

- `@Controller(options)` - Define uma classe como controlador
- `@Injectable()` - Marca uma classe como injetável
- `@INJECT(Provider)` - Injeta um provedor em uma propriedade

### Decoradores de Método HTTP

- `@Get(path?)` - Define uma rota GET
- `@Post(path?)` - Define uma rota POST
- `@Put(path?)` - Define uma rota PUT
- `@Delete(path?)` - Define uma rota DELETE
- `@Patch(path?)` - Define uma rota PATCH

### Decoradores de Parâmetro

- `@BODY` - Acessa o corpo da requisição
- `@PARAM(name?)` - Acessa um parâmetro da URL
- `@QUERY(name?)` - Acessa um parâmetro de consulta
- `@HEADERS(name?)` - Acessa os cabeçalhos da requisição

## 🧪 Exemplos Avançados

### Middlewares

```typescript
import { Controller, Get, Middleware } from 'nespress/decorators'

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.headers.authorization) {
    next()
  } else {
    res.status(401).json({ message: 'Não autorizado' })
  }
}

@Controller({ path: '/admin' })
class AdminController {
  @Get('/dashboard')
  @Middleware(authMiddleware)
  getDashboard() {
    return {
      statusCode: 200,
      data: { message: 'Painel administrativo' },
    }
  }
}
```

### Controladores Aninhados

```typescript
@Controller({ path: '/api', version: 1 })
class ApiController {
  @Controller({ path: '/users' })
  class UsersController {
    @Get()
    getUsers() {
      return { statusCode: 200, data: ['João', 'Maria'] };
    }
  }
}
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add: implementação incrível'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📃 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com ☕ e TypeScript.</p>
