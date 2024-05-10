import { FastifyReply, FastifyRequest, FastifySchema } from 'fastify'
import { getQuestions } from '@/services/questions'

interface GetQueryString {
  id?: number
  search?: string
  level?: number
}

const getSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      search: { type: 'string' },
      level: { type: 'number' },
    },
  },
}

const getController = async (
  request: FastifyRequest<{ Querystring: GetQueryString }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { id, search, level } = request.query
  const result = await getQuestions({ id, search, level })
  return result.send(reply)
}

export { getSchema, getController }
