import { JWE, JWK } from 'node-jose'
import server from '@/fastify-instance'

let key: JWK.Key
;(async () => {
  key = await JWK.createKey('oct', 256, { alg: 'A256GCM' })
})()

const createToken = async (id: string) => {
  const jwt = server.jwt.sign({ id })
  const token = await JWE.createEncrypt({ format: 'compact' }, key)
    .update(jwt)
    .final()
  return token
}

const verifyToken = async (token: string) => {
  const result = await JWE.createDecrypt(key).decrypt(token)
  const jwt = result.plaintext.toString()
  server.jwt.verify(jwt)
}

const decodeToken = async (token: string) => {
  const result = await JWE.createDecrypt(key).decrypt(token)
  const jwt = result.plaintext.toString()
  const decodedToken = server.jwt.decode(jwt) as { id: string }
  return decodedToken.id
}

export { createToken, verifyToken, decodeToken }
