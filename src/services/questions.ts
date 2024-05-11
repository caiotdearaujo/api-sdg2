import ConventionalReply from '@/reply-convention'
import prisma from '@/prisma-instance'

type questionsAndAnswersType = {
  id: number
  title: string
  lastEditorUsername: string
  answers: {
    id: number
    content: string
    questionId: number
    correct: boolean
  }[]
  level: number
  time: number
}[]

/**
 * Verifies if the given level is valid.
 *
 * @param level - The level to be verified.
 * @returns A boolean indicating whether the level is valid or not.
 */
const verifyLevel = (level: number): boolean => {
  return [1, 2, 3, 4].includes(level)
}

/**
 * Verifies if the given time is greater than zero.
 *
 * @param time - The time to be verified.
 * @returns `true` if the time is greater than zero, `false` otherwise.
 */
const verifyTime = (time: number): boolean => {
  return time > 0
}

/**
 * Checks if a question with the given ID exists in the database.
 *
 * @param id - The ID of the question to check.
 * @returns A Promise that resolves to a boolean indicating whether the question exists or not.
 */
const questionExists = async (id: number): Promise<boolean> => {
  const question = await prisma.question.findUnique({
    where: { id },
  })

  return question !== null
}

/**
 * Retrieves a question by its ID.
 *
 * @param id - The ID of the question to retrieve.
 * @returns A promise that resolves to a `ConventionalReply` object containing the question and its answers.
 */
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

/**
 * Searches for questions that match the given search string.
 *
 * @param search - The search string to match against question titles.
 * @param questionsAndAnswers - The array of questions and answers to search through.
 * @returns An array of questions and answers that match the search string.
 */
const searchByQuestions = (
  search: string,
  questionsAndAnswers: questionsAndAnswersType
): questionsAndAnswersType => {
  return questionsAndAnswers.filter((question) => {
    return question.title.toLowerCase().includes(search.toLowerCase())
  })
}

/**
 * Retrieves questions from the provided array that match the specified level.
 *
 * @param level - The level of the questions to retrieve.
 * @param questionsAndAnswers - The array of questions and answers.
 * @returns An array of questions and answers that match the specified level.
 */
const getQuestionsByLevel = (
  level: number,
  questionsAndAnswers: questionsAndAnswersType
): questionsAndAnswersType => {
  return questionsAndAnswers.filter((question) => question.level === level)
}

/**
 * Retrieves questions based on the provided filters.
 *
 * @param filters - The filters to apply when retrieving questions.
 * @returns A promise that resolves to a `ConventionalReply` object containing the retrieved questions.
 */
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

/**
 * Adds a new question to the database.
 *
 * @param question - The question object containing the title, answers, level, and time.
 * @param id - The ID of the user adding the question.
 * @returns A promise that resolves to a ConventionalReply object.
 */
const addQuestion = async (
  question: {
    title: string
    answers: { content: string; correct: boolean }[]
    level: number
    time: number
  },
  id: string
): Promise<ConventionalReply> => {
  const { title, answers, level, time } = question

  if (!verifyLevel(level)) {
    return new ConventionalReply(400, {
      error: { message: 'Invalid level' },
    })
  }

  if (!verifyTime(time)) {
    return new ConventionalReply(400, {
      error: { message: 'Invalid time' },
    })
  }

  const newQuestion = await prisma.question.create({
    data: {
      title,
      lastEditor: { connect: { id } },
      answers: { createMany: { data: answers } },
      level,
      time,
    },
  })

  return new ConventionalReply(201, {
    data: { question: { id: newQuestion.id } },
  })
}

/**
 * Updates a question and its answers in the database.
 *
 * @param question - The question object containing the updated information.
 * @param editorId - The ID of the editor who is updating the question.
 * @returns A promise that resolves to a ConventionalReply object.
 */
const updateQuestion = async (
  question: {
    id: number
    title: string
    answers: { id: number; content: string; correct: boolean }[]
    level: number
    time: number
  },
  editorId: string
): Promise<ConventionalReply> => {
  const { id, title, answers, level, time } = question
  const answersIds = answers.map((answer) => answer.id)

  if (!verifyLevel(level)) {
    return new ConventionalReply(400, {
      error: { message: 'Invalid level' },
    })
  }

  if (!verifyTime(time)) {
    return new ConventionalReply(400, {
      error: { message: 'Invalid time' },
    })
  }

  if (!(await questionExists(id))) {
    return new ConventionalReply(404, {
      error: { message: 'Question not found' },
    })
  }

  await prisma.answer.deleteMany({ where: { questionId: id } })
  await prisma.question.update({
    where: { id },
    data: {
      title,
      lastEditor: { connect: { id: editorId } },
      level,
      time,
    },
  })

  for (const answer of answers) {
    await prisma.answer.create({
      data: {
        id: answer.id,
        content: answer.content,
        correct: answer.correct,
        questionId: id,
      },
    })
  }

  return new ConventionalReply(204, { data: {} })
}

const deleteQuestion = async (id: number): Promise<ConventionalReply> => {
  if (!(await questionExists(id))) {
    return new ConventionalReply(404, {
      error: { message: 'Question not found' },
    })
  }

  await prisma.answer.deleteMany({ where: { questionId: id } })
  await prisma.question.delete({ where: { id } })

  return new ConventionalReply(204, { data: {} })
}

export { getQuestions, addQuestion, updateQuestion, deleteQuestion }
