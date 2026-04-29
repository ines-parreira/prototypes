import { renderHook } from '@repo/testing'

import { ReportingGranularity } from 'domains/reporting/models/types'

import {
    fetchAiAgentSalesPerformanceByChannelAsConfigurableTable,
    fetchAiAgentSalesPerformanceByChannelMetrics,
    useAiAgentSalesPerformanceByChannelMetrics,
} from '../useAiAgentSalesPerformanceByChannelMetrics'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters', () => ({
    useAiAgentStatsFilters: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useEntityMetrics: jest.fn(),
    assembleEntityRows: jest.fn(),
    fetchEntityMetrics: jest.fn(),
    mapMetricValues: jest.fn(),
}))
jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(),
}))
jest.mock('@repo/reporting', () => ({
    formatMetricValue: jest.fn((v: number) => String(v ?? '')),
}))
jest.mock('utils/file', () => ({
    createCsv: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerSalesAgentChannel',
    () => ({
        useAutomatedInteractionsPerSalesAgentChannel: jest.fn(),
        fetchAutomatedInteractionsPerSalesAgentChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerSalesAgentChannel',
    () => ({
        useHandoverInteractionsPerSalesAgentChannel: jest.fn(),
        fetchHandoverInteractionsPerSalesAgentChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useConversionRatePerSalesAgentChannel',
    () => ({
        useConversionRatePerSalesAgentChannel: jest.fn(),
        fetchConversionRatePerSalesAgentChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesPerSalesAgentChannel',
    () => ({
        useTotalSalesPerSalesAgentChannel: jest.fn(),
        fetchTotalSalesPerSalesAgentChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useOrdersInfluencedPerSalesAgentChannel',
    () => ({
        useOrdersInfluencedPerSalesAgentChannel: jest.fn(),
        fetchOrdersInfluencedPerSalesAgentChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useRevenuePerInteractionPerSalesAgentChannel',
    () => ({
        useRevenuePerInteractionPerSalesAgentChannel: jest.fn(),
        fetchRevenuePerInteractionPerSalesAgentChannel: jest.fn(),
    }),
)

const mockUseAiAgentStatsFilters = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentStatsFilters',
).useAiAgentStatsFilters as jest.Mock

const mockUseEntityMetrics = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useEntityMetrics as jest.Mock

const mockAssembleEntityRows = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).assembleEntityRows as jest.Mock

const mockFetchEntityMetrics = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchEntityMetrics as jest.Mock

const mockGetCsvFileNameWithDates = jest.requireMock(
    'domains/reporting/hooks/common/utils',
).getCsvFileNameWithDates as jest.Mock

const mockCreateCsv = jest.requireMock('utils/file').createCsv as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'

const defaultEntityData = {
    automatedInteractions: { email: 1200, chat: 800 },
    handoverInteractions: { email: 45, chat: 12 },
    conversionRate: { email: 0.12, chat: 0.08 },
    totalSales: { email: 6225, chat: 4048 },
    ordersInfluenced: { email: 50, chat: 32 },
    revenuePerInteraction: { email: 5.0, chat: 4.97 },
}

const defaultRows = [
    {
        entity: 'email',
        automatedInteractions: 1200,
        handoverInteractions: 45,
        conversionRate: 0.12,
        totalSales: 6225,
        ordersInfluenced: 50,
        revenuePerInteraction: 5.0,
    },
    {
        entity: 'chat',
        automatedInteractions: 800,
        handoverInteractions: 12,
        conversionRate: 0.08,
        totalSales: 4048,
        ordersInfluenced: 32,
        revenuePerInteraction: 4.97,
    },
]

describe('useAiAgentSalesPerformanceByChannelMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                automatedInteractions: false,
                handoverInteractions: false,
                conversionRate: false,
                totalSales: false,
                ordersInfluenced: false,
                revenuePerInteraction: false,
            },
        })
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() =>
            useAiAgentSalesPerformanceByChannelMetrics(),
        )

        expect(result.current.data).toEqual(defaultRows)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('returns isLoading true when entity metrics are loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: true,
            isError: false,
            loadingStates: {
                automatedInteractions: true,
                handoverInteractions: false,
                conversionRate: false,
                totalSales: false,
                ordersInfluenced: false,
                revenuePerInteraction: false,
            },
        })

        const { result } = renderHook(() =>
            useAiAgentSalesPerformanceByChannelMetrics(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isError true when entity metrics have an error', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: true,
            loadingStates: {
                automatedInteractions: false,
                handoverInteractions: false,
                conversionRate: false,
                totalSales: false,
                ordersInfluenced: false,
                revenuePerInteraction: false,
            },
        })

        const { result } = renderHook(() =>
            useAiAgentSalesPerformanceByChannelMetrics(),
        )

        expect(result.current.isError).toBe(true)
    })

    it('maps entity loading states to output loading states', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                automatedInteractions: false,
                handoverInteractions: true,
                conversionRate: false,
                totalSales: false,
                ordersInfluenced: false,
                revenuePerInteraction: false,
            },
        })

        const { result } = renderHook(() =>
            useAiAgentSalesPerformanceByChannelMetrics(),
        )

        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.conversionRate).toBe(false)
        expect(result.current.loadingStates.totalSales).toBe(false)
        expect(result.current.loadingStates.ordersInfluenced).toBe(false)
        expect(result.current.loadingStates.revenuePerInteraction).toBe(false)
    })

    describe('buildAiAgentSalesPerformanceByChannelRow', () => {
        it('falls back to null when entity data values are missing', () => {
            mockUseEntityMetrics.mockReturnValue({
                data: {
                    automatedInteractions: {},
                    handoverInteractions: {},
                    conversionRate: {},
                    totalSales: {},
                    ordersInfluenced: {},
                    revenuePerInteraction: {},
                },
                isLoading: false,
                isError: false,
                loadingStates: {
                    automatedInteractions: false,
                    handoverInteractions: false,
                    conversionRate: false,
                    totalSales: false,
                    ordersInfluenced: false,
                    revenuePerInteraction: false,
                },
            })

            renderHook(() => useAiAgentSalesPerformanceByChannelMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][1]
            const row = rowBuilder('email')

            expect(row.automatedInteractions).toBeNull()
            expect(row.handoverInteractions).toBeNull()
            expect(row.conversionRate).toBeNull()
            expect(row.totalSales).toBeNull()
            expect(row.ordersInfluenced).toBeNull()
            expect(row.revenuePerInteraction).toBeNull()
        })

        it('reads revenuePerInteraction directly from entity data', () => {
            mockUseEntityMetrics.mockReturnValue({
                data: defaultEntityData,
                isLoading: false,
                isError: false,
                loadingStates: {
                    automatedInteractions: false,
                    handoverInteractions: false,
                    conversionRate: false,
                    totalSales: false,
                    ordersInfluenced: false,
                    revenuePerInteraction: false,
                },
            })

            renderHook(() => useAiAgentSalesPerformanceByChannelMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][1]
            const row = rowBuilder('email')

            expect(row.revenuePerInteraction).toBe(5.0)
        })

        it('returns null revenuePerInteraction when value is null', () => {
            mockUseEntityMetrics.mockReturnValue({
                data: {
                    ...defaultEntityData,
                    revenuePerInteraction: { email: null },
                },
                isLoading: false,
                isError: false,
                loadingStates: {
                    automatedInteractions: false,
                    handoverInteractions: false,
                    conversionRate: false,
                    totalSales: false,
                    ordersInfluenced: false,
                    revenuePerInteraction: false,
                },
            })

            renderHook(() => useAiAgentSalesPerformanceByChannelMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][1]
            const row = rowBuilder('email')

            expect(row.revenuePerInteraction).toBeNull()
        })
    })
})

describe('fetchAiAgentSalesPerformanceByChannelMetrics', () => {
    const mockMetricsData = {
        automatedInteractions: { email: 1200 },
        handoverInteractions: { email: 45 },
        conversionRate: { email: 0.12 },
        totalSales: { email: 6225 },
        ordersInfluenced: { email: 50 },
        revenuePerInteraction: { email: 5.0 },
    }

    const mockRow = {
        entity: 'email' as const,
        automatedInteractions: 1200,
        handoverInteractions: 45,
        conversionRate: 0.12,
        totalSales: 6225,
        ordersInfluenced: 50,
        revenuePerInteraction: 5.0,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        mockAssembleEntityRows.mockReturnValue([mockRow])
        mockGetCsvFileNameWithDates.mockReturnValue(
            '2024-01-01_2024-01-31-ai_agent_sales_performance_by_channel_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchAiAgentSalesPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchAiAgentSalesPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('passes full statsFilters to fetchEntityMetrics', async () => {
        const filtersWithExtra = { ...MOCK_STATS_FILTERS, channel: 'chat' }

        await fetchAiAgentSalesPerformanceByChannelMetrics(
            filtersWithExtra,
            MOCK_TIMEZONE,
        )

        const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
        expect(passedFilters).toEqual(filtersWithExtra)
    })

    it('uses channel display names in CSV rows', async () => {
        await fetchAiAgentSalesPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('Email')
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchAiAgentSalesPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe(
            '2024-01-01_2024-01-31-ai_agent_sales_performance_by_channel_table',
        )
    })

    describe('fetchAiAgentSalesPerformanceByChannelAsConfigurableTable', () => {
        it('passes filters and timezone to the underlying fetch function', async () => {
            await fetchAiAgentSalesPerformanceByChannelAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

            const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
            expect(passedFilters).toEqual(MOCK_STATS_FILTERS)
        })
    })
})

describe('fetchAiAgentSalesPerformanceByChannelAsConfigurableTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                automatedInteractions: { email: 1200 },
                handoverInteractions: { email: 45 },
                conversionRate: { email: 0.12 },
                totalSales: { email: 6225 },
                ordersInfluenced: { email: 50 },
                revenuePerInteraction: { email: 5.0 },
            },
            isLoading: false,
            isError: false,
        })

        mockAssembleEntityRows.mockReturnValue([
            {
                entity: 'email' as const,
                automatedInteractions: 1200,
                handoverInteractions: 45,
                conversionRate: 0.12,
                totalSales: 6225,
                ordersInfluenced: 50,
                revenuePerInteraction: 5.0,
            },
        ])
        mockGetCsvFileNameWithDates.mockReturnValue('channel-table-filename')
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns files from fetchAiAgentSalesPerformanceByChannelMetrics', async () => {
        const result =
            await fetchAiAgentSalesPerformanceByChannelAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files['channel-table-filename']).toBe('csv-content')
    })

    it('ignores savedMeasure and savedDimension arguments', async () => {
        const result =
            await fetchAiAgentSalesPerformanceByChannelAsConfigurableTable(
                'some-measure',
                'some-dimension',
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files['channel-table-filename']).toBe('csv-content')
    })

    it('returns empty files object when underlying fetch returns empty content', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result =
            await fetchAiAgentSalesPerformanceByChannelAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files['channel-table-filename']).toBe('')
    })
})
