import { FastifySchema, FastifyRequest, FastifyReply } from 'fastify'
import { getRanking } from '@/services/ranking'
import { authenticationSchema, AuthenticationHeaders } from '@/auth/headers'

interface GetQueryString {
  position?: number
  positionStart?: number
  positionEnd?: number
  name?: string
  gradeAndClass?: string
  points?: number
}

const getSchema: FastifySchema = {
  ...authenticationSchema,
  querystring: {
    type: 'object',
    properties: {
      position: { type: 'number' },
      positionStart: { type: 'number' },
      positionEnd: { type: 'number' },
      name: { type: 'string' },
      gradeAndClass: { type: 'string' },
      points: { type: 'number' },
    },
  },
}

const getController = async (
  request: FastifyRequest<{
    Headers: AuthenticationHeaders
    Querystring: GetQueryString
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { position, positionStart, positionEnd, name, gradeAndClass, points } =
    request.query

  const result = await getRanking({
    position,
    positionStart,
    positionEnd,
    name,
    gradeAndClass,
    points,
  })

  return result.send(reply)
}

export { getSchema, getController }
