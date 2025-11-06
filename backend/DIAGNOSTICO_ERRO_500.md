# 🔍 Diagnóstico de Erro 500 no Login

Este guia ajuda a identificar e resolver o erro 500 ao fazer login.

## 🚀 Passo a Passo para Diagnosticar

### 1. Execute o Script de Verificação

```bash
cd backend
npm run check:setup
```

Este script verifica:
- ✅ Variáveis de ambiente configuradas
- ✅ Conexão com banco de dados
- ✅ Tabelas do banco criadas
- ✅ Usuários existentes
- ✅ Senhas hasheadas corretamente

### 2. Verifique os Logs do Servidor

Quando você tenta fazer login, verifique o console do servidor backend. Os logs agora mostrarão:
- ❌ Erro de conexão com banco de dados
- ❌ Erro ao comparar senha
- ❌ Erro ao gerar token JWT
- ❌ Outros erros com stack trace completo

### 3. Problemas Comuns e Soluções

#### ❌ **Problema: Banco de Dados não Conectado**

**Sintomas:**
- Erro: "Erro de conexão com o banco de dados"
- Log mostra erro de conexão

**Solução:**
1. Verifique se o MySQL está rodando:
   ```bash
   # Windows (PowerShell)
   Get-Service -Name MySQL*
   
   # Ou verifique no MySQL Workbench
   ```

2. Verifique o arquivo `.env`:
   ```env
   DATABASE_URL="mysql://usuario:senha@localhost:3306/brindes"
   ```

3. Teste a conexão:
   ```bash
   cd backend
   npx prisma studio
   ```

4. Se necessário, recrie as migrações:
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```

#### ❌ **Problema: Tabela Usuario não Existe**

**Sintomas:**
- Erro relacionado a tabela não encontrada

**Solução:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

#### ❌ **Problema: Nenhum Usuário Cadastrado**

**Sintomas:**
- Script de verificação mostra 0 usuários

**Solução:**
Crie um usuário administrador:
```bash
cd backend
npm run create:admin
```

#### ❌ **Problema: Senha não Hasheada**

**Sintomas:**
- Erro: "Erro de configuração: senha inválida"
- Log mostra: "Senha do usuário não está hasheada corretamente"

**Solução:**
1. Verifique os usuários no banco:
   ```bash
   npx prisma studio
   ```

2. Se a senha estiver em texto plano, recrie o usuário ou atualize:
   ```bash
   npm run create:admin
   ```

#### ❌ **Problema: JWT_SECRET não Configurado**

**Sintomas:**
- Erro ao gerar token JWT

**Solução:**
Adicione no arquivo `.env`:
```env
JWT_SECRET=seu_secret_jwt_super_seguro_aqui
JWT_EXPIRES_IN=7d
```

### 4. Verificar Configuração Completa

#### Arquivo `.env` deve conter:

```env
PORT=3001
DATABASE_URL="mysql://usuario:senha@localhost:3306/brindes"
NODE_ENV=development
JWT_SECRET=seu_secret_jwt_aqui
JWT_EXPIRES_IN=7d
```

#### Ordem de Execução Correta:

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Configurar .env (copie de ENV_EXAMPLE.txt)

# 3. Gerar Prisma Client
npx prisma generate

# 4. Rodar migrações
npx prisma migrate dev

# 5. (Opcional) Criar usuário admin
npm run create:admin

# 6. Verificar setup
npm run check:setup

# 7. Iniciar servidor
npm run dev
```

### 5. Testar Login Manualmente

Você pode testar o login diretamente via curl ou Postman:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","senha":"suasenha"}'
```

### 6. Verificar Logs Detalhados

Com as melhorias implementadas, os logs agora mostram:
- Tipo de erro específico
- Mensagem de erro detalhada
- Stack trace (em desenvolvimento)

Verifique o console do servidor backend ao fazer login.

## 📞 Próximos Passos

1. Execute: `npm run check:setup`
2. Veja os logs do servidor ao tentar login
3. Compare com os problemas comuns acima
4. Se o problema persistir, verifique os logs detalhados no console

## 🔧 Melhorias Implementadas

- ✅ Logs mais detalhados no controller de autenticação
- ✅ Verificação de conexão com banco
- ✅ Validação de senha hasheada
- ✅ Tratamento de erros específicos
- ✅ Script de diagnóstico automático

