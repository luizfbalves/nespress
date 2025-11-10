export type RouteMetadataProps = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  path: string
  handler: (...params: any[]) => unknown
}

export type QueryParams = {
  index: number
  name?: string
}

export type ControllerMetadataParams = {
  version?: number
  path?: string
}

export type ClassType<T = any> = new (...args: any[]) => T

export type NesPressConfigParams<C extends ClassType = ClassType, P extends ClassType = ClassType> = {
  controllers: C[]
  providers?: P[]
}
