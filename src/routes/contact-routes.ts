import express from 'express'
import { identifyContact } from '../controllers/contact-controller'

const router = express.Router()

router.post('/identify', identifyContact)

export default router
