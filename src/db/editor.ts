import { encryptPassword } from '@/cryptography/password'
import prisma from '@/prisma-instance'
import ConventionalReply from '@/reply-convention'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { createToken } from '@/cryptography/jwt'

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

const userExists = async (params: {
  id?: string
  username?: string
}): Promise<boolean> => {
  const { id, username } = params

  if (id) {
    const user = await prisma.editor.findUnique({ where: { id } })

    return user !== null
  }

  if (username) {
    const user = await prisma.editor.findUnique({ where: { username } })

    return user !== null
  }

  throw new Error('No identifier provided')
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

  if (await userExists({ username })) {
    return new ConventionalReply(400, {
      error: { message: 'User already exists' },
    })
  }

  const encryptedPassword = await encryptPassword(password)
  const id = generateId()

  await prisma.editor.create({
    data: { id, username, password: encryptedPassword },
  })

  return new ConventionalReply(201, { data: {} })
}

const deleteEditor = async (id: string): Promise<ConventionalReply> => {
  if (!(await userExists({ id }))) {
    return new ConventionalReply(404, {
      error: { message: 'User not found' },
    })
  }

  await prisma.editor.delete({ where: { id } })

  return new ConventionalReply(204, { data: {} })
}

const login = async (
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

  const user = await prisma.editor.findUnique({ where: { username } })

  if (user === null) {
    return new ConventionalReply(404, {
      error: { message: 'User not found' },
    })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return new ConventionalReply(401, {
      error: { message: 'Incorrect password' },
    })
  }

  const token = await createToken(user.id)

  return new ConventionalReply(200, { data: { token } })
}

export { addEditor, deleteEditor, login }
