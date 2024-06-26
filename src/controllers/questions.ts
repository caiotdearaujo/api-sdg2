import { FastifyReply, FastifyRequest, FastifySchema } from 'fastify'
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/services/questions'
import {
  AuthenticationHeaders,
  authenticationSchema,
  extractToken,
} from '@/auth/headers'
import { decodeToken } from '@/cryptography/jwt'

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

/**
 * Retrieves questions based on the provided query parameters.
 *
 * @param request - The Fastify request object containing headers and query parameters.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to the Fastify reply object.
 */
const getController = async (
  request: FastifyRequest<{ Querystring: GetQueryString }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { id, search, level } = request.query

  const result = await getQuestions({ id, search, level })

  return result.send(reply)
}

interface PostBody {
  title: string
  answers: { content: string; correct: boolean }[]
  level: number
}

const postSchema: FastifySchema = {
  ...authenticationSchema,
  body: {
    type: 'object',
    required: ['title', 'answers', 'level'],
    properties: {
      title: { type: 'string' },
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
      level: { type: 'number' },
    },
  },
}

/**
 * Handles the POST request for creating a new question.
 *
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to a FastifyReply.
 */
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

interface PutParams {
  id: number
}

interface PutBody {
  title: string
  answers: { id: number; content: string; correct: boolean }[]
  level: number
}

const putSchema: FastifySchema = {
  ...authenticationSchema,
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    required: ['title', 'answers', 'level'],
    properties: {
      title: { type: 'string' },
      answers: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'content', 'correct'],
          properties: {
            id: { type: 'number' },
            content: { type: 'string' },
            correct: { type: 'boolean' },
          },
        },
      },
      level: { type: 'number' },
    },
  },
}

/**
 * Handles the PUT request for updating a question.
 *
 * @param request - The Fastify request object containing the headers and body.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to the Fastify reply.
 */
const putController = async (
  request: FastifyRequest<{
    Headers: AuthenticationHeaders
    Params: PutParams
    Body: PutBody
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const token = extractToken(request)

  if (!token) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const id = await decodeToken(token)
  const questionId = request.params.id
  const questionContent = request.body
  const question = { id: questionId, ...questionContent }

  const result = await updateQuestion(question, id)

  return result.send(reply)
}

interface DeleteParams {
  id: number
}

const deleteSchema: FastifySchema = {
  ...authenticationSchema,
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number' },
    },
  },
}

const deleteController = async (
  request: FastifyRequest<{
    Headers: AuthenticationHeaders
    Params: DeleteParams
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const id = request.params.id

  const result = await deleteQuestion(id)

  return result.send(reply)
}

export {
  getSchema,
  getController,
  postSchema,
  postController,
  putSchema,
  putController,
  deleteSchema,
  deleteController,
}
