# Testes para o Nespress 🧪

## Estrutura de Pastas

```
/tests
  /unit            - Testes unitários
    /core          - Testes para o core
    /decorators    - Testes para os decoradores
    /common        - Testes para utilitários comuns
  /integration     - Testes de integração
  /e2e             - Testes end-to-end
```

## Executando os Testes

```bash
# Executar todos os testes
bun test

# Executar com watch mode
bun test --watch

# Executar com coverage
bun test --coverage
```

## Estratégia de Testes

### Testes Unitários

#### Core (NespressCore)

- Teste a inicialização do servidor
- Teste o registro de controladores
- Teste a configuração do Express

#### Decoradores

- Teste cada decorador isoladamente
- Verifique se os metadados são corretamente adicionados

#### Injeção de Dependências

- Teste se os providers são registrados corretamente
- Teste se a injeção funciona como esperado

### Testes de Integração

- Teste o fluxo completo de requisição/resposta
- Teste middlewares e plugins
- Teste diferentes casos de uso para rotas

### Testes E2E

- Teste a API completa com supertest
- Simule requisições HTTP reais

## Mocks e Helpers

Para facilitar os testes, usamos algumas abordagens:

1. **Metadata Mocking** - Sobrescrevemos `Reflect.metadata` para testes isolados
2. **Express Mocking** - Criamos mocks simples para Express
3. **Container Mocking** - Simulamos o container de injeção de dependências

## Exemplo de Teste

```typescript
// Teste para verificar se os metadados são corretamente adicionados pelo decorador @Controller
import { describe, it, expect } from 'vitest'
import { Controller } from '../../src/decorators'

describe('@Controller', () => {
  it('deve adicionar metadados corretos na classe', () => {
    @Controller({ path: '/teste' })
    class TesteController {}

    const metadata = Reflect.getMetadata('controller:metadata', TesteController)

    expect(metadata).toBeDefined()
    expect(metadata.path).toBe('/teste')
  })
})
```
