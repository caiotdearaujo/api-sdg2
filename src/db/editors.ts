import { encryptPassword } from '@/cryptography/password'
import prisma from '@/prisma-instance'
import ConventionalReply from '@/reply-convention'
import crypto from 'crypto'

const verifyFormat = (value: string, regex: RegExp): boolean => {
  return regex.test(value)
}

const usernameValid = (username: string): boolean => {
  return verifyFormat(username, /^[a-zA-Z0-9_.]{4,32}$/)
}

const passwordValid = (password: string): boolean => {
  return verifyFormat(
    password,
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=])[A-Za-z\d@$!%*?&=]{8,128}$/
  )
}

const userExists = async (username: string): Promise<boolean> => {
  const user = await prisma.editor.findUnique({ where: { username } })

  return user !== null
}

const generateId = (): string => {
  const length = 32
  const bytesNeeded = Math.ceil(length / 2)
  const randomBuffer = crypto.randomBytes(bytesNeeded)
  const randomHash = randomBuffer.toString('hex').slice(0, length)

  return randomHash
}

const addEditor = async (
  username: string,
  password: string
): Promise<ConventionalReply> => {
  if (!usernameValid(username)) {
    return new ConventionalReply(400, {
      error: { message: 'Invalid username format' },
    })
  }

  if (!passwordValid(password)) {
    return new ConventionalReply(400, {
      error: { message: 'Invalid password format' },
    })
  }

  if (await userExists(username)) {
    return new ConventionalReply(400, {
      error: { message: 'User already exists' },
    })
  }

  const encryptedPassword = await encryptPassword(password)
  const id = generateId()

  prisma.editor.create({ data: { id, username, password: encryptedPassword } })

  return new ConventionalReply(201, { data: {} })
}

export { addEditor }
