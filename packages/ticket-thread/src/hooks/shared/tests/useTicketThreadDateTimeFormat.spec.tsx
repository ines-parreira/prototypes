import { useUserDateTimePreferences } from '@repo/preferences'
import { DateFormatType, formatDatetime, TimeFormatType } from '@repo/utils'
import { renderHook } from '@testing-library/react'

import { useTicketThreadDateTimeFormat } from '../useTicketThreadDateTimeFormat'

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: vi.fn(),
}))

describe('useTicketThreadDateTimeFormat', () => {
    it('builds a relative datetime format from user preferences', () => {
        vi.mocked(useUserDateTimePreferences).mockReturnValue({
            dateFormat: DateFormatType.en_US,
            timeFormat: TimeFormatType.AmPm,
            timezone: 'America/Los_Angeles',
        })

        const { result } = renderHook(() => useTicketThreadDateTimeFormat())

        expect(
            formatDatetime(
                '2024-03-21T00:00:00Z',
                result.current.datetimeFormat,
                result.current.timezone,
            ),
        ).toBe('03/20/2024')
    })
})
