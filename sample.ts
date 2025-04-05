import { Controller, Injectable, InjectParam } from '@/decorators/'
import { Get } from '@/decorators/verbs.decorator'
import { Nespress } from '@/main'

@Injectable()
class UserService {
  getUsers() {
    return ['John', 'Jane', 'Jim']
  }
}

@Controller({ path: '/users', version: 1 })
class UserController {
  constructor(@InjectParam(UserService) private userService: UserService) {}

  @Get('/list')
  getUsers() {
    return this.userService.getUsers()
  }
}

const app = new Nespress({
  controllers: [UserController],
  providers: [UserService],
})

app.start(3333)
