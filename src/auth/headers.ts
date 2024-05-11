import { FastifyRequest, FastifySchema } from 'fastify'

interface AuthenticationHeaders {
  authorization: string
}

const authenticationSchema: FastifySchema = {
  headers: {
    type: 'object',
    required: ['authorization'],
    properties: {
      authorization: { type: 'string' },
    },
  },
}

/**
 * Extracts the token from the authorization header of a Fastify request.
 *
 * @template R - The type of the Fastify request object.
 * @param {R} request - The Fastify request object.
 * @returns {string | null} - The extracted token or null if the authorization header is missing or invalid.
 */
const extractToken = <
  R extends FastifyRequest<{ Headers: AuthenticationHeaders }>,
>(
  request: R
) => {
  const auth = request.headers.authorization

  if (!auth || auth.slice(0, 7) !== 'Bearer ') {
    return null
  }

  return auth.replace('Bearer ', '')
}

export { AuthenticationHeaders, authenticationSchema, extractToken }
