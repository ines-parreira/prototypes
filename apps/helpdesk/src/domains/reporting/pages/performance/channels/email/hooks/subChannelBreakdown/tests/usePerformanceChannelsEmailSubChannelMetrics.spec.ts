import { assumeMock, renderHook } from '@repo/testing'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    fetchPerformanceChannelsEmailSubChannelAsConfigurableTable,
    fetchPerformanceChannelsEmailSubChannelMetrics,
    usePerformanceChannelsEmailSubChannelMetrics,
} from 'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/usePerformanceChannelsEmailSubChannelMetrics'

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

describe('usePerformanceChannelsEmailSubChannelMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
    })

    it('always lists the fixed email and contact-form sub-channels regardless of returned data', () => {
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
            usePerformanceChannelsEmailSubChannelMetrics(),
        )

        expect(result.current.data.map((r) => r.entity).sort()).toEqual([
            'contact_form',
            'email',
        ])
    })

    it('lists sub-channels in the fixed email channel-filter order', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: emptyEntityMap(),
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceChannelsEmailSubChannelMetrics(),
        )

        expect(result.current.data.map((r) => r.entity)).toEqual([
            'email',
            'contact_form',
        ])
    })

    it('keeps every sub-channel even when all metric values are null', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { email: 4.5, contact_form: null },
                createdTickets: { email: 100, contact_form: null },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceChannelsEmailSubChannelMetrics(),
        )

        expect(result.current.data.map((r) => r.entity)).toEqual([
            'email',
            'contact_form',
        ])
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
            usePerformanceChannelsEmailSubChannelMetrics(),
        )

        expect(
            result.current.data.find((row) => row.entity === 'email'),
        ).toEqual({
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
        })
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
            usePerformanceChannelsEmailSubChannelMetrics(),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(true)
        expect(result.current.loadingStates).toBe(loadingStates)
    })
})

describe('fetchPerformanceChannelsEmailSubChannelMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('writes a row for every fixed sub-channel even when there is no data', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: emptyEntityMap(),
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceChannelsEmailSubChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const dataLines = files[fileName].split('\r\n').slice(1)
        expect(dataLines.map((line) => line.split(',')[0])).toEqual([
            '"Email"',
            '"Contact Form"',
        ])
    })

    it('writes a header row with the sub-channel label followed by every metric column label', async () => {
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
            await fetchPerformanceChannelsEmailSubChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const [headerLine] = files[fileName].split('\r\n')
        expect(headerLine).toBe(
            [
                '"Sub-channel"',
                '"Email tickets created"',
                '"Average CSAT"',
                '"Resolution time"',
                '"First response time"',
                '"Messages per ticket"',
                '"Human response time after AI handoff"',
                '"Closed tickets"',
                '"Tickets replied"',
                '"Messages sent"',
            ].join(','),
        )
    })

    it('writes humanized sub-channel names and metric-format-aware values into data rows', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
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

        const { fileName, files } =
            await fetchPerformanceChannelsEmailSubChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const dataLine = files[fileName]
            .split('\r\n')
            .find((line) => line.startsWith('"Email"'))
        expect(dataLine).toBe(
            [
                '"Email"',
                '"2,700"',
                '"4.5"',
                '"1h"',
                '"10m"',
                '"3.2"',
                '"15m"',
                '"2,500"',
                '"2,200"',
                '"8,000"',
            ].join(','),
        )
    })

    it('orders CSV rows by the fixed email channel-filter order', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                createdTickets: { email: 10, contact_form: 20 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceChannelsEmailSubChannelMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            )

        const dataLines = files[fileName].split('\r\n').slice(1)
        expect(dataLines.map((line) => line.split(',')[0])).toEqual([
            '"Email"',
            '"Contact Form"',
        ])
    })
})

describe('fetchPerformanceChannelsEmailSubChannelAsConfigurableTable', () => {
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
        const result =
            await fetchPerformanceChannelsEmailSubChannelAsConfigurableTable(
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
