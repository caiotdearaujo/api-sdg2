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
