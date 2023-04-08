// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// You can access the database using Prisma
import { PrismaClient } from '@prisma/client'

type ReqData = {
  username: string,
  email: string,
  password: string
}

type RspData = {
  success: boolean,
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RspData>
) {
  if (req.method !== 'POST') {
    return res.status(400).json({ success: false, message: 'Invalid request method' })
  }

  const registrationData: ReqData = req.body

  // Perform any necessary validation on the registration data
  if (!registrationData.username || !registrationData.email || !registrationData.password) {
    return res.status(400).json({ success: false, message: 'Missing required registration data' })
  }

  try {
    const prisma = new PrismaClient()
  
    // check if user exists
    const isUsernameExist = await prisma.user.findUnique({
      where: {
        username: registrationData.username
      }
    })
  
    if (isUsernameExist) {
      return res.status(400).json({ success: false, message: 'Username already exists!' })
    }
  
  
    // check if the email is already in use
    const isEmailExist = await prisma.user.findUnique({
      where: {
        email:registrationData.email
      }
    })
  
    if (isEmailExist) {
      return res.status(400).json({ success: false, message: 'Email already exists!' })
    }


    await prisma.user.create({
      data: {
        username: registrationData.username,
        email:    registrationData.email,
        password: registrationData.password,
        permission: 0
      }
    })

    return res.status(200).json({ success: true, message: 'User registration successful' })
  } catch (error) {
    // Handle any errors that occur during the user registration process
    console.error(error)
    return res.status(500).json({ success: false, message: 'An error occurred while registering the user' })
  }
}
