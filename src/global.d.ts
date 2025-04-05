export type RouteMetadataProps = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  path: string
  handler: (...params: Parameters) => any
}

export type QueryParams = {
  index: number
  name?: string
}

export type LogParams = {
  message: string | object | number | boolean
  type?: 'default' | 'success' | 'error' | 'warning'
  jumpLine?: boolean
}

export type ControllerMetadataParams = {
  version?: number
  path?: string
}

export type NesPressConfigParams = {
  controllers: any[]
  providers?: any[]
}
