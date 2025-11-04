# Schema do Banco de Dados - Sistema de Gestão de Brindes

## ✅ Melhorias Implementadas

### 1. **Enums para Padronização**
Criados enums para garantir consistência e facilitar validações:

- `PerfilUsuario`: MARKETING, GERENTE, SOLICITANTE, DIRETOR
- `StatusSolicitacao`: PENDENTE, APROVADA, REJEITADA, ENTREGUE, CANCELADA
- `StatusAprovacao`: APROVADA, REJEITADA
- `StatusRecomendacao`: PENDENTE, APROVADA, REJEITADA
- `TipoMovimentacao`: ENTRADA, SAIDA

### 2. **Índices para Performance**
Adicionados índices estratégicos em campos frequentemente consultados:

- **Brinde**: codigo, categoria, ativo, quantidade
- **Usuario**: email, perfil, ativo
- **Movimentacao**: brindeId, tipo, createdAt
- **Solicitacao**: solicitanteId, centroCustoId, status, createdAt
- **ItemSolicitacao**: solicitacaoId, brindeId
- **Aprovacao**: solicitacaoId, aprovadorId, status
- **CentroCusto**: setor, ativo
- **Recomendacao**: status, categoria, createdAt

### 3. **Campos Adicionais Importantes**

#### Brinde
- ✅ `codigo` agora é único (evita duplicatas)
- ✅ Campos de foto, especificações, validade, estoque mínimo

#### Solicitacao
- ✅ `numeroSolicitacao` único para rastreamento (ex: SOL-2024-001)
- ✅ `dataEntrega` para registrar quando foi entregue
- ✅ Status usando enum

#### ItemSolicitacao
- ✅ `quantidadeEntregue` para controlar entregas parciais

#### Aprovacao
- ✅ `nivelAprovacao` para aprovações em cascata (1 = Gerente, 2 = Diretor)

#### CentroCusto
- ✅ `limitePorSetor` adicionado

#### Recomendacao
- ✅ `aprovadoPor` para rastrear quem aprovou/rejeitou

## 📊 Estrutura Completa do Schema

### Modelos Principais (8)

1. **Brinde** - Catálogo de brindes
2. **Categoria** - Categorias de brindes
3. **Movimentacao** - Entradas e saídas de estoque
4. **Usuario** - Sistema de usuários
5. **CentroCusto** - Gestão de orçamentos
6. **Solicitacao** - Solicitações de brindes
7. **ItemSolicitacao** - Itens de cada solicitação
8. **Aprovacao** - Sistema de aprovação
9. **Recomendacao** - Sugestões de novos brindes

## 🔄 Relacionamentos

```
Usuario 1:1 CentroCusto (gerente responsável)
Usuario 1:N Solicitacao (solicitante)
Usuario 1:N Aprovacao (aprovador)
CentroCusto 1:N Solicitacao
Solicitacao 1:N ItemSolicitacao
Solicitacao 1:N Aprovacao
Brinde 1:N Movimentacao
Brinde 1:N ItemSolicitacao
```

## 📝 Próximos Passos

### 1. Criar Migração
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name sistema_completo
```

### 2. Atualizar Controllers Existentes
Os controllers de movimentações precisam ser atualizados para usar `TipoMovimentacao.ENTRADA` e `TipoMovimentacao.SAIDA` ao invés de strings.

### 3. Validações Importantes
- Gerar `numeroSolicitacao` automaticamente (ex: SOL-2024-001)
- Validar limites de orçamento antes de criar solicitação
- Validar estoque disponível antes de aprovar
- Validar permissões por perfil

## 🎯 Funcionalidades Suportadas pelo Schema

✅ Catálogo completo de brindes com fotos e especificações
✅ Controle de estoque com alertas de mínimo e validade
✅ Sistema de usuários com perfis e permissões
✅ Centros de custo com orçamentos e limites flexíveis
✅ Fluxo completo de solicitação e aprovação
✅ Histórico de movimentações e valores pagos
✅ Sistema de recomendações
✅ Rastreamento completo (quem, quando, onde)

## ⚠️ Observações Importantes

1. **Código único**: O campo `codigo` do Brinde agora é único, então se houver duplicatas no Excel, será necessário ajustar antes de importar.

2. **Enum vs String**: Os controllers existentes de movimentação usam strings "entrada"/"saida". Será necessário atualizar para usar `TipoMovimentacao.ENTRADA` e `TipoMovimentacao.SAIDA`.

3. **Número de Solicitação**: Será necessário criar uma função para gerar automaticamente o `numeroSolicitacao` no formato SOL-YYYY-NNN.

4. **Hash de Senha**: O campo `senha` do Usuario deve armazenar hash (usar bcrypt), nunca senha em texto plano.

