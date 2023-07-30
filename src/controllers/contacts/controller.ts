import { Request, Response } from 'express'
import { prisma } from '../../db'
import { logger, getUniqueValue } from '../../utils'
import {
  collectAllEmailsPhoneNumbers,
  getEmailPhoneNumberSecondaryContactIds,
  getNewContact,
} from './helper'

export const identifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body

  // Step 0: Validate request body
  if (!email && !phoneNumber) {
    return res
      .status(400)
      .json({ error: 'Either email or phoneNumber must be provided' })
  }

  try {
    /**
     * Step 1: Collect all email or phoneNumber
     */
    const { contactsByEmail, contactsByPhoneNumber } =
      await collectAllEmailsPhoneNumbers({
        email,
        phoneNumber,
      })

    /**
     * Step 2: Get all contacts with the email or phoneNumber
     * While querying db, order by linkPrecedence in descending order so that primary contact will be the first in
     * the array and secondary contacts will be the rest. this will reduce number of array operations in the next step
     */
    const existingContact = await prisma.contact.findMany({
      where: {
        OR: [
          { email: { in: contactsByEmail } },
          { phoneNumber: { in: contactsByPhoneNumber } },
        ],
      },
      orderBy: {
        // "primary" contact will be the first in the array
        linkPrecedence: 'asc',
      },
    })

    /**
     * Step 3: Get primary contacts and create new contact if it does not exist
     * */
    const primaryContacts = existingContact.filter(
      (contact) => contact.linkPrecedence === 'primary'
    )
    if (primaryContacts.length) {
      /**
       * Step 4: Check if there is more than one primary contact and if so, change the second primary contact's
       * linkPrecedence to "secondary"
       */
      if (primaryContacts.length !== 1) {
        const secondPrimaryContactItem = primaryContacts[1]
        // Change item 2's linkPrecedence to "secondary"
        await prisma.contact.update({
          where: {
            id: secondPrimaryContactItem.id,
          },
          data: {
            linkPrecedence: 'secondary',
          },
        })
      }

      const primaryContact = primaryContacts[0]

      const { emails, phoneNumbers, secondaryContactIds } =
        getEmailPhoneNumberSecondaryContactIds(existingContact)

      const newContact = await getNewContact({
        email,
        phoneNumber,
        emails,
        primaryContact,
        phoneNumbers,
      })

      res.status(201).json({
        contact: {
          primaryContactId: primaryContact.id,
          emails: getUniqueValue(emails, newContact?.email),
          phoneNumbers: getUniqueValue(phoneNumbers, newContact?.phoneNumber),
          secondaryContactIds: newContact?.id
            ? [...secondaryContactIds, newContact.id]
            : secondaryContactIds,
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
          emails: newContact.email ? [newContact.email] : [],
          phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
          secondaryContactIds: [],
        },
      })
    }
  } catch (err) {
    logger.error('Error identifying contact:', (err as Error).stack)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
