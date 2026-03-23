import { DateFormatType, TimeFormatType } from '@repo/utils'

import { formatCreatedAt } from '../../fieldDefinitions/formatCreatedAt'

describe('formatCreatedAt', () => {
    const dateFormat = DateFormatType.en_US
    const timeFormat = TimeFormatType.TwentyFourHour

    it('returns "-" when createdAt is undefined', () => {
        expect(formatCreatedAt(undefined, dateFormat, timeFormat)).toBe('-')
    })

    it('returns "-" when createdAt is empty string', () => {
        expect(formatCreatedAt('', dateFormat, timeFormat)).toBe('-')
    })

    it('returns formatted date when createdAt is valid ISO string', () => {
        const result = formatCreatedAt(
            '2024-01-15T10:30:00Z',
            dateFormat,
            timeFormat,
        )
        expect(result).toBe('01/15/2024')
    })
})
