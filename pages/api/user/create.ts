// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Credentials, Response } from '../../../types/authentication'

import { PrismaClient } from '@prisma/client'

export default async function create(
    req: NextApiRequest,
    res: NextApiResponse<Response>
) {
    if (req.method !== 'POST') {
        // no need to return "success" or "failure" -> status code is enough
        return res.status(400).json({ message: 'Invalid request method, POST required' })
    }

    const credentials: Credentials = req.body

    if (!credentials.username || !credentials.email || !credentials.password) {
        return res.status(400).json({ message: 'Missing required credentials' })
    }

    try {
        const prisma = new PrismaClient()

        // check if user exists
        const isUsernameExist = await prisma.user.findUnique({
            where: {
                username: credentials.username
            }
        })

        if (isUsernameExist) {
            return res.status(400).json({ message: 'Username already exists!' })
        }

        // check if the email is already in use
        const isEmailExist = await prisma.user.findUnique({
            where: {
                email: credentials.email
            }
        })

        if (isEmailExist) {
            return res.status(400).json({ message: 'Email already exists!' })
        }

        await prisma.user.create({
            data: {
                username: credentials.username,
                email: credentials.email,
                password: credentials.password,
                role_mask: 1
            }
        })
        return res.status(200).json({ message: 'User registration successful' })
    } catch (error) {
        // Handle any errors that occur during the user registration process
        console.error(error)
        return res.status(500).json({ message: 'An error occurred while registering the user' })
    }
}
