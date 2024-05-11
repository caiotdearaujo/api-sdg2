import { FastifyReply, FastifyRequest } from 'fastify'
import { AuthenticationHeaders, extractToken } from './headers'
import { verifyToken } from '@/cryptography/jwt'
import ConventionalReply from '@/reply-convention'

/**
 * Authenticates the request using JSON Web Tokens (JWT).
 *
 * @template R - The type of the Fastify request object.
 * @param {R} request - The Fastify request object.
 * @param {FastifyReply} reply - The Fastify reply object.
 * @returns {Promise<void | FastifyReply>} - A promise that resolves to void or a Fastify reply object.
 */
const authByJWT = async <
  R extends FastifyRequest<{ Headers: AuthenticationHeaders }>,
>(
  request: R,
  reply: FastifyReply
): Promise<void | FastifyReply> => {
  const token = extractToken(request)

  if (!token) {
    reply.code(401)
    return new ConventionalReply(401, {
      error: { message: 'Unauthorized' },
    }).send(reply)
  }

  const result = await verifyToken(token)

  if (result instanceof ConventionalReply) {
    return result.send(reply)
  }
}

export default authByJWT
