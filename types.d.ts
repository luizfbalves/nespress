// Declaração global para estender Function com propriedade __isController
declare global {
  interface Function {
    __isController?: boolean
  }
}

export {}

