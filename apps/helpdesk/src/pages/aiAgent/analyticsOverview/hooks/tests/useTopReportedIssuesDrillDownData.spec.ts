import { assumeMock, renderHook } from '@repo/testing'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import { useTopReportedIssuesDrillDownData } from '../useTopReportedIssuesDrillDownData'

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
        { type: 'issue-reason', value: 'reasonOther' },
        { type: 'percent', value: 53 },
        { type: 'number', value: 141 },
        { type: 'delta', value: -29 },
    ],
    [
        { type: 'issue-reason', value: 'reasonEditOrder' },
        { type: 'percent', value: 18 },
        { type: 'number', value: 48 },
        { type: 'delta', value: 9 },
    ],
]

const MOCK_STAT = {
    meta: {},
    data: {
        data: {
            axes: {
                x: [
                    { name: 'Issue', type: 'issue-reason' },
                    { name: '% of issues reported', type: 'percent' },
                    { name: 'Tickets created', type: 'number' },
                    { name: 'Delta', type: 'delta' },
                ],
            },
            lines: MOCK_LINES,
        },
    },
}

const noop = () => {}

describe('useTopReportedIssuesDrillDownData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAutomateFilters.mockReturnValue(MOCK_AUTOMATE_FILTERS)
        mockUseStatResource.mockReturnValue([MOCK_STAT, false, noop])
    })

    it('returns mapped rows from stat data', () => {
        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.rows).toEqual([
            {
                Issue: 'Other',
                '% of issues reported': 53,
                'Tickets created': 141,
                Delta: -29,
            },
            {
                Issue: "I'd like to edit my order",
                '% of issues reported': 18,
                'Tickets created': 48,
                Delta: 9,
            },
        ])
    })

    it('returns count equal to the number of rows', () => {
        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.count).toBe(2)
    })

    it('returns isLoading false when stat is loaded', () => {
        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.isLoading).toBe(false)
    })

    it('returns isLoading true when stat is loading', () => {
        mockUseStatResource.mockReturnValue([null, true, noop])

        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

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

        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.rows).toEqual([])
        expect(result.current.count).toBe(0)
    })

    it('returns empty rows and count 0 when stat is null', () => {
        mockUseStatResource.mockReturnValue([null, false, noop])

        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

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
                            [{ type: 'issue-reason', value: 'reasonOther' }],
                        ],
                    },
                },
            },
            false,
            noop,
        ])

        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.rows[0]).toEqual({
            Issue: 'Other',
            '% of issues reported': 0,
            'Tickets created': 0,
            Delta: 0,
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

        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.rows[0]).toEqual({
            Issue: '',
            '% of issues reported': 0,
            'Tickets created': 0,
            Delta: 0,
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

        renderHook(() => useTopReportedIssuesDrillDownData())

        const callArgs = mockUseStatResource.mock.calls[0][0]
        expect(callArgs.statsFilters).toEqual({
            period: MOCK_STATS_FILTERS.period,
        })
        expect(callArgs.statsFilters).not.toHaveProperty('channels')
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

        renderHook(() => useTopReportedIssuesDrillDownData())

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
        renderHook(() => useTopReportedIssuesDrillDownData())

        const callArgs = mockUseStatResource.mock.calls[0][0]
        expect(callArgs.statsFilters.period).toEqual(MOCK_STATS_FILTERS.period)
    })

    it('returns isPeriodLimited false when range is within 90 days', () => {
        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.isPeriodLimited).toBe(false)
    })

    it('returns isPeriodLimited true when range exceeds 90 days', () => {
        mockUseAutomateFilters.mockReturnValue({
            ...MOCK_AUTOMATE_FILTERS,
            statsFilters: {
                period: {
                    start_datetime: '2023-01-01T00:00:00.000Z',
                    end_datetime: '2024-01-01T00:00:00.000Z',
                },
            },
        })

        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        expect(result.current.isPeriodLimited).toBe(true)
    })

    it('returns the previous period formatted as a date range', () => {
        const { result } = renderHook(() => useTopReportedIssuesDrillDownData())

        // Mock period: Jan 1 2024 – Jan 31 2024
        // Previous period: Dec 1 2023 – Dec 31 2023
        expect(result.current.previousPeriod).toBe('Dec 1, 2023 - Dec 31, 2023')
    })
})
