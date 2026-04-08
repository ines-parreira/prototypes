import type { Period } from 'domains/reporting/models/stat/types'
import { limitStatFiltersPeriod } from 'pages/aiAgent/analyticsOverview/utils/limitStatFiltersPeriod'

describe('limitStatFiltersPeriod', () => {
    it('returns the period unchanged when the range is within the limit', () => {
        const period: Period = {
            start_datetime: '2024-01-01T00:00:00.000Z',
            end_datetime: '2024-01-31T00:00:00.000Z',
        }

        const result = limitStatFiltersPeriod(period, 90)

        expect(result).toBe(period)
    })

    it('returns the period unchanged when the range is exactly at the limit', () => {
        const end = new Date('2024-04-01T00:00:00.000Z')
        const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)
        const period: Period = {
            start_datetime: start.toISOString(),
            end_datetime: end.toISOString(),
        }

        const result = limitStatFiltersPeriod(period, 90)

        expect(result).toBe(period)
    })

    it('limits the start date when the range exceeds the maximum', () => {
        const period: Period = {
            start_datetime: '2023-01-01T00:00:00.000Z',
            end_datetime: '2024-01-01T00:00:00.000Z',
        }

        const result = limitStatFiltersPeriod(period, 90)

        expect(result.end_datetime).toBe(period.end_datetime)

        const diffDays =
            (new Date(result.end_datetime).getTime() -
                new Date(result.start_datetime).getTime()) /
            (24 * 60 * 60 * 1000)

        expect(diffDays).toBeLessThanOrEqual(90)
    })
})
