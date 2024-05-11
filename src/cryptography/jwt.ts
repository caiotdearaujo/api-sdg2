import { JWE, JWK } from 'node-jose'
import server from '@/fastify-instance'
import { userExists } from '@/services/editor'
import ConventionalReply from '@/reply-convention'

let key: JWK.Key

const generateKey = async () => {
  key = await JWK.createKey('oct', 256, { alg: 'A256GCM' })
}

generateKey()

/**
 * Creates a JWT token for the given user ID.
 *
 * @param id - The user ID.
 * @returns The JWT token.
 */
const createToken = async (id: string) => {
  const jwt = server.jwt.sign({ id })
  const token = await JWE.createEncrypt({ format: 'compact' }, key)
    .update(jwt)
    .final()
  return token
}

const getIdFromJWT = (jwt: string): string => {
  const decoded = server.jwt.decode(jwt) as { id: string }
  return decoded.id
}

/**
 * Verifies the authenticity of a JSON Web Token (JWT).
 *
 * @param token - The JWT to be verified.
 * @returns A Promise that resolves to void or a ConventionalReply object.
 */
const verifyToken = async (
  token: string
): Promise<void | ConventionalReply> => {
  let jwt: string

  try {
    const result = await JWE.createDecrypt(key).decrypt(token)
    jwt = result.plaintext.toString()
    server.jwt.verify(jwt)
  } catch {
    return new ConventionalReply(401, { error: { message: 'Unauthorized' } })
  }

  const id = getIdFromJWT(jwt)

  if (!(await userExists({ id }))) {
    return new ConventionalReply(401, { error: { message: 'User deleted' } })
  }
}

/**
 * Decodes a JWT token and returns the ID extracted from it.
 *
 * @param token The JWT token to decode.
 * @returns A Promise that resolves to the ID extracted from the JWT token, or an empty string if decoding fails.
 */
const decodeToken = async (token: string): Promise<string> => {
  try {
    const result = await JWE.createDecrypt(key).decrypt(token)
    const jwt = result.plaintext.toString()
    return getIdFromJWT(jwt)
  } catch {
    return ''
  }
}

export { createToken, verifyToken, decodeToken }
