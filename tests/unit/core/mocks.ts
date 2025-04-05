// Mocks para os testes do Core
export const mockApp = {
  use: () => {},
  get: () => {},
  post: () => {},
  put: () => {},
  delete: () => {},
  patch: () => {},
  set: () => {},
  listen: (port: number, callback?: Function) => {
    callback && callback()
    return mockApp
  },
}

export const mockExpress = () => mockApp
mockExpress.json = () => {}
mockExpress.text = () => {}
mockExpress.urlencoded = () => {}

export const mockContainer = {
  isBound: () => false,
  get: () => ({}),
}

export const mockLog = () => {}
