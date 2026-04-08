import { assumeMock, renderHook } from '@repo/testing'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import { useReturnOrdersDrillDownData } from '../useReturnOrdersDrillDownData'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
jest.mock('domains/reporting/hooks/useStatResource')

const mockUseAutomateFilters = assumeMock(useAutomateFilters)
const mockUseStatResource = assumeMock(useStatResource)

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000Z',
        end_datetime: '2024-01-31T23:59:59.000Z',
    },
}

const MOCK_AUTOMATE_FILTERS = {
    statsFilters: MOCK_STATS_FILTERS,
    userTimezone: 'UTC',
    granularity: ReportingGranularity.Day,
}

const MOCK_LINES = [
    [
        {
            type: 'product',
            value: {
                image_url: 'https://cdn.example.com/product-a.png',
                name: 'Product A',
            },
        },
        { type: 'number', value: 9 },
        {
            type: 'issues',
            value: {
                reasonOrderDamaged: 2,
                reasonEditOrder: 4,
                reasonOther: 3,
            },
        },
        { type: 'number', value: 1 },
    ],
    [
        {
            type: 'product',
            value: {
                image_url: 'https://cdn.example.com/product-b.png',
                name: 'Product B',
            },
        },
        { type: 'number', value: 4 },
        { type: 'issues', value: { reasonOther: 1, reasonEditOrder: 3 } },
        { type: 'number', value: 0 },
    ],
]

const MOCK_STAT = {
    meta: {},
    data: {
        data: {
            axes: {
                x: [
                    { name: 'Product', type: 'product' },
                    { name: 'Total issues reported', type: 'number' },
                    { name: 'Issues reported', type: 'issues' },
                    { name: 'Return Requests', type: 'number' },
                ],
            },
            lines: MOCK_LINES,
        },
    },
}

const noop = () => {}

describe('useReturnOrdersDrillDownData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAutomateFilters.mockReturnValue(MOCK_AUTOMATE_FILTERS)
        mockUseStatResource.mockReturnValue([MOCK_STAT, false, noop])
    })

    it('returns mapped rows from stat data', () => {
        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.rows).toEqual([
            {
                Product: {
                    image_url: 'https://cdn.example.com/product-a.png',
                    name: 'Product A',
                },
                'Total issues reported': 9,
                'Issues reported': {
                    reasonOrderDamaged: 2,
                    reasonEditOrder: 4,
                    reasonOther: 3,
                },
                'Return Requests': 1,
            },
            {
                Product: {
                    image_url: 'https://cdn.example.com/product-b.png',
                    name: 'Product B',
                },
                'Total issues reported': 4,
                'Issues reported': { reasonOther: 1, reasonEditOrder: 3 },
                'Return Requests': 0,
            },
        ])
    })

    it('returns count equal to the number of rows', () => {
        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.count).toBe(2)
    })

    it('returns isLoading false when stat is loaded', () => {
        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.isLoading).toBe(false)
    })

    it('returns isLoading true when stat is loading', () => {
        mockUseStatResource.mockReturnValue([null, true, noop])

        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty rows and count 0 when stat has no lines', () => {
        mockUseStatResource.mockReturnValue([
            {
                ...MOCK_STAT,
                data: { data: { ...MOCK_STAT.data.data, lines: [] } },
            },
            false,
            noop,
        ])

        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.rows).toEqual([])
        expect(result.current.count).toBe(0)
    })

    it('returns empty rows and count 0 when stat is null', () => {
        mockUseStatResource.mockReturnValue([null, false, noop])

        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.rows).toEqual([])
        expect(result.current.count).toBe(0)
    })

    it('falls back to defaults when a line has missing cells', () => {
        mockUseStatResource.mockReturnValue([
            {
                ...MOCK_STAT,
                data: {
                    data: {
                        ...MOCK_STAT.data.data,
                        lines: [
                            [
                                {
                                    type: 'product',
                                    value: {
                                        image_url:
                                            'https://cdn.example.com/product-c.png',
                                        name: 'Product C',
                                    },
                                },
                            ],
                        ],
                    },
                },
            },
            false,
            noop,
        ])

        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.rows[0]).toEqual({
            Product: {
                image_url: 'https://cdn.example.com/product-c.png',
                name: 'Product C',
            },
            'Total issues reported': 0,
            'Issues reported': {},
            'Return Requests': 0,
        })
    })

    it('falls back to defaults when a line is entirely empty', () => {
        mockUseStatResource.mockReturnValue([
            {
                ...MOCK_STAT,
                data: { data: { ...MOCK_STAT.data.data, lines: [[]] } },
            },
            false,
            noop,
        ])

        const { result } = renderHook(() => useReturnOrdersDrillDownData())

        expect(result.current.rows[0]).toEqual({
            Product: { image_url: '', name: '' },
            'Total issues reported': 0,
            'Issues reported': {},
            'Return Requests': 0,
        })
    })

    it('passes only period filters to useStatResource', () => {
        mockUseAutomateFilters.mockReturnValue({
            ...MOCK_AUTOMATE_FILTERS,
            statsFilters: {
                ...MOCK_STATS_FILTERS,
                channels: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['email'],
                },
            },
        })

        renderHook(() => useReturnOrdersDrillDownData())

        const callArgs = mockUseStatResource.mock.calls[0][0]
        expect(callArgs.statsFilters).toEqual({
            period: MOCK_STATS_FILTERS.period,
        })
        expect(callArgs.statsFilters).not.toHaveProperty('channel')
    })

    it('limits the period to 90 days when the range exceeds the maximum', () => {
        mockUseAutomateFilters.mockReturnValue({
            ...MOCK_AUTOMATE_FILTERS,
            statsFilters: {
                period: {
                    start_datetime: '2023-01-01T00:00:00.000Z',
                    end_datetime: '2024-01-01T00:00:00.000Z',
                },
            },
        })

        renderHook(() => useReturnOrdersDrillDownData())

        const callArgs = mockUseStatResource.mock.calls[0][0]
        const passedStart = new Date(
            callArgs.statsFilters.period.start_datetime,
        )
        const passedEnd = new Date(callArgs.statsFilters.period.end_datetime)
        const diffDays =
            (passedEnd.getTime() - passedStart.getTime()) /
            (24 * 60 * 60 * 1000)

        expect(diffDays).toBeLessThanOrEqual(90)
    })

    it('does not limit the period when range is within 90 days', () => {
        renderHook(() => useReturnOrdersDrillDownData())

        const callArgs = mockUseStatResource.mock.calls[0][0]
        expect(callArgs.statsFilters.period).toEqual(MOCK_STATS_FILTERS.period)
    })
})
