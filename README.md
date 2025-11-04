# Sistema de Gerenciamento de Brindes

Sistema completo para gerenciamento de brindes com back-end e front-end separados.

## 🚀 Tecnologias Utilizadas

### Back-end
- **Node.js** com **Express** - Servidor web robusto e flexível
- **TypeScript** - Tipagem estática para maior segurança no código
- **Prisma ORM** - ORM moderno para trabalhar com banco de dados
- **MySQL** - Banco de dados

### Front-end
- **React** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápida e moderna
- **React Router** - Roteamento para SPA
- **Axios** - Cliente HTTP para comunicação com API

## 📁 Estrutura do Projeto

```
Brindes/
├── backend/          # API REST
│   ├── src/
│   │   ├── routes/   # Rotas da API
│   │   ├── controllers/ # Lógica de negócio
│   │   ├── models/    # Modelos de dados
│   │   ├── middleware/ # Middlewares
│   │   └── utils/     # Utilitários
│   └── prisma/        # Schema do banco de dados
│
└── frontend/         # Interface React
    ├── src/
    │   ├── components/ # Componentes React
    │   ├── pages/      # Páginas da aplicação
    │   ├── services/   # Serviços de API
    │   ├── hooks/      # Custom hooks
    │   └── utils/      # Utilitários
    └── public/         # Arquivos estáticos
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Back-end

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Front-end

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará rodando em `http://localhost:5173`

## 📝 Scripts Disponíveis

### Back-end
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor compilado
- `npx prisma studio` - Abre o Prisma Studio para visualizar dados

### Front-end
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção

## 🔧 Configuração do Banco de Dados (MySQL)

O projeto usa Prisma ORM com MySQL. Para configurar:

1. Crie o banco e usuário (exemplo):
   ```sql
   CREATE DATABASE brindes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'brindes_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
   GRANT ALL PRIVILEGES ON brindes.* TO 'brindes_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
2. Crie o arquivo `backend/.env` com:
   ```
   PORT=3001
   DATABASE_URL="mysql://brindes_user:senha_forte_aqui@localhost:3306/brindes"
   NODE_ENV=development
   ```
3. Gere o cliente e rode as migrações:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## 📚 Funcionalidades Planejadas

- ✅ Cadastro de brindes
- ✅ Listagem de brindes
- ✅ Edição e exclusão
- ✅ Controle de estoque
- ✅ Categorização
- 🔄 Histórico de movimentações
- 🔄 Sistema de usuários e permissões

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

