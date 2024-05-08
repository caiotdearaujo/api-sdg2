import { JWE, JWK } from 'node-jose'
import server from '@/fastify-instance'
import { userExists } from '@/db/editor'
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

const getIdByJWT = (jwt: string): string => {
  const decoded = server.jwt.decode(jwt) as { id: string }
  return decoded.id
}

const verifyToken = async (
  token: string
): Promise<void | ConventionalReply> => {
  const result = await JWE.createDecrypt(key).decrypt(token)
  const jwt = result.plaintext.toString()

  try {
    server.jwt.verify(jwt)
  } catch (err) {
    if (err instanceof Error) {
      console.error(err)
    }
    return new ConventionalReply(401, { error: { message: 'Unauthorized' } })
  }

  const id = getIdByJWT(jwt)

  if (!(await userExists({ id }))) {
    return new ConventionalReply(401, { error: { message: 'User deleted' } })
  }
}

const decodeToken = async (token: string) => {
  const result = await JWE.createDecrypt(key).decrypt(token)
  const jwt = result.plaintext.toString()
  return getIdByJWT(jwt)
}

export { createToken, verifyToken, decodeToken }
