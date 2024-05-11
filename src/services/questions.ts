import ConventionalReply from '@/reply-convention'
import prisma from '@/prisma-instance'

type questionsAndAnswersType = {
  id: number
  title: string
  editorUsername: string
  level: number
  answers: {
    id: number
    content: string
    questionId: number
    correct: boolean
  }[]
  time: number
}[]

const verifyLevel = (level: number): boolean => {
  return [1, 2, 3, 4].includes(level)
}

const getQuestionById = async (id: number): Promise<ConventionalReply> => {
  const question = await prisma.question.findUnique({
    where: { id },
  })

  if (!question) {
    return new ConventionalReply(404, {
      error: { message: 'Question not found' },
    })
  }

  const answers = await prisma.answer.findMany({
    where: { questionId: id },
  })

  const questionAndAnswers = { ...question, answers }

  return new ConventionalReply(200, {
    data: { questions: [questionAndAnswers] },
  })
}

const searchByQuestions = (
  search: string,
  questionsAndAnswers: questionsAndAnswersType
): questionsAndAnswersType => {
  return questionsAndAnswers.filter((question) => {
    return question.title.toLowerCase().includes(search.toLowerCase())
  })
}

const getQuestionsByLevel = (
  level: number,
  questionsAndAnswers: questionsAndAnswersType
): questionsAndAnswersType => {
  return questionsAndAnswers.filter((question) => question.level === level)
}

const getQuestions = async (filters: {
  id?: number
  search?: string
  level?: number
}): Promise<ConventionalReply> => {
  const { id, search, level } = filters

  if (id) {
    return await getQuestionById(id)
  }

  const questions = await prisma.question.findMany()
  const answers = await prisma.answer.findMany()

  let questionsAndAnswers: questionsAndAnswersType = questions.map(
    (question) => {
      const questionAnswers = answers.filter(
        (answer) => answer.questionId === question.id
      )

      return { ...question, answers: questionAnswers }
    }
  )

  if (search) {
    questionsAndAnswers = searchByQuestions(search, questionsAndAnswers)
  }

  if (level) {
    if (!verifyLevel(level)) {
      return new ConventionalReply(400, {
        error: { message: 'Invalid level' },
      })
    }

    questionsAndAnswers = getQuestionsByLevel(level, questionsAndAnswers)
  }

  return new ConventionalReply(200, {
    data: { questions: questionsAndAnswers },
  })
}

export { getQuestions }
