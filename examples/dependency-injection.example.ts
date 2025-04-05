import { container } from '../src/core/inversify'
import { Controller, Get, Inject, Injectable } from '../src/decorators'

// 1. Defina um identificador para sua interface/serviço
const TYPES = {
  UserService: Symbol.for('UserService'),
}

// 2. Crie uma interface para o seu serviço (opcional, mas recomendado)
interface IUserService {
  getUsers(): string[]
}

// 3. Implemente o serviço e marque-o como injetável
@Injectable()
class UserService implements IUserService {
  private users = ['João', 'Maria', 'Pedro']

  getUsers(): string[] {
    return this.users
  }
}

// 4. Registre o serviço no container
container.bind<IUserService>(TYPES.UserService).to(UserService)

// 5. Use o decorador INJECT no seu controller para injetar o serviço
@Controller({ path: '/users', version: 1 })
class UsersController {
  // Aqui usamos o decorador INJECT para injetar o serviço
  @Inject(TYPES.UserService)
  private userService!: IUserService

  @Get('/list')
  getUsers() {
    // O userService estará disponível aqui
    return {
      statusCode: 200,
      users: this.userService.getUsers(),
    }
  }
}

// 6. Use o controller normalmente ao iniciar o Nespress
// import Nespress from '@luizfbalves/nespress';
// const app = new Nespress({ controllers: [UsersController] });
// app.start(3333);
