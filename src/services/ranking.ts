import ConventionalReply from '@/reply-convention'
import prisma from '@/prisma-instance'

const verifyName = (name: string): boolean => {
  return name.length <= 64 && name.length > 0 && /^[a-zA-Z0-9 ]+$/.test(name)
}

const verifyGradeAndClass = (gradeAndClass: string): boolean => {
  return (
    ['1', '2', '3'].includes(gradeAndClass[0]) &&
    ['A', 'B', 'C'].includes(gradeAndClass[1].toUpperCase())
  )
}

const verifyScore = (score: number): boolean => {
  return score >= 0 && Number.isInteger(score)
}

const addRanking = async (
  name: string,
  gradeAndClass: string,
  score: number
): Promise<ConventionalReply> => {
  if (!verifyName(name)) {
    return new ConventionalReply(400, {
      error: {
        message: 'Invalid name',
      },
    })
  }

  if (!verifyGradeAndClass(gradeAndClass)) {
    return new ConventionalReply(400, {
      error: {
        message: 'Invalid grade and class',
      },
    })
  }

  if (!verifyScore(score)) {
    return new ConventionalReply(400, {
      error: {
        message: 'Invalid score',
      },
    })
  }

  const positionsAndPoints = await prisma.ranking.findMany({
    select: { position: true, score: true },
  })

  let rightPosition = 0

  for (let i of positionsAndPoints) {
    if (score > i.score) {
      rightPosition = i.position
      break
    }
  }

  if (!rightPosition) {
    rightPosition = positionsAndPoints.length + 1
  }

  for (let i = positionsAndPoints.length; i >= rightPosition; i--) {
    await prisma.ranking.update({
      where: { position: i },
      data: { position: i + 1 },
    })
  }

  prisma.ranking.create({
    data: {
      position: rightPosition,
      name,
      gradeAndClass,
      score,
    },
  })

  return new ConventionalReply(201, { data: { position: rightPosition } })
}

export { addRanking }
