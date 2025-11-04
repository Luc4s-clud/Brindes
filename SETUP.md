# Guia de Configuração do Projeto

Este guia irá ajudá-lo a configurar o projeto do zero.

## Pré-requisitos

- Node.js 18 ou superior instalado
- npm ou yarn instalado
- Git instalado (opcional)

## Passo a Passo

### 1. Configurar o Back-end

```bash
# Navegar para a pasta do back-end
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (copie o .env.example se existir)
# Ou crie manualmente com (MySQL):
# PORT=3001
# DATABASE_URL="mysql://usuario:senha@localhost:3306/brindes"
# NODE_ENV=development

# Gerar o cliente Prisma
npx prisma generate

# Criar o banco de dados e executar migrações
npx prisma migrate dev --name init

# Iniciar o servidor em modo desenvolvimento
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

**Teste a API:**
- Acesse `http://localhost:3001/api/health` no navegador
- Você deve ver: `{"status":"ok","message":"API está funcionando!"}`

### 2. Configurar o Front-end

Abra um novo terminal e execute:

```bash
# Navegar para a pasta do front-end
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará rodando em `http://localhost:5173`

### 3. Verificar se tudo está funcionando

1. Acesse `http://localhost:5173` no navegador
2. Você deve ver a página inicial do sistema
3. Navegue pelas páginas:
   - Brindes
   - Categorias
   - Movimentações

## Comandos Úteis

### Back-end

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm start

# Abrir Prisma Studio (visualizador de banco de dados)
npx prisma studio
```

### Front-end

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## Banco de Dados (MySQL)

O projeto está configurado para usar MySQL.

### Criar banco e usuário (exemplo)

```sql
CREATE DATABASE brindes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'brindes_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON brindes.* TO 'brindes_user'@'localhost';
FLUSH PRIVILEGES;
```

Atualize o `.env` com a URL de conexão:

```
DATABASE_URL="mysql://brindes_user:senha_forte_aqui@localhost:3306/brindes"
```

Em seguida, gere o cliente e rode as migrações:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Solução de Problemas

### Erro: "Cannot find module '@prisma/client'"
Execute: `npx prisma generate` na pasta `backend`

### Erro: "Port already in use"
Altere a porta no arquivo `.env` do backend ou no `vite.config.ts` do frontend

### Erro: "Database does not exist"
Execute: `npx prisma migrate dev` na pasta `backend`

### Erro de CORS
Verifique se o backend está rodando e se o proxy está configurado corretamente no `vite.config.ts`

## Próximos Passos

1. ✅ Projeto configurado e funcionando
2. 📝 Personalizar as cores e estilos conforme sua marca
3. 🔐 Implementar autenticação (se necessário)
4. 📊 Adicionar gráficos e relatórios
5. 🚀 Deploy da aplicação

## Dúvidas?

Consulte a documentação das tecnologias:
- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Vite](https://vitejs.dev/)

