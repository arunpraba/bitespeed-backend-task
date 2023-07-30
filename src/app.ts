import express, { Request, Response } from 'express'

// Load other modules
import { PORT } from './config'
import { prisma } from './db'
import conactRouter from './routes/contact-routes'

const app = express()
app.use(express.json())

// Define routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!')
})

app.use(conactRouter)

export const start = async () => {
  // connect to database
  await prisma.$connect()
  // start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}
