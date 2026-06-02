import { assumeMock, renderHook } from '@repo/testing'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    fetchPerformanceOverviewChannelAsConfigurableTable,
    fetchPerformanceOverviewChannelMetrics,
    usePerformanceOverviewChannelMetrics,
} from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics'

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useEntityMetrics: jest.fn(),
    fetchEntityMetrics: jest.fn(),
    assembleEntityRows: jest.fn((entities, buildRow) => entities.map(buildRow)),
}))
jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(
        (_period, name) => `2024-01-01_2024-01-31-${name}.csv`,
    ),
}))

const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseEntityMetrics = assumeMock(useEntityMetrics)
const mockFetchEntityMetrics = assumeMock(fetchEntityMetrics)

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'

const emptyEntityMap = () => ({
    averageCsat: {},
    resolutionTime: {},
    messagesPerTicket: {},
    firstResponseTime: {},
    humanResponseTimeAfterAiHandoff: {},
    createdTickets: {},
    closedTickets: {},
    ticketsReplied: {},
    messagesSent: {},
})

const emptyLoadingStates = () => ({
    averageCsat: false,
    resolutionTime: false,
    messagesPerTicket: false,
    firstResponseTime: false,
    humanResponseTimeAfterAiHandoff: false,
    createdTickets: false,
    closedTickets: false,
    ticketsReplied: false,
    messagesSent: false,
})

describe('usePerformanceOverviewChannelMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
    })

    it('derives the channel set as the union of allValues keys across all 9 metrics', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { email: 4.5 },
                createdTickets: { chat: 100 },
                messagesSent: { 'help-center': 50 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceOverviewChannelMetrics(),
        )

        expect(result.current.data.map((r) => r.entity).sort()).toEqual([
            'chat',
            'email',
            'help-center',
        ])
    })

    it('sorts rows by humanized channel display name', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                createdTickets: {
                    sms: 1,
                    email: 1,
                    chat: 1,
                    'help-center': 1,
                },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceOverviewChannelMetrics(),
        )

        expect(result.current.data.map((r) => r.entity)).toEqual([
            'chat',
            'email',
            'help-center',
            'sms',
        ])
    })

    it('drops channels whose metrics are all null', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { email: 4.5, chat: null },
                createdTickets: { email: 100, chat: null },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceOverviewChannelMetrics(),
        )

        expect(result.current.data.map((r) => r.entity)).toEqual(['email'])
    })

    it('builds row values by reading each metric map by entity key', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                averageCsat: { email: 4.5 },
                resolutionTime: { email: 3600 },
                messagesPerTicket: { email: 3.2 },
                firstResponseTime: { email: 600 },
                humanResponseTimeAfterAiHandoff: { email: 900 },
                createdTickets: { email: 2700 },
                closedTickets: { email: 2500 },
                ticketsReplied: { email: 2200 },
                messagesSent: { email: 8000 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceOverviewChannelMetrics(),
        )

        expect(result.current.data).toEqual([
            {
                entity: 'email',
                averageCsat: 4.5,
                resolutionTime: 3600,
                messagesPerTicket: 3.2,
                firstResponseTime: 600,
                humanResponseTimeAfterAiHandoff: 900,
                createdTickets: 2700,
                closedTickets: 2500,
                ticketsReplied: 2200,
                messagesSent: 8000,
            },
        ])
    })

    it('falls back to null when an entity is missing from a metric map', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { email: 4.5 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceOverviewChannelMetrics(),
        )

        const row = result.current.data[0]
        expect(row.entity).toBe('email')
        expect(row.averageCsat).toBe(4.5)
        expect(row.resolutionTime).toBeNull()
        expect(row.messagesSent).toBeNull()
    })

    it('propagates isLoading, isError, and loadingStates from useEntityMetrics', () => {
        const loadingStates = {
            ...emptyLoadingStates(),
            averageCsat: true,
        }
        mockUseEntityMetrics.mockReturnValue({
            data: emptyEntityMap(),
            isLoading: true,
            isError: true,
            loadingStates,
        })

        const { result } = renderHook(() =>
            usePerformanceOverviewChannelMetrics(),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(true)
        expect(result.current.loadingStates).toBe(loadingStates)
    })
})

describe('fetchPerformanceOverviewChannelMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns an empty CSV when no channel has any metric value', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: emptyEntityMap(),
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceOverviewChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        expect(files[fileName]).toBe('')
    })

    it('writes a header row with the channel label followed by every metric column label', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                createdTickets: { email: 1 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceOverviewChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const [headerLine] = files[fileName].split('\r\n')
        expect(headerLine).toBe(
            [
                '"Performance by channel"',
                '"Resolution time"',
                '"First response time"',
                '"Messages per ticket"',
                '"Average CSAT"',
                '"Human response time after AI handoff"',
                '"Created tickets"',
                '"Closed tickets"',
                '"Tickets replied"',
                '"Messages sent"',
            ].join(','),
        )
    })

    it('writes humanized channel names and metric-format-aware values into data rows', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { email: 4.5 },
                resolutionTime: { email: 3600 },
                messagesPerTicket: { email: 3.2 },
                firstResponseTime: { email: 600 },
                humanResponseTimeAfterAiHandoff: { email: 900 },
                createdTickets: { email: 2700 },
                closedTickets: { email: 2500 },
                ticketsReplied: { email: 2200 },
                messagesSent: { email: 8000 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceOverviewChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const [, dataLine] = files[fileName].split('\r\n')
        expect(dataLine).toBe(
            [
                '"Email"',
                '"1h"',
                '"10m"',
                '"3.2"',
                '"4.5"',
                '"15m"',
                '"2,700"',
                '"2,500"',
                '"2,200"',
                '"8,000"',
            ].join(','),
        )
    })

    it('formats null metric values as the not-available text in the CSV', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { email: 4.5 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceOverviewChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const [, dataLine] = files[fileName].split('\r\n')
        expect(dataLine).toContain('"Email"')
        // resolutionTime, firstResponseTime, etc. are all null → N/A
        expect(
            dataLine.split(',').filter((cell) => cell === '"N/A"').length,
        ).toBe(8)
    })

    it('sorts CSV rows by humanized channel name', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                createdTickets: { sms: 10, email: 20, chat: 30 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceOverviewChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const dataLines = files[fileName].split('\r\n').slice(1)
        expect(dataLines.map((line) => line.split(',')[0])).toEqual([
            '"Chat"',
            '"Email"',
            '"SMS"',
        ])
    })
})

describe('fetchPerformanceOverviewChannelAsConfigurableTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: emptyEntityMap(),
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })
    })

    it('forwards filters and timezone to fetchEntityMetrics and returns files', async () => {
        const result = await fetchPerformanceOverviewChannelAsConfigurableTable(
            null,
            null,
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            ReportingGranularity.Day,
        )

        expect(mockFetchEntityMetrics).toHaveBeenCalledWith(
            expect.any(Object),
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )
        expect(result.files).toBeDefined()
    })
})
