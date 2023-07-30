# Bitespeed Backend Task: Identity Reconciliation

This is a simple identity reconciliation service that keep track of a customer's identity across multiple purchases.

# [Demo URL](https://bitespeed-backend-task-kpx7.onrender.com/)

## Getting Started

To get started with the Task, follow the requirements and setup instructions provided below.

1. Clone the repository and navigate to the project directory.
2. Install the dependencies using npm:

```bash
  npm install
```

3. Run the dev server:

```bash
  npm run dev
```

4. The server should now be running on http://localhost:3000 or from env file.

5. To create migrations, run:

```bash
  npm run migrate:dev
```

6. To build the project, run:

```bash
  npm run build
```

7. To run the project, run:

```bash
  npm run start
```

8. Note: sample `env-example` file is provided convert it to `.env` file and fill the values.

## Stack

1. Framework - Express
2. Database - Postgres
3. ORM - Prisma
4. Language - Typescript
5. Logger - Winston (Log file can be found in at root 'error.log', 'combined.log')

## API Endpoint

### POST /identify

This endpoint receives HTTP POST requests with JSON body containing either `email` or `phoneNumber` or `both`.

#### Request Body

```json
{
  "email": "string",
  "phoneNumber": "string"
}
```

#### Response Body

```json
{
  "contact": {
    "primaryContactId": "number",
    "emails": "string[]",
    "phoneNumbers": "string[]",
    "secondaryContactIds": "number[]"
  }
}
```
