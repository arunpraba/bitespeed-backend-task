import { config } from 'dotenv'

// Load environment variables
config()

// Import packages
import { start } from './app'
import { logger } from './utils'

start()
  .then(() => {
    logger.info('Server started successfully')
  })
  .catch((err) => {
    logger.error('Error starting server:', err)
  })

// Handle uncaught exceptions (e.g. trying to use a variable that does not exist)
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.stack)
  process.exit(1)
})

// Handle unhandled promise rejections (e.g. async/await without try/catch)
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', (err as Error).stack)
  process.exit(1)
})

// Handle SIGINT for graceful shutdown
process.on('SIGINT', async () => {
  logger.error('SIGINT received. Shutting down...')
  process.exit(0)
})
