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
import { BODY, CONTROLLER, POST } from '@luizfbalves/nespress/decorators'

@CONTROLLER({ path: '/users', version: 1 })
export class UsersController {
  constructor() {}

  @POST('/all')
  index(@BODY body: any) {
    return {
      statusCode: 200,
      body,
    }
  }
  
  @GET('/findbyphone')
  findByPhone(@QUERY('phone') phone: string) {
      return {
          statusCode: 200,
          phone
      }
  }
  
  //just leave @QUERY decorator empty if you want to get all the query params
  @GET('/findbyphoneorid')
  findByPhone(@QUERY params: any) {
      return {
          statusCode: 200,
          query: {
              id: params.id,
              phone: params.phone
          }
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
