import ConventionalReply from '@/reply-convention'
import prisma from '@/prisma-instance'

/**
 * Verifies if the name is valid.
 * @param name - The name to be verified.
 * @returns A boolean indicating whether the name is valid or not.
 */
const verifyName = (name: string): boolean => {
  return name.length <= 64 && name.length > 0 && /^[a-zA-Z0-9 ]+$/.test(name)
}

/**
 * Verifies if the grade and class are valid.
 * @param gradeAndClass - The grade and class to be verified.
 * @returns A boolean indicating whether the grade and class are valid or not.
 */
const verifyGradeAndClass = (gradeAndClass: string): boolean => {
  return (
    ['1', '2', '3'].includes(gradeAndClass[0]) &&
    ['A', 'B', 'C'].includes(gradeAndClass[1].toUpperCase())
  )
}

/**
 * Verifies if the score is valid.
 * @param score - The score to be verified.
 * @returns A boolean indicating whether the score is valid or not.
 */
const verifyScore = (score: number): boolean => {
  return score >= 0 && Number.isInteger(score)
}

/**
 * Adds a ranking entry.
 * @param name - The name of the player.
 * @param gradeAndClass - The grade and class of the player.
 * @param score - The score of the player.
 * @returns A promise that resolves to a ConventionalReply object.
 */
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

  let rightPosition = 1

  const positionsAndPoints = await prisma.ranking.findMany({
    select: { position: true, score: true },
    orderBy: { position: 'asc' },
  })

  if (positionsAndPoints.length !== 0) {
    for (let i = 0; i < positionsAndPoints.length; i++) {
      if (positionsAndPoints[i].score > score) {
        rightPosition = positionsAndPoints[i].position
        break
      } else if (positionsAndPoints[i].score === score) {
        rightPosition = positionsAndPoints[i].position + 1
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

/**
 * Verifies if the ID is valid.
 * @param id - The ID to be verified.
 * @returns A boolean indicating whether the ID is valid or not.
 */
const verifyId = (id: number): boolean => {
  return id > 0 && Number.isInteger(id)
}

/**
 * Retrieves a ranking entry by ID.
 * @param id - The ID of the ranking entry.
 * @returns A promise that resolves to a ConventionalReply object.
 */
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

/**
 * Verifies if the range is valid.
 * @param rangeStart - The start of the range.
 * @param rangeEnd - The end of the range.
 * @returns A boolean indicating whether the range is valid or not.
 */
const verifyRange = (rangeStart: number, rangeEnd: number): boolean => {
  return (
    Number.isInteger(rangeStart) &&
    Number.isInteger(rangeEnd) &&
    rangeStart > 0 &&
    rangeEnd > 0 &&
    rangeStart <= rangeEnd
  )
}

/**
 * Retrieves a range of ranking entries.
 * @param rangeStart - The start of the range (optional).
 * @param rangeEnd - The end of the range (optional).
 * @returns A promise that resolves to a ConventionalReply object.
 */
const getRanking = async (
  rangeStart?: number,
  rangeEnd?: number
): Promise<ConventionalReply> => {
  const rankings = await prisma.ranking.findMany({
    orderBy: { position: 'asc' },
  })

  if (rankings.length === 0) {
    return new ConventionalReply(200, { data: [] })
  }

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
