import { FastifySchema, FastifyRequest, FastifyReply } from 'fastify'
import { AuthenticationHeaders, authenticationSchema } from '@/auth/headers'
import { addRanking } from '@/services/ranking'

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

const postController = async (
  request: FastifyRequest<{ Headers: AuthenticationHeaders; Body: PostBody }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const { name, gradeAndClass, score } = request.body
  const result = await addRanking(name, gradeAndClass, score)
  return result.send(reply)
}

export { postSchema, postController }
