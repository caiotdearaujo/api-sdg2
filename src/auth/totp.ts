import dotenv from 'dotenv'
import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthenticationHeaders, extractToken } from './headers'
import ConventionalReply from '@/reply-convention'
import speakeasy from 'speakeasy'

dotenv.config()

/**
 * Authenticates the request using Time-based One-Time Password (TOTP).
 *
 * @template R - The type of the Fastify request object.
 * @param {R} request - The Fastify request object.
 * @param {FastifyReply} reply - The Fastify reply object.
 * @returns {Promise<void | FastifyReply>} - A promise that resolves to void or a Fastify reply object.
 */
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
