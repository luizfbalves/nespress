export function safeDecorator(decorator: Function) {
  return (...args: any[]) => {
    try {
      decorator(...args)
    } catch (error) {
      console.error(`DecoratorError => ${(error as Error).message}`)
      throw error
    }
  }
}
