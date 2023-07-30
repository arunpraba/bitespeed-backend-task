import { Request, Response } from 'express'
import { prisma } from '../db'
import { logger } from '../utils'

export const identifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body
  try {
    //Check if contact exists
    const existingContact = await prisma.contact.findFirst({
      where: {
        OR: [
          { email: { equals: email } },
          { phoneNumber: { equals: phoneNumber } },
        ],
      },
    })

    // If contact exists, update it
    if (existingContact) {
      const updatedContact = await prisma.contact.update({
        where: {
          id: existingContact.id,
        },
        data: {
          phoneNumber: phoneNumber || existingContact.phoneNumber,
          email: email || existingContact.email,
          linkedId: existingContact.linkedId || existingContact.id,
          linkPrecedence: 'secondary',
        },
      })
      const primaryContactId = updatedContact.linkedId || updatedContact.id
      const secondaryContactIds = [
        updatedContact.id,
        existingContact.id,
      ].filter((id) => id !== primaryContactId)

      res.status(200).json({
        contact: {
          primaryContactId,
          emails: [updatedContact.email, existingContact.email].filter(Boolean),
          phoneNumbers: [
            updatedContact.phoneNumber,
            existingContact.phoneNumber,
          ].filter(Boolean),
          secondaryContactIds,
        },
      })
    } else {
      // If contact does not exist, create it
      const newContact = await prisma.contact.create({
        data: {
          phoneNumber,
          email,
          linkPrecedence: 'primary',
        },
      })
      res.status(201).json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: [],
        },
      })
    }
  } catch (err) {
    logger.error('Error identifying contact:', (err as Error).stack)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
