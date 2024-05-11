import { FastifyReply, FastifyRequest, FastifySchema } from 'fastify'
import { getQuestions, addQuestion } from '@/services/questions'
import {
  AuthenticationHeaders,
  authenticationSchema,
  extractToken,
} from '@/auth/headers'
import { title } from 'process'
import { decodeToken } from '@/cryptography/jwt'

interface GetQueryString {
  id?: number
  search?: string
  level?: number
}

const getSchema: FastifySchema = {
  ...authenticationSchema,
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
  request: FastifyRequest<{
    Headers: AuthenticationHeaders
    Querystring: GetQueryString
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { id, search, level } = request.query
  const result = await getQuestions({ id, search, level })
  return result.send(reply)
}

interface PostBody {
  title: string
  level: number
  answers: { content: string; correct: boolean }[]
  time: number
}

const postSchema: FastifySchema = {
  ...authenticationSchema,
  body: {
    type: 'object',
    required: ['title', 'level', 'answers', 'time'],
    properties: {
      title: { type: 'string' },
      level: { type: 'number' },
      answers: {
        type: 'array',
        items: {
          type: 'object',
          required: ['content', 'correct'],
          properties: {
            content: { type: 'string' },
            correct: { type: 'boolean' },
          },
        },
      },
      time: { type: 'number' },
    },
  },
}

const postController = async (
  request: FastifyRequest<{ Headers: AuthenticationHeaders; Body: PostBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const token = extractToken(request)

  if (!token) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const id = await decodeToken(token)
  const question = request.body

  const result = await addQuestion(question, id)
  return result.send(reply)
}

export { getSchema, getController, postSchema, postController }
