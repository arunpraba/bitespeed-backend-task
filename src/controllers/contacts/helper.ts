import { Contact } from '@prisma/client'
import { prisma } from '../../db'
import { ContactInfo } from './types'

export const getNewContact = async ({
  email,
  phoneNumber,
  emails,
  phoneNumbers,
  primaryContact,
}: {
  email: string
  phoneNumber: string
  emails: string[]
  primaryContact: Contact
  phoneNumbers: string[]
}) => {
  let newContact = null

  /**
   * Step 1: Check if email or phone number is not exist in the database and if so, create a new contact
   */
  if (email && !emails.includes(email)) {
    newContact = await prisma.contact.create({
      data: {
        phoneNumber: phoneNumber,
        email: email,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      },
    })
  } else if (phoneNumber && !phoneNumbers.includes(phoneNumber)) {
    newContact = await prisma.contact.create({
      data: {
        phoneNumber: phoneNumber,
        email: email,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      },
    })
  }
  return newContact
}

export const getEmailPhoneNumberSecondaryContactIds = (
  existingContact: Contact[]
): {
  emails: string[]
  phoneNumbers: string[]
  secondaryContactIds: number[]
} => {
  /* Format the contact */
  return existingContact.reduce(
    (acc: ContactInfo, contact: Contact, index: number) => {
      if (contact.email && acc.emails.indexOf(contact.email) === -1) {
        acc.emails.push(contact.email)
      }
      if (
        contact.phoneNumber &&
        acc.phoneNumbers.indexOf(contact.phoneNumber) === -1
      ) {
        acc.phoneNumbers.push(contact.phoneNumber)
      }
      if (index !== 0) {
        acc.secondaryContactIds.push(contact.id)
      }
      return acc
    },
    {
      emails: [],
      phoneNumbers: [],
      secondaryContactIds: [],
    } as ContactInfo
  )
}

export const collectAllEmailsPhoneNumbers = async ({
  email,
  phoneNumber,
}: {
  email: string
  phoneNumber: string
}): Promise<{ contactsByEmail: string[]; contactsByPhoneNumber: string[] }> => {
  let contactsByEmail: string[] = []
  let contactsByPhoneNumber: string[] = []

  if (email) {
    const contacts = await prisma.contact.findMany({
      where: {
        email: { equals: email },
      },
    })
    contacts.forEach((contact) => {
      if (contact.email && !contactsByEmail.includes(contact.email)) {
        contactsByEmail.push(contact.email)
      }
      if (
        contact.phoneNumber &&
        !contactsByPhoneNumber.includes(contact.phoneNumber)
      ) {
        contactsByPhoneNumber.push(contact.phoneNumber)
      }
    })
  }
  if (phoneNumber) {
    const contacts = await prisma.contact.findMany({
      where: {
        phoneNumber: { equals: phoneNumber },
      },
    })
    contacts.forEach((contact) => {
      if (contact.email && !contactsByEmail.includes(contact.email)) {
        contactsByEmail.push(contact.email)
      }
      if (
        contact.phoneNumber &&
        !contactsByPhoneNumber.includes(contact.phoneNumber)
      ) {
        contactsByPhoneNumber.push(contact.phoneNumber)
      }
    })
  }

  return { contactsByEmail, contactsByPhoneNumber }
}
