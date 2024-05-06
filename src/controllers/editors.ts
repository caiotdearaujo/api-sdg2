import { FastifyReply, FastifyRequest } from 'fastify'
import { addEditor } from '@/db/editors'

interface PostBody {
  username: string
  password: string
}

const postSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
    },
  },
}

const postController = async (
  request: FastifyRequest<{ Body: PostBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { username, password } = request.body
  const result = await addEditor(username, password)
  return result.send(reply)
}

export { postSchema, postController }
