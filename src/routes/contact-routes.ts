import express from 'express'
import { identifyContact } from '../controllers/contacts/controller'

const router = express.Router()

router.post('/identify', identifyContact)

export default router
