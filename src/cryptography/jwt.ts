import { JWE, JWK } from 'node-jose'
import server from '@/fastify-instance'
import { userExists } from '@/services/editor'
import ConventionalReply from '@/reply-convention'

let key: JWK.Key

const generateKey = async () => {
  key = await JWK.createKey('oct', 256, { alg: 'A256GCM' })
}

generateKey()

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

const decodeToken = async (token: string): Promise<string> => {
  const result = await JWE.createDecrypt(key).decrypt(token)
  const jwt = result.plaintext.toString()
  return getIdFromJWT(jwt)
}

export { createToken, verifyToken, decodeToken }
