import { FastifyReply, FastifyRequest } from 'fastify'
import { AuthenticationHeaders, extractToken } from './headers'
import { verifyToken } from '@/cryptography/jwt'
import ConventionalReply from '@/reply-convention'

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

  try {
    await verifyToken(token)
  } catch {
    return new ConventionalReply(401, {
      error: { message: 'Unauthorized' },
    }).send(reply)
  }
}

export default authByJWT
