import { renderHook } from '@repo/testing'

import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'

import {
    fetchSupportAgentsPerformanceByIntentAsConfigurableTable,
    fetchSupportAgentsPerformanceByIntentMetrics,
    useSupportAgentsPerformanceByIntentMetrics,
} from '../useSupportAgentsPerformanceByIntentMetrics'

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
    'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerSupportAgentIntent',
    () => ({
        useAutomatedInteractionsPerSupportAgentIntent: jest.fn(),
        fetchAutomatedInteractionsPerSupportAgentIntent: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerSupportAgentIntent',
    () => ({
        useHandoverInteractionsPerSupportAgentIntent: jest.fn(),
        fetchHandoverInteractionsPerSupportAgentIntent: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSuccessRatePerSupportAgentIntent',
    () => ({
        useSuccessRatePerSupportAgentIntent: jest.fn(),
        fetchSuccessRatePerSupportAgentIntent: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useCostSavedPerSupportAgentIntent',
    () => ({
        useCostSavedPerSupportAgentIntent: jest.fn(),
        fetchCostSavedPerSupportAgentIntent: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDecreaseInFRTPerSupportAgentIntent',
    () => ({
        useDecreaseInFRTPerSupportAgentIntent: jest.fn(),
        fetchDecreaseInFRTPerSupportAgentIntent: jest.fn(),
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
const mockFetchCostSavedPerSupportAgentIntent = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useCostSavedPerSupportAgentIntent',
).fetchCostSavedPerSupportAgentIntent as jest.Mock
const mockFormatMetricValue = jest.requireMock('@repo/reporting')
    .formatMetricValue as jest.Mock

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
    successRate: { 'Billing :: Refund': 0.82, 'Shipping :: Status': 0.71 },
    costSaved: { 'Billing :: Refund': 800, 'Shipping :: Status': 450 },
    decreaseInFRT: { 'Billing :: Refund': 180, 'Shipping :: Status': 75 },
}

const defaultRows = [
    {
        entity: 'Billing :: Refund',
        intentL1: 'Billing',
        intentL2: 'Refund',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        successRate: 0.82,
        costSaved: 800,
        decreaseInFRT: 180,
    },
    {
        entity: 'Shipping :: Status',
        intentL1: 'Shipping',
        intentL2: 'Status',
        automatedInteractions: 900,
        handoverInteractions: 60,
        successRate: 0.71,
        costSaved: 450,
        decreaseInFRT: 75,
    },
]

describe('useSupportAgentsPerformanceByIntentMetrics', () => {
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
                successRate: false,
                costSaved: false,
                decreaseInFRT: false,
            },
        })
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() =>
            useSupportAgentsPerformanceByIntentMetrics(),
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
                successRate: false,
                costSaved: false,
                decreaseInFRT: false,
            },
        })

        const { result } = renderHook(() =>
            useSupportAgentsPerformanceByIntentMetrics(),
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
                successRate: false,
                costSaved: false,
                decreaseInFRT: false,
            },
        })

        const { result } = renderHook(() =>
            useSupportAgentsPerformanceByIntentMetrics(),
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
                successRate: false,
                costSaved: false,
                decreaseInFRT: false,
            },
        })

        const { result } = renderHook(() =>
            useSupportAgentsPerformanceByIntentMetrics(),
        )

        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.successRate).toBe(false)
        expect(result.current.loadingStates.costSaved).toBe(false)
        expect(result.current.loadingStates.decreaseInFRT).toBe(false)
    })

    it('returns empty data when still loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: true,
            isError: false,
            loadingStates: {
                automatedInteractions: true,
                handoverInteractions: true,
                successRate: true,
                costSaved: true,
                decreaseInFRT: true,
            },
        })
        mockAssembleEntityRows.mockReturnValue([])

        const { result } = renderHook(() =>
            useSupportAgentsPerformanceByIntentMetrics(),
        )

        expect(result.current.data).toEqual([])
    })

    it('passes metricsConfig with only use functions to useEntityMetrics', () => {
        renderHook(() => useSupportAgentsPerformanceByIntentMetrics())

        const [passedConfig] = mockUseEntityMetrics.mock.calls[0]
        Object.keys(passedConfig).forEach((key) => {
            expect(typeof passedConfig[key].use).toBe('function')
            expect(passedConfig[key].fetch).toBeUndefined()
        })
    })

    describe('buildSupportAgentsPerformanceByIntentRow', () => {
        it('splits intent entity string into intentL1 and intentL2', () => {
            renderHook(() => useSupportAgentsPerformanceByIntentMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][2]
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
                    successRate: {},
                    costSaved: {},
                    decreaseInFRT: {},
                },
                isLoading: false,
                isError: false,
                loadingStates: {
                    automatedInteractions: false,
                    handoverInteractions: false,
                    successRate: false,
                    costSaved: false,
                    decreaseInFRT: false,
                },
            })

            renderHook(() => useSupportAgentsPerformanceByIntentMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][2]
            const row = rowBuilder('Billing :: Refund')

            expect(row.automatedInteractions).toBeNull()
            expect(row.handoverInteractions).toBeNull()
            expect(row.successRate).toBeNull()
            expect(row.costSaved).toBeNull()
            expect(row.decreaseInFRT).toBeNull()
        })

        it('returns an empty second intent level when the entity does not include a delimiter', () => {
            renderHook(() => useSupportAgentsPerformanceByIntentMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][2]
            const row = rowBuilder('Billing')

            expect(row.intentL1).toBe('Billing')
            expect(row.intentL2).toBe('')
        })
    })

    it('passes the merged set of non-empty entities to assembleEntityRows', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                automatedInteractions: {
                    'Billing :: Refund': 1500,
                    'Shipping :: Status': 900,
                },
                handoverInteractions: {
                    'Billing :: Refund': 120,
                    '': 10,
                },
                successRate: { 'Account :: Login': 0.9 },
                costSaved: {},
                decreaseInFRT: {},
            },
            isLoading: false,
            isError: false,
            loadingStates: {
                automatedInteractions: false,
                handoverInteractions: false,
                successRate: false,
                costSaved: false,
                decreaseInFRT: false,
            },
        })

        renderHook(() => useSupportAgentsPerformanceByIntentMetrics())

        const passedEntities = mockAssembleEntityRows.mock.calls[0][1]
        expect(passedEntities).toEqual([
            'Billing :: Refund',
            'Shipping :: Status',
            'Account :: Login',
        ])
    })
})

describe('fetchSupportAgentsPerformanceByIntentMetrics', () => {
    const mockMetricsData = {
        automatedInteractions: { 'Billing :: Refund': 1500 },
        handoverInteractions: { 'Billing :: Refund': 120 },
        successRate: { 'Billing :: Refund': 0.82 },
        costSaved: { 'Billing :: Refund': 800 },
        decreaseInFRT: { 'Billing :: Refund': 180 },
    }

    const mockRow = {
        entity: 'Billing :: Refund',
        intentL1: 'Billing',
        intentL2: 'Refund',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        successRate: 0.82,
        costSaved: 800,
        decreaseInFRT: 180,
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
            '2024-01-01_2024-01-31-support_agents_performance_by_intent_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('passes only period filters to fetchEntityMetrics', async () => {
        const filtersWithExtra = {
            ...MOCK_STATS_FILTERS,
            channels: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['email'],
            },
        }

        await fetchSupportAgentsPerformanceByIntentMetrics(
            filtersWithExtra,
            MOCK_TIMEZONE,
        )

        const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
        expect(passedFilters).toEqual({ period: MOCK_STATS_FILTERS.period })
    })

    it('includes Intent L1 and Intent L2 as the first CSV headers', async () => {
        await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const headers = csvCallArgs[0]
        expect(headers[0]).toBe('Intent L1')
        expect(headers[1]).toBe('Intent L2')
    })

    it('includes intentL1 and intentL2 as the first two values in each CSV row', async () => {
        await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('Billing')
        expect(firstDataRow[1]).toBe('Refund')
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe(
            '2024-01-01_2024-01-31-support_agents_performance_by_intent_table',
        )
    })

    it('passes costSavedPerInteraction to the costSaved fetch config', async () => {
        const customCost = 99

        await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        expect(typeof passedConfig.costSaved.fetch).toBe('function')

        await passedConfig.costSaved.fetch(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        expect(mockFetchCostSavedPerSupportAgentIntent).toHaveBeenCalledWith(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )
    })

    it('passes fetchConfig with only fetch functions to fetchEntityMetrics', async () => {
        await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        Object.keys(passedConfig).forEach((key) => {
            expect(typeof passedConfig[key].fetch).toBe('function')
            expect(passedConfig[key].use).toBeUndefined()
        })
    })

    it('formats each metric cell before building the CSV', async () => {
        await fetchSupportAgentsPerformanceByIntentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFormatMetricValue).toHaveBeenCalled()
        expect(mockFormatMetricValue).toHaveBeenCalledWith(
            mockRow.automatedInteractions,
            SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS[0].metricFormat,
        )
    })
})

describe('fetchSupportAgentsPerformanceByIntentAsConfigurableTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                automatedInteractions: { 'Billing :: Refund': 1500 },
                handoverInteractions: { 'Billing :: Refund': 120 },
                successRate: { 'Billing :: Refund': 0.82 },
                costSaved: { 'Billing :: Refund': 800 },
                decreaseInFRT: { 'Billing :: Refund': 180 },
            },
            isLoading: false,
            isError: false,
        })
        mockAssembleEntityRows.mockReturnValue([
            {
                entity: 'Billing :: Refund',
                intentL1: 'Billing',
                intentL2: 'Refund',
                automatedInteractions: 1500,
                handoverInteractions: 120,
                successRate: 0.82,
                costSaved: 800,
                decreaseInFRT: 180,
            },
        ])
        mockGetCsvFileNameWithDates.mockReturnValue('intent-table-filename')
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns files from fetchSupportAgentsPerformanceByIntentMetrics', async () => {
        const result =
            await fetchSupportAgentsPerformanceByIntentAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files['intent-table-filename']).toBe('csv-content')
    })

    it('ignores savedMeasure and savedDimension arguments', async () => {
        const result =
            await fetchSupportAgentsPerformanceByIntentAsConfigurableTable(
                'some-measure',
                'some-dimension',
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files['intent-table-filename']).toBe('csv-content')
    })

    it('returns empty file content when underlying fetch returns empty data', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result =
            await fetchSupportAgentsPerformanceByIntentAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files['intent-table-filename']).toBe('')
    })
})
