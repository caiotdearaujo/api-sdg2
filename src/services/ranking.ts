import prisma from '@/prisma-instance'
import ConventionalReply from '@/reply-convention'

interface Ranking {
  position: number
  name: string
  gradeAndClass: string
  points: number
}

const verifyPosition = (position: number): boolean => {
  return position >= 1 && Number.isInteger(position)
}

const verifyGradeAndClass = (gradeAndClass: string): boolean => {
  return (
    ['1', '2', '3'].includes(gradeAndClass[0]) &&
    ['A', 'B', 'C'].includes(gradeAndClass[1].toUpperCase())
  )
}

const verifyPoints = (points: number): boolean => {
  return points >= 0 && Number.isInteger(points)
}

const getRankingByPosition = async (
  position: number
): Promise<ConventionalReply> => {
  const ranking = await prisma.ranking.findUnique({ where: { position } })

  if (!ranking) {
    return new ConventionalReply(404, {
      error: { message: 'Ranking not found' },
    })
  }

  return new ConventionalReply(200, { data: [ranking] })
}

const searchByStart = (start: number, rankings: Ranking[]): Ranking[] => {
  return rankings.filter((ranking) => ranking.position >= start)
}

const searchByEnd = (end: number, rankings: Ranking[]): Ranking[] => {
  return rankings.filter((ranking) => ranking.position <= end)
}

const searchByName = (name: string, rankings: Ranking[]): Ranking[] => {
  return rankings.filter((ranking) => {
    return ranking.name.toLowerCase().includes(name.toLowerCase())
  })
}

const searchByGradeAndClass = (
  gradeAndClass: string,
  rankings: Ranking[]
): Ranking[] => {
  return rankings.filter(
    (ranking) => ranking.gradeAndClass === gradeAndClass.toUpperCase()
  )
}

const searchByPoints = (points: number, rankings: Ranking[]): Ranking[] => {
  return rankings.filter((ranking) => ranking.points === points)
}

const getRanking = async (filters: {
  position?: number
  positionStart?: number
  positionEnd?: number
  name?: string
  gradeAndClass?: string
  points?: number
}): Promise<ConventionalReply> => {
  const { position, positionStart, positionEnd, name, gradeAndClass, points } =
    filters

  if (position) {
    if (!verifyPosition(position)) {
      return new ConventionalReply(400, {
        error: { message: 'Invalid position' },
      })
    }

    return await getRankingByPosition(position)
  }

  let rankings = await prisma.ranking.findMany()

  if (positionStart) {
    if (!verifyPosition(positionStart)) {
      return new ConventionalReply(400, {
        error: { message: 'Invalid start position' },
      })
    }

    rankings = searchByStart(positionStart, rankings)
  }

  if (positionEnd) {
    if (!verifyPosition(positionEnd)) {
      return new ConventionalReply(400, {
        error: { message: 'Invalid end position' },
      })
    }

    rankings = searchByEnd(positionEnd, rankings)
  }

  if (name) {
    rankings = searchByName(name, rankings)
  }

  if (gradeAndClass) {
    if (!verifyGradeAndClass(gradeAndClass)) {
      return new ConventionalReply(400, {
        error: { message: 'Invalid grade and class' },
      })
    }

    rankings = searchByGradeAndClass(gradeAndClass, rankings)
  }

  if (points) {
    if (!verifyPoints(points)) {
      return new ConventionalReply(400, {
        error: { message: 'Invalid points' },
      })
    }

    rankings = searchByPoints(points, rankings)
  }

  return new ConventionalReply(200, { data: rankings })
}

export { getRanking }
