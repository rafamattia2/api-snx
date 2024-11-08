# API Project - Work in Progress

🚧 **Este projeto está em andamento** 🚧

Este repositório contém o desenvolvimento de uma API RESTful com Node.js, Express, Sequelize, PostgreSQL e MongoDB. A API está sendo construída para gerenciar posts e comentários, e estará equipada com autenticação JWT. No momento, a aplicação está em fase de configuração e implementação de funcionalidades principais.

## Tecnologias Usadas

- **Node.js** com **Express**: Para criar os endpoints da API.
- **Sequelize**: ORM para abstração de dados com PostgreSQL.
- **MongoDB**: Banco de dados NoSQL utilizado para autenticação (registro de usuários, login, etc).
- **JWT (JSON Web Token)**: Para autenticação segura nas rotas da API.
- **Docker**: Para containerização da aplicação, garantindo um ambiente consistente e fácil de deploy.

## Funcionalidades em Andamento

- [x] **Configuração inicial** do projeto com Node.js, Express e Sequelize.
- [x] **Health check** para monitorar a saúde da API e a conectividade com bancos de dados.
- [ ] **Criação de endpoints de Posts** (Criação, leitura, atualização e exclusão).
- [ ] **Sistema de comentários**: Cada post poderá ter comentários associados.
- [ ] **Autenticação JWT** para todas as rotas.
- [ ] **Documentação com Posman** (futura).

## Como Rodar o Projeto

1. **Clonar o repositório**:

   ```bash
   git clone https://github.com/username/project-name.git
   cd project-name
   ```

2. **Instalar dependências**:

   ```bash
   npm install
   ```

3. **Configuração de variáveis de ambiente**:
   Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

   ```
   JWT_SECRET=your_jwt_secret_value
   MONGO_URI=mongodb://mongodb:27017/authDB
   POSTGRES_URI=postgres://user:password@postgres:5432/api-snx-postgres
   ```

4. **Rodar o projeto com Docker Compose**:

   ```bash
    docker-compose up --build
   ```

5. **Testar a rota Health Check**:

   - Após o projeto estar em execução, acesse o seguinte endpoint, em seu navegador, para verificar a saúde da API e a conexão com os bancos de dados

     ```bash
       http://localhost:3000/api/v1/health
     ```
