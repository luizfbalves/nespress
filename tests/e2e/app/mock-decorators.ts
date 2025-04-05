import type { NextFunction, Request, Response } from 'express'

// Decoradores simulados para testes E2E
// Mapa para armazenar metadados durante os testes
export const metadataMap = new Map<any, Map<string | symbol, any>>()

// Armazenar referência da aplicação Express
let expressApp: any = null

// Armazena as definições de rotas para registro posterior
interface RouteDefinition {
  method: string
  path: string
  handler: Function
  target: any
  middlewares: Function[]
  controllerPath: string
  controllerVersion?: number
}

const routes: RouteDefinition[] = []
const controllers: any[] = []
const injectables = new Map<any, any>()
const instanceCache = new Map<any, any>()

// Configura o mock do Reflect imediatamente
global.Reflect = {
  ...global.Reflect,
  defineMetadata: (metadataKey: any, metadataValue: any, target: any, propertyKey?: string | symbol) => {
    let targetMetadata = metadataMap.get(target)
    if (!targetMetadata) {
      targetMetadata = new Map<string | symbol, any>()
      metadataMap.set(target, targetMetadata)
    }

    const key = propertyKey ? `${String(propertyKey)}_${String(metadataKey)}` : String(metadataKey)
    targetMetadata.set(key, metadataValue)
    return true
  },

  getMetadata: (metadataKey: any, target: any, propertyKey?: string | symbol) => {
    const targetMetadata = metadataMap.get(target)
    if (!targetMetadata) return undefined

    const key = propertyKey ? `${String(propertyKey)}_${String(metadataKey)}` : String(metadataKey)
    return targetMetadata.get(key)
  },

  hasMetadata: (metadataKey: any, target: any, propertyKey?: string | symbol) => {
    const targetMetadata = metadataMap.get(target)
    if (!targetMetadata) return false

    const key = propertyKey ? `${String(propertyKey)}_${String(metadataKey)}` : String(metadataKey)
    return targetMetadata.has(key)
  },
}

// Sobrescreve funções do Reflect para testes (mantido para compatibilidade)
export function setupReflectMock() {
  // console.log('Setup do Reflect já executado no início do arquivo.')
  return true
}

// Função para registrar as rotas no Express
export function registerRoutesInExpress(app: any) {
  expressApp = app

  // console.log(`Registrando ${routes.length} rotas para ${controllers.length} controladores`)

  // Para cada rota definida
  for (const route of routes) {
    const fullPath = buildRoutePath(route)
    const middleware = route.middlewares || []

    // console.log(`Registrando rota: ${route.method} ${fullPath}`)

    // Para os logs, vamos listar todas as rotas no Express
    /* if (app._router && app._router.stack) {
      console.log('Rotas já registradas:')
      app._router.stack.forEach((layer: any) => {
        if (layer.route) {
          console.log(`${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`)
        }
      })
    } */

    // Encontra ou cria uma instância do controlador
    const controllerClass = controllers.find(
      (c) => route.target.constructor === c || route.target === c.prototype || route.target.constructor.name === c.name
    )

    if (!controllerClass) {
      // console.error(`Controlador não encontrado para a rota ${route.method} ${fullPath}`)
      // console.error(
      //   `Target: ${route.target.constructor.name}, Controladores disponíveis: ${controllers
      //     .map((c) => c.name)
      //     .join(', ')}`
      // )
      continue
    }

    let instance: any
    if (instanceCache.has(controllerClass)) {
      instance = instanceCache.get(controllerClass)
    } else {
      instance = new (controllerClass as any)()
      instanceCache.set(controllerClass, instance)
    }

    // Esta função vai atuar como handler da rota
    const routeHandler = async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Extrai os parâmetros da requisição
        const params = extractParams(req, route.handler, route.target)

        // Executa o handler
        const handlerName = route.handler.name
        // console.log(`Chamando método ${handlerName} em ${instance.constructor.name}`)

        if (!instance[handlerName]) {
          // console.error(`Método ${handlerName} não encontrado no controlador (${Object.keys(instance).join(', ')})`)
          return next()
        }

        // Executa o handler
        const result = await instance[handlerName](...params)

        // Retorna o resultado
        if (result && typeof result === 'object' && 'statusCode' in result) {
          res.status(result.statusCode).json(result)
        } else {
          res.status(200).json(result)
        }
      } catch (error: any) {
        // console.error(`Erro ao processar rota ${fullPath}: ${error.message}`)
        res.status(500).json({
          statusCode: 500,
          error: error.message,
        })
      }
    }

    // Registra a rota no Express
    app[route.method.toLowerCase()](fullPath, ...middleware, routeHandler)

    // Verifica se a rota foi registrada
    /* if (app._router && app._router.stack) {
      const routeFound = app._router.stack.some(
        (layer: any) => layer.route && layer.route.path === fullPath && layer.route.methods[route.method.toLowerCase()]
      )
      console.log(`Rota ${route.method} ${fullPath} ${routeFound ? 'registrada com sucesso' : 'NÃO foi registrada!'}`)
    } */
  }
}

// Constrói o caminho completo da rota
function buildRoutePath(route: RouteDefinition): string {
  let path = route.controllerPath || ''

  // Adiciona versão se existir
  if (route.controllerVersion) {
    path = `/v${route.controllerVersion}${path}`
    // console.log(`Adicionando prefixo de versão: /v${route.controllerVersion}`)
  }

  // Garante que os caminhos estejam formatados corretamente
  if (path && !path.startsWith('/')) {
    path = '/' + path
  }

  // Remove a barra final se existir
  if (path.endsWith('/') && path.length > 1) {
    path = path.slice(0, -1)
  }

  // Adiciona o caminho do método
  let methodPath = route.path || ''

  if (methodPath && !methodPath.startsWith('/')) {
    methodPath = '/' + methodPath
  }

  const fullPath = `${path}${methodPath}`
  // console.log(`Construindo caminho: ${route.controllerPath} + ${methodPath} = ${fullPath}`)

  return fullPath
}

// Extrai parâmetros da requisição com base nos metadados
function extractParams(req: Request, handler: Function, target: any): any[] {
  const paramTypes = Reflect.getMetadata(`${handler.name}_paramtypes`, target) || []
  const params: any[] = Array(paramTypes.length).fill(undefined)

  // Processa body
  const bodyParams = Reflect.getMetadata(`${handler.name}_body`, target) || {}
  Object.entries(bodyParams).forEach(([index, name]) => {
    params[Number(index)] = req.body
  })

  // Processa parâmetros de URL
  const urlParams = Reflect.getMetadata(`${handler.name}_param`, target) || {}
  Object.entries(urlParams).forEach(([index, name]) => {
    params[Number(index)] = req.params[name as string]
  })

  // Processa parâmetros de consulta (query)
  const queryParams = Reflect.getMetadata(`${handler.name}_query`, target) || {}
  Object.entries(queryParams).forEach(([index, name]) => {
    params[Number(index)] = req.query[name as string]
  })

  // Processa headers
  const headerParams = Reflect.getMetadata(`${handler.name}_headers`, target) || {}
  Object.entries(headerParams).forEach(([index, name]) => {
    params[Number(index)] = req.headers[name as string]
  })

  return params
}

// Obtém uma instância da classe com injeção de dependências
function getInstance<T>(Class: new (...args: any[]) => T): T {
  if (instanceCache.has(Class)) {
    return instanceCache.get(Class)
  }

  const dependencies = Reflect.getMetadata('inject', Class) || {}
  const params: any[] = []

  // Resolve dependências
  Object.entries(dependencies).forEach(([index, dependency]) => {
    if (!injectables.has(dependency)) {
      injectables.set(dependency, new (dependency as any)())
    }
    params[Number(index)] = injectables.get(dependency)
  })

  const instance = new Class(...params)
  instanceCache.set(Class, instance)
  return instance
}

// Middleware para autenticação
export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  // console.log(`Middleware de autenticação: ${authHeader}`)

  if (!authHeader) {
    return res.status(401).json({
      statusCode: 401,
      error: 'Token não fornecido',
    })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      statusCode: 401,
      error: 'Token inválido',
    })
  }

  const token = parts[1]

  // Tokens conhecidos como inválidos
  if (token === 'token_invalido_1234567890') {
    return res.status(401).json({
      statusCode: 401,
      error: 'Token inválido',
    })
  }

  // Para testes, vamos considerar válidos tokens que começam com 'token-'
  if (token && token.startsWith('token-') && token.length > 10) {
    next()
  } else {
    return res.status(401).json({
      statusCode: 401,
      error: 'Token inválido',
    })
  }
}

// Middleware para logging
export function LoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
}

// Controller decorator
export function Controller(options: { path?: string; version?: number } = {}) {
  return function (target: any) {
    const path = options.path || ''
    const version = options.version

    // console.log(`Registrando controlador ${target.name} com path=${path}, version=${version}`)

    // Adiciona metadados diretamente na classe
    target.prototype.__controller_metadata = {
      path,
      version,
    }

    // Adiciona metadados usando o Reflect (para compatibilidade)
    Reflect.defineMetadata('controller', { path, version }, target)

    // Localiza as rotas já registradas para este controlador e atualiza os caminhos
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]

      if (route.target.constructor === target || route.target === target.prototype) {
        route.controllerPath = path
        route.controllerVersion = version
        // console.log(`Atualizando rota ${route.method} ${route.path} com path=${path}, version=${version}`)
      }
    }

    // Registra o controlador
    if (!controllers.includes(target)) {
      // console.log(`Adicionando ${target.name} à lista de controladores`)
      controllers.push(target)
    }

    return target
  }
}

// Method decorators
export function createMethodDecorator(method: string) {
  return function (path: string = '') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // Obtém metadados do controlador
      const controllerMetadata =
        target.constructor.prototype.__controller_metadata ||
        Reflect.getMetadata('controller', target.constructor) ||
        {}

      /* console.log(
        `Decorator de método ${method} ${path} em ${target.constructor.name}.${propertyKey}, metadata:`,
        controllerMetadata
      ) */

      // Registra a rota
      const route = {
        method,
        path,
        handler: descriptor.value,
        target,
        middlewares: Reflect.getMetadata(`${propertyKey}_middleware`, target) || [],
        controllerPath: controllerMetadata.path || '',
        controllerVersion: controllerMetadata.version,
      }

      // console.log(`Definindo rota: ${method} ${path} para ${target.constructor.name}.${propertyKey}`)
      routes.push(route)

      return descriptor
    }
  }
}

export const Get = createMethodDecorator('GET')
export const Post = createMethodDecorator('POST')
export const Put = createMethodDecorator('PUT')
export const Delete = createMethodDecorator('DELETE')
export const Patch = createMethodDecorator('PATCH')

// Parameter decorators
export function BODY(paramName?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(`${propertyKey}_body`, target) || {}
    existingParams[parameterIndex] = paramName || 'body'
    Reflect.defineMetadata(`${propertyKey}_body`, existingParams, target)
  }
}

export function PARAM(paramName: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(`${propertyKey}_param`, target) || {}
    existingParams[parameterIndex] = paramName
    Reflect.defineMetadata(`${propertyKey}_param`, existingParams, target)
  }
}

export function QUERY(paramName: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(`${propertyKey}_query`, target) || {}
    existingParams[parameterIndex] = paramName
    Reflect.defineMetadata(`${propertyKey}_query`, existingParams, target)
  }
}

export function HEADERS(headerName: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(`${propertyKey}_headers`, target) || {}
    existingParams[parameterIndex] = headerName.toLowerCase()
    Reflect.defineMetadata(`${propertyKey}_headers`, existingParams, target)
  }
}

// Dependency Injection decorators
export function INJECT(dependency: any) {
  return function (target: any, propertyKey: string) {
    // Registra a dependência
    const deps = Reflect.getMetadata('inject', target.constructor) || {}
    deps[propertyKey] = dependency
    Reflect.defineMetadata('inject', deps, target.constructor)

    // Cria uma propriedade acessível
    Object.defineProperty(target, propertyKey, {
      get() {
        if (!injectables.has(dependency)) {
          injectables.set(dependency, new dependency())
        }
        return injectables.get(dependency)
      },
      enumerable: true,
      configurable: true,
    })
  }
}

export function INJECTABLE() {
  return function (target: any) {
    // Registra a classe como injetável
    return target
  }
}

// Middleware decorator
export function Middleware(middleware: Function) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingMiddleware = Reflect.getMetadata(`${propertyKey}_middleware`, target) || []
    existingMiddleware.push(middleware)
    Reflect.defineMetadata(`${propertyKey}_middleware`, existingMiddleware, target)
    return descriptor
  }
}
