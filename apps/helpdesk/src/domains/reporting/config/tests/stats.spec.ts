import { formatDuration } from '@repo/reporting'
import type { ChartType, TooltipItem } from 'chart.js'

import { formatDurationTooltipCb } from 'domains/reporting/config/stats'

jest.mock('@repo/reporting', () => ({
    formatDuration: jest.fn((value: number) =>
        value > 0 ? `${value}s` : '0s',
    ),
}))

const mockFormatDuration = formatDuration as jest.MockedFunction<
    typeof formatDuration
>

const makeCtx = (
    y: number | null,
    label = 'Test Label',
): TooltipItem<ChartType> =>
    ({
        parsed: { y },
        dataset: { label },
    }) as unknown as TooltipItem<ChartType>

describe('formatDurationTooltipCb', () => {
    beforeEach(() => {
        mockFormatDuration.mockImplementation((value) =>
            value > 0 ? `${value}s` : '0s',
        )
    })

    it('formats with a numeric y value', () => {
        const result = formatDurationTooltipCb(makeCtx(3600))
        expect(mockFormatDuration).toHaveBeenCalledWith(3600, 2)
        expect(result).toBe('Test Label: 3600s ')
    })

    it('falls back to 0 when y is null', () => {
        const result = formatDurationTooltipCb(makeCtx(null))
        expect(mockFormatDuration).toHaveBeenCalledWith(0, 2)
        expect(result).toBe('Test Label: 0s ')
    })

    it('uses empty string when dataset label is absent', () => {
        const result = formatDurationTooltipCb(makeCtx(3600, ''))
        expect(result).toBe(': 3600s ')
    })

    it("falls back to '0' when formatDuration returns falsy", () => {
        mockFormatDuration.mockReturnValue('' as any)
        const result = formatDurationTooltipCb(makeCtx(3600))
        expect(result).toBe('Test Label: 0 ')
    })
})
