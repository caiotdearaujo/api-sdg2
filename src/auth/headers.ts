import { FastifyRequest } from 'fastify'

interface AuthenticationHeaders {
  authorization: string
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

export { AuthenticationHeaders, extractToken }
