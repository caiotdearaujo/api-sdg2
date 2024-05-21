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
    orderBy: { position: 'asc' },
  })

  let rightPosition = 0

  for (const positionAndPoint of positionsAndPoints) {
    if (positionAndPoint.score < score) {
      rightPosition = positionAndPoint.position
      break
    }
  }

  for (
    let i = positionsAndPoints[positionsAndPoints.length - 1].position;
    i >= rightPosition;
    i--
  ) {
    await prisma.ranking.update({
      where: { position: i },
      data: {
        position: i + 1,
      },
    })
  }

  await prisma.ranking.create({
    data: {
      name,
      gradeAndClass,
      score,
      position: rightPosition,
    },
  })

  return new ConventionalReply(201, { data: { position: rightPosition } })
}

const verifyId = (id: number): boolean => {
  return id > 0 && Number.isInteger(id)
}

const getRankingById = async (id: number): Promise<ConventionalReply> => {
  if (!verifyId(id)) {
    return new ConventionalReply(400, {
      error: {
        message: 'Invalid ID',
      },
    })
  }

  const ranking = await prisma.ranking.findUnique({ where: { id } })

  if (!ranking) {
    return new ConventionalReply(404, {
      error: {
        message: 'Ranking not found',
      },
    })
  }

  return new ConventionalReply(200, { data: ranking })
}

const verifyRange = (rangeStart: number, rangeEnd: number): boolean => {
  return (
    Number.isInteger(rangeStart) &&
    Number.isInteger(rangeEnd) &&
    rangeStart > 0 &&
    rangeEnd > 0 &&
    rangeStart <= rangeEnd
  )
}

const getRanking = async (
  rangeStart?: number,
  rangeEnd?: number
): Promise<ConventionalReply> => {
  const rankings = await prisma.ranking.findMany()

  rangeStart = rangeStart || 1
  rangeEnd = rangeEnd || rankings.length

  if (!verifyRange(rangeStart, rangeEnd)) {
    return new ConventionalReply(400, {
      error: {
        message: 'Invalid range',
      },
    })
  }

  const result = rankings.filter(
    (ranking) => ranking.position >= rangeStart && ranking.position <= rangeEnd
  )

  return new ConventionalReply(200, { data: result })
}

export { addRanking, getRankingById, getRanking }
