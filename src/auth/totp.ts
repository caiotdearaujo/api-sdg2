import dotenv from 'dotenv'
import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthenticationHeaders, extractToken } from './headers'
import ConventionalReply from '@/reply-convention'
import speakeasy from 'speakeasy'

dotenv.config()

const authByTOTP = async <
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

  const isTokenValid = speakeasy.totp.verify({
    secret: process.env.TOTP_SECRET as string,
    encoding: 'base32',
    token,
    window: 1,
  })

  if (!isTokenValid) {
    reply.code(401)
    return new ConventionalReply(401, {
      error: { message: 'Unauthorized' },
    }).send(reply)
  }
}

export default authByTOTP
