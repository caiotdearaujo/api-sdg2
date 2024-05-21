import { FastifySchema, FastifyRequest, FastifyReply } from 'fastify'
import { AuthenticationHeaders, authenticationSchema } from '@/auth/headers'
import { addRanking, getRankingById, getRanking } from '@/services/ranking'

interface PostBody {
  name: string
  gradeAndClass: string
  score: number
}

const postSchema: FastifySchema = {
  ...authenticationSchema,
  body: {
    type: 'object',
    required: ['name', 'gradeAndClass', 'score'],
    properties: {
      name: { type: 'string' },
      gradeAndClass: { type: 'string' },
      score: { type: 'number' },
    },
  },
}

/**
 * Handles the POST /ranking endpoint.
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A promise that resolves to the Fastify reply.
 */
const postController = async (
  request: FastifyRequest<{ Headers: AuthenticationHeaders; Body: PostBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { name, gradeAndClass, score } = request.body
  const result = await addRanking(name, gradeAndClass, score)
  return result.send(reply)
}

interface GetByIdParams {
  id: number
}

const getByIdSchema: FastifySchema = {
  ...authenticationSchema,
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number' },
    },
  },
}

/**
 * Handles the GET /ranking/:id endpoint.
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A promise that resolves to the Fastify reply.
 */
const getByIdController = async (
  request: FastifyRequest<{
    Headers: AuthenticationHeaders
    Params: GetByIdParams
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { id } = request.params
  const result = await getRankingById(id)
  return result.send(reply)
}

interface GetQueryString {
  rangeStart?: number
  rangeEnd?: number
}

const getSchema: FastifySchema = {
  ...authenticationSchema,
  querystring: {
    type: 'object',
    properties: {
      rangeStart: { type: 'number' },
      rangeEnd: { type: 'number' },
    },
  },
}

/**
 * Handles the GET /ranking endpoint.
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A promise that resolves to the Fastify reply.
 */
const getController = async (
  request: FastifyRequest<{
    Headers: AuthenticationHeaders
    Querystring: GetQueryString
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { rangeStart, rangeEnd } = request.query
  const result = await getRanking(rangeStart, rangeEnd)
  return result.send(reply)
}

export {
  postSchema,
  postController,
  getByIdSchema,
  getByIdController,
  getSchema,
  getController,
}
