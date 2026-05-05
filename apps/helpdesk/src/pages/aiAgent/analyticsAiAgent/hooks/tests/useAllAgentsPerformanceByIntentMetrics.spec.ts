import { renderHook } from '@repo/testing'

import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import {
    fetchAllAgentsPerformanceByIntentAsConfigurableTable,
    fetchAllAgentsPerformanceByIntentMetrics,
    useAllAgentsPerformanceByIntentMetrics,
} from '../useAllAgentsPerformanceByIntentMetrics'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters', () => ({
    useAiAgentStatsFilters: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useEntityMetrics: jest.fn(),
    assembleEntityRows: jest.fn(),
    fetchEntityMetrics: jest.fn(),
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
    'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerIntent',
    () => ({
        useAutomatedInteractionsPerIntent: jest.fn(),
        fetchAutomatedInteractionsPerIntent: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerAllAgentsIntent',
    () => ({
        useHandoverInteractionsPerAllAgentsIntent: jest.fn(),
        fetchHandoverInteractionsPerAllAgentsIntent: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentCoverageRatePerIntent',
    () => ({
        useAiAgentCoverageRatePerIntent: jest.fn(),
        fetchAiAgentCoverageRatePerIntent: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSuccessRatePerIntent',
    () => ({
        useAiAgentSuccessRatePerIntent: jest.fn(),
        fetchAiAgentSuccessRatePerIntent: jest.fn(),
    }),
)
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useCostSavedPerIntent', () => ({
    useCostSavedPerIntent: jest.fn(),
    fetchCostSavedPerIntent: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useConversionRatePerIntent',
    () => ({
        useConversionRatePerIntent: jest.fn(),
        fetchConversionRatePerIntent: jest.fn(),
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
    automatedInteractions: {
        'Billing :: Refund': 1500,
        'Shipping :: Status': 900,
    },
    handoverInteractions: {
        'Billing :: Refund': 120,
        'Shipping :: Status': 60,
    },
    costSaved: { 'Billing :: Refund': 800, 'Shipping :: Status': 450 },
    coverageRate: { 'Billing :: Refund': 0.87, 'Shipping :: Status': 0.93 },
    successRate: { 'Billing :: Refund': 0.81, 'Shipping :: Status': 0.88 },
    conversionRate: { 'Billing :: Refund': 0.42, 'Shipping :: Status': 0.18 },
}

const defaultRows = [
    {
        entity: 'Billing :: Refund',
        intentL1: 'Billing',
        intentL2: 'Refund',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        costSaved: 800,
        coverageRate: 0.87,
        successRate: 0.81,
        conversionRate: 0.42,
    },
    {
        entity: 'Shipping :: Status',
        intentL1: 'Shipping',
        intentL2: 'Status',
        automatedInteractions: 900,
        handoverInteractions: 60,
        costSaved: 450,
        coverageRate: 0.93,
        successRate: 0.88,
        conversionRate: 0.18,
    },
]

describe('useAllAgentsPerformanceByIntentMetrics', () => {
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
                costSaved: false,
                coverageRate: false,
                successRate: false,
                conversionRate: false,
            },
        })
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() =>
            useAllAgentsPerformanceByIntentMetrics(),
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
                costSaved: false,
                coverageRate: false,
                successRate: false,
                conversionRate: false,
            },
        })

        const { result } = renderHook(() =>
            useAllAgentsPerformanceByIntentMetrics(),
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
                costSaved: false,
                coverageRate: false,
                successRate: false,
                conversionRate: false,
            },
        })

        const { result } = renderHook(() =>
            useAllAgentsPerformanceByIntentMetrics(),
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
                costSaved: false,
                coverageRate: false,
                successRate: false,
                conversionRate: false,
            },
        })

        const { result } = renderHook(() =>
            useAllAgentsPerformanceByIntentMetrics(),
        )

        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.costSaved).toBe(false)
        expect(result.current.loadingStates.coverageRate).toBe(false)
        expect(result.current.loadingStates.successRate).toBe(false)
        expect(result.current.loadingStates.conversionRate).toBe(false)
    })

    it('returns empty data when still loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: true,
            isError: false,
            loadingStates: {
                automatedInteractions: true,
                handoverInteractions: true,
                costSaved: true,
                coverageRate: true,
                successRate: true,
                conversionRate: true,
            },
        })
        mockAssembleEntityRows.mockReturnValue([])

        const { result } = renderHook(() =>
            useAllAgentsPerformanceByIntentMetrics(),
        )

        expect(result.current.data).toEqual([])
    })

    it('passes metricsConfig with only use functions to useEntityMetrics', () => {
        renderHook(() => useAllAgentsPerformanceByIntentMetrics())

        const [passedConfig] = mockUseEntityMetrics.mock.calls[0]
        Object.keys(passedConfig).forEach((key) => {
            expect(typeof passedConfig[key].use).toBe('function')
            expect(passedConfig[key].fetch).toBeUndefined()
        })
    })

    describe('buildAllAgentsPerformanceByIntentRow', () => {
        it('splits intent entity string into intentL1 and intentL2', () => {
            mockUseEntityMetrics.mockReturnValue({
                data: defaultEntityData,
                isLoading: false,
                isError: false,
                loadingStates: {
                    automatedInteractions: false,
                    handoverInteractions: false,
                    costSaved: false,
                    coverageRate: false,
                    successRate: false,
                },
            })

            renderHook(() => useAllAgentsPerformanceByIntentMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][1]
            const row = rowBuilder('Billing :: Refund')

            expect(row.intentL1).toBe('Billing')
            expect(row.intentL2).toBe('Refund')
            expect(row.entity).toBe('Billing :: Refund')
        })

        it('falls back to null when entity data values are missing', () => {
            mockUseEntityMetrics.mockReturnValue({
                data: {
                    automatedInteractions: {},
                    handoverInteractions: {},
                    costSaved: {},
                    coverageRate: {},
                    successRate: {},
                    conversionRate: {},
                },
                isLoading: false,
                isError: false,
                loadingStates: {
                    automatedInteractions: false,
                    handoverInteractions: false,
                    costSaved: false,
                    coverageRate: false,
                    successRate: false,
                    conversionRate: false,
                },
            })

            renderHook(() => useAllAgentsPerformanceByIntentMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][1]
            const row = rowBuilder('Billing :: Refund')

            expect(row.automatedInteractions).toBeNull()
            expect(row.handoverInteractions).toBeNull()
            expect(row.costSaved).toBeNull()
            expect(row.coverageRate).toBeNull()
            expect(row.successRate).toBeNull()
            expect(row.conversionRate).toBeNull()
        })
    })
})

describe('fetchAllAgentsPerformanceByIntentMetrics', () => {
    const mockMetricsData = {
        automatedInteractions: { 'Billing :: Refund': 1500 },
        handoverInteractions: { 'Billing :: Refund': 120 },
        costSaved: { 'Billing :: Refund': 800 },
        coverageRate: { 'Billing :: Refund': 0.87 },
        successRate: { 'Billing :: Refund': 0.81 },
        conversionRate: { 'Billing :: Refund': 0.42 },
    }

    const mockRow = {
        entity: 'Billing :: Refund',
        intentL1: 'Billing',
        intentL2: 'Refund',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        costSaved: 800,
        coverageRate: 0.87,
        successRate: 0.81,
        conversionRate: 0.42,
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
            '2024-01-01_2024-01-31-all_agents_performance_by_intent_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchAllAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchAllAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('passes full statsFilters to fetchEntityMetrics', async () => {
        const filtersWithExtra = {
            ...MOCK_STATS_FILTERS,
            channels: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['email'],
            },
        }

        await fetchAllAgentsPerformanceByIntentMetrics(
            filtersWithExtra,
            MOCK_TIMEZONE,
        )

        const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
        expect(passedFilters).toEqual(filtersWithExtra)
    })

    it('includes Intent L1 and Intent L2 as the first CSV headers', async () => {
        await fetchAllAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const headers = csvCallArgs[0]
        expect(headers[0]).toBe('Intent L1')
        expect(headers[1]).toBe('Intent L2')
    })

    it('includes intentL1 and intentL2 as the first two values in each CSV row', async () => {
        await fetchAllAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('Billing')
        expect(firstDataRow[1]).toBe('Refund')
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchAllAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe(
            '2024-01-01_2024-01-31-all_agents_performance_by_intent_table',
        )
    })

    it('passes costSavedPerInteraction to the costSaved fetch config', async () => {
        const customCost = 99

        await fetchAllAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        expect(typeof passedConfig.costSaved.fetch).toBe('function')
    })

    it('passes fetchConfig with only fetch functions to fetchEntityMetrics', async () => {
        await fetchAllAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        Object.keys(passedConfig).forEach((key) => {
            expect(typeof passedConfig[key].fetch).toBe('function')
            expect(passedConfig[key].use).toBeUndefined()
        })
    })

    describe('fetchAllAgentsPerformanceByIntentAsConfigurableTable', () => {
        it('passes filters and timezone to the underlying fetch function', async () => {
            await fetchAllAgentsPerformanceByIntentAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

            const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
            expect(passedFilters).toEqual(MOCK_STATS_FILTERS)
        })

        it('forwards costSavedPerInteraction from extra to the underlying fetch function', async () => {
            await fetchAllAgentsPerformanceByIntentAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
                { costSavedPerInteraction: 5.5 },
            )

            const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
            expect(typeof passedConfig.costSaved.fetch).toBe('function')
        })
    })
})
