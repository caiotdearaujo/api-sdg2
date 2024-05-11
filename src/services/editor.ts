import { encryptPassword } from '@/cryptography/password'
import prisma from '@/prisma-instance'
import ConventionalReply from '@/reply-convention'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { createToken } from '@/cryptography/jwt'

/**
 * Verifies if a given value matches a specified regular expression.
 *
 * @param value - The value to be verified.
 * @param regex - The regular expression to match against the value.
 * @returns A boolean indicating whether the value matches the regular expression.
 */
const verifyFormat = (value: string, regex: RegExp): boolean => {
  return regex.test(value)
}

/**
 * Checks if a username is valid.
 *
 * @param username - The username to be validated.
 * @returns `true` if the username is valid, `false` otherwise.
 *
 * @remarks
 * A valid username must meet the following conditions:
 * - It must contain only alphanumeric characters, underscores, and dots.
 * - It must be between 4 and 32 characters long.
 */
const usernameValid = (username: string): boolean => {
  return verifyFormat(username, /^[a-zA-Z0-9_.]{4,32}$/)
}

/**
 * Checks if a password is valid.
 *
 * @param password - The password to be validated.
 * @returns `true` if the password is valid, `false` otherwise.
 *
 * @remarks
 * A valid password must meet the following conditions:
 * - Contains at least one lowercase letter
 * - Contains at least one uppercase letter
 * - Contains at least one digit
 * - Contains at least one special character from `@$!%*?&=`
 * - Has a length between 8 and 128 characters
 */
const passwordValid = (password: string): boolean => {
  return verifyFormat(
    password,
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=])[A-Za-z\d@$!%*?&=]{8,128}$/
  )
}

/**
 * Checks if a user exists based on the provided identifier.
 *
 * @param params - The parameters for the user identification.
 * @param params.id - The user ID.
 * @param params.username - The username.
 * @returns A promise that resolves to a boolean indicating whether the user exists or not.
 * @throws An error if no identifier is provided.
 */
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

/**
 * Generates a random ID.
 *
 * @returns A randomly generated ID.
 */
const generateId = (): string => {
  const length = 32
  const bytesNeeded = Math.ceil(length / 2)
  const randomBuffer = crypto.randomBytes(bytesNeeded)
  const randomHash = randomBuffer.toString('hex').slice(0, length)

  return randomHash
}

/**
 * Adds a new editor to the system.
 *
 * @param username - The username of the editor.
 * @param password - The password of the editor.
 * @returns A promise that resolves to a `ConventionalReply` object.
 */
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

  return new ConventionalReply(201, { data: { editor: { username } } })
}

/**
 * Deletes an editor by its ID.
 *
 * @param id - The ID of the editor to delete.
 * @returns A promise that resolves to a `ConventionalReply` object.
 */
const deleteEditor = async (id: string): Promise<ConventionalReply> => {
  if (!(await userExists({ id }))) {
    return new ConventionalReply(404, {
      error: { message: 'User not found' },
    })
  }

  await prisma.editor.delete({ where: { id } })

  return new ConventionalReply(204, { data: {} })
}

/**
 * Authenticates a user by checking the provided username and password.
 * If the username or password is invalid, or if the user is not found,
 * an appropriate error response is returned. Otherwise, a token is created
 * and returned in the response.
 *
 * @param username - The username of the user to authenticate.
 * @param password - The password of the user to authenticate.
 * @returns A promise that resolves to a `ConventionalReply` object containing
 * the authentication result.
 */
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

export { addEditor, deleteEditor, login, userExists }
