# Backend para migração Firebase → PostgreSQL

## 1) Instalar dependências

```bash
cd backend
npm install
```

## 2) Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste os dados do PostgreSQL.

## 3) Criar o banco no PostgreSQL

Execute o SQL do arquivo `schema.sql`.

## 4) Rodar a API

```bash
npm run dev
```

A API ficará disponível em:

- `http://localhost:3000/health`

## 5) Endpoints principais

- `GET /api/squads`
- `POST /api/squads`
- `PUT /api/squads/:id`
- `DELETE /api/squads/:id`
- `GET /api/oncalls`
- `POST /api/oncalls`
- `PUT /api/oncalls/:id`
- `DELETE /api/oncalls/:id`
- `GET /api/cds`
- `POST /api/cds`
- `PUT /api/cds/:id`
- `DELETE /api/cds/:id`
- `GET /api/cd-contacts`
- `POST /api/cd-contacts`
- `PUT /api/cd-contacts/:id`
- `DELETE /api/cd-contacts/:id`
- `GET /api/filiais`
- `POST /api/filiais`
- `PUT /api/filiais/:id`
- `DELETE /api/filiais/:id`
- `GET /api/filial-contacts`
- `POST /api/filial-contacts`
- `PUT /api/filial-contacts/:id`
- `DELETE /api/filial-contacts/:id`
- `GET /api/logs`
- `POST /api/logs`
