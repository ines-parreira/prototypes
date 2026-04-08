import type { Period } from 'domains/reporting/models/stat/types'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function limitStatFiltersPeriod(
    period: Period,
    maxDays: number,
): Period {
    const end = new Date(period.end_datetime)
    const start = new Date(period.start_datetime)
    const diffDays = (end.getTime() - start.getTime()) / MS_PER_DAY

    if (diffDays <= maxDays) {
        return period
    }

    const limitedStart = new Date(end.getTime() - maxDays * MS_PER_DAY)
    return {
        ...period,
        start_datetime: limitedStart.toISOString(),
    }
}
