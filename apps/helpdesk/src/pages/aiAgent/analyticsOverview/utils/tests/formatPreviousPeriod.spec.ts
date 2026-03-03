import type { Period } from 'domains/reporting/models/stat/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

describe('formatPreviousPeriod', () => {
    it('should format a valid period with previous period', () => {
        const period: Period = {
            start_datetime: '2024-01-15T00:00:00Z',
            end_datetime: '2024-01-21T23:59:59Z',
        }

        const result = formatPreviousPeriod(period)

        expect(result).toBe('Jan 8 - Jan 14')
    })

    it('should return empty string when period is undefined', () => {
        const result = formatPreviousPeriod(undefined)

        expect(result).toBe('')
    })

    it('should handle different date ranges correctly', () => {
        const period: Period = {
            start_datetime: '2024-03-01T00:00:00Z',
            end_datetime: '2024-03-31T23:59:59Z',
        }

        const result = formatPreviousPeriod(period)

        expect(result).toBe('Jan 30 - Feb 29')
    })

    it('should handle year transitions correctly', () => {
        const period: Period = {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        }

        const result = formatPreviousPeriod(period)

        expect(result).toBe('Dec 1 - Dec 31')
    })
})
