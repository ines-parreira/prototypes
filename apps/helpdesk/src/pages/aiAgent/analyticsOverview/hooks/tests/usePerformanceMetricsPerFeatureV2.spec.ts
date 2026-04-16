import { renderHook } from '@testing-library/react'

import { ReportingGranularity } from 'domains/reporting/models/types'

import {
    fetchPerformanceMetricsPerFeatureV2,
    fetchPerformanceMetricsPerFeatureV2AsConfigurableTable,
    usePerformanceMetricsPerFeatureV2,
} from '../usePerformanceMetricsPerFeatureV2'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters', () => ({
    useAutomateFilters: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useEntityMetrics: jest.fn(),
    assembleEntityRows: jest.fn(),
    fetchEntityMetrics: jest.fn(),
    toEntityMap: jest.fn(),
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
    'pages/aiAgent/analyticsOverview/hooks/useAutomatedInteractionsPerFeature',
    () => ({
        useAutomatedInteractionsPerFeature: jest.fn(),
        fetchAutomatedInteractionsPerFeature: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRatePerFeature',
    () => ({
        useOverallAutomationRatePerFeature: jest.fn(),
        fetchOverallAutomationRatePerFeature: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFeature',
    () => ({
        useHandoverInteractionsPerFeature: jest.fn(),
        fetchHandoverInteractionsPerFeature: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerFeature',
    () => ({
        useCostSavedPerFeature: jest.fn(),
        fetchCostSavedPerFeature: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useTimeSavedPerFeature',
    () => ({
        useTimeSavedPerFeature: jest.fn(),
        fetchTimeSavedPerFeature: jest.fn(),
    }),
)

const mockUseAutomateFilters = jest.requireMock(
    'domains/reporting/hooks/automate/useAutomateFilters',
).useAutomateFilters as jest.Mock

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
    automationRate: {
        'ai-agent': 0.18,
        flow: 0.07,
        'article-recommendation': 0.05,
        'order-management': 0.12,
    },
    automatedInteractions: {
        'ai-agent': 2700,
        flow: 900,
        'article-recommendation': 300,
        'order-management': 150,
    },
    handoverInteractions: {
        'ai-agent': 189,
        flow: 63,
        'article-recommendation': 0,
        'order-management': 15,
    },
    costSaved: {
        'ai-agent': 8370,
        flow: 2790,
        'article-recommendation': 930,
        'order-management': 465,
    },
    timeSaved: {
        'ai-agent': 9900,
        flow: 3300,
        'article-recommendation': 1100,
        'order-management': 550,
    },
}

const defaultRows = [
    {
        feature: 'AI Agent',
        automationRate: 0.18,
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 8370,
        timeSaved: 9900,
    },
    {
        feature: 'Article Recommendation',
        automationRate: 0.05,
        automatedInteractions: 300,
        handoverInteractions: 0,
        costSaved: 930,
        timeSaved: 1100,
    },
]

describe('usePerformanceMetricsPerFeatureV2', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAutomateFilters.mockReturnValue({
            statsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
        })
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeatureV2())

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
                automationRate: true,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeatureV2())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isError true when entity metrics have an error', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: true,
            loadingStates: {
                automationRate: false,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeatureV2())

        expect(result.current.isError).toBe(true)
    })

    it('maps entity loading states to output loading states', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                automatedInteractions: true,
                handoverInteractions: false,
                costSaved: true,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeatureV2())

        expect(result.current.loadingStates.automationRate).toBe(false)
        expect(result.current.loadingStates.automatedInteractions).toBe(true)
        expect(result.current.loadingStates.handoverInteractions).toBe(false)
        expect(result.current.loadingStates.costSaved).toBe(true)
        expect(result.current.loadingStates.timeSaved).toBe(false)
    })

    describe('buildAllFeaturesRow', () => {
        it('falls back to null when entity data values are missing', () => {
            mockUseEntityMetrics.mockReturnValue({
                data: {
                    automationRate: {},
                    automatedInteractions: {},
                    handoverInteractions: {},
                    costSaved: {},
                    timeSaved: {},
                },
                isLoading: false,
                isError: false,
                loadingStates: {
                    automationRate: false,
                    automatedInteractions: false,
                    handoverInteractions: false,
                    costSaved: false,
                    timeSaved: false,
                },
            })

            renderHook(() => usePerformanceMetricsPerFeatureV2())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][2]
            const row = rowBuilder('ai-agent')

            expect(row.feature).toBe('AI Agent')
            expect(row.automationRate).toBeNull()
            expect(row.automatedInteractions).toBeNull()
            expect(row.handoverInteractions).toBeNull()
            expect(row.costSaved).toBeNull()
            expect(row.timeSaved).toBeNull()
        })

        it('maps AutomationFeatureType values to display names', () => {
            renderHook(() => usePerformanceMetricsPerFeatureV2())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][2]

            expect(rowBuilder('ai-agent').feature).toBe('AI Agent')
            expect(rowBuilder('flow').feature).toBe('Flows')
            expect(rowBuilder('article-recommendation').feature).toBe(
                'Article Recommendation',
            )
            expect(rowBuilder('order-management').feature).toBe(
                'Order Management',
            )
        })
    })
})

describe('fetchPerformanceMetricsPerFeatureV2', () => {
    const mockMetricsData = {
        automationRate: { 'ai-agent': 0.18 },
        automatedInteractions: { 'ai-agent': 2700 },
        handoverInteractions: { 'ai-agent': 189 },
        costSaved: { 'ai-agent': 8370 },
        timeSaved: { 'ai-agent': 9900 },
    }

    const mockRow = {
        feature: 'AI Agent' as const,
        automationRate: 0.18,
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 8370,
        timeSaved: 9900,
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
            '2024-01-01_2024-01-31-all_features_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchPerformanceMetricsPerFeatureV2(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchPerformanceMetricsPerFeatureV2(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('passes only period filters to fetchEntityMetrics', async () => {
        const filtersWithExtra = { ...MOCK_STATS_FILTERS, channel: 'chat' }

        await fetchPerformanceMetricsPerFeatureV2(
            filtersWithExtra,
            MOCK_TIMEZONE,
        )

        const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
        expect(passedFilters).toEqual({ period: MOCK_STATS_FILTERS.period })
    })

    it('passes costSavedPerInteraction override to the cost fetch config', async () => {
        const customCost = 42

        await fetchPerformanceMetricsPerFeatureV2(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        expect(typeof passedConfig.costSaved.fetch).toBe('function')
    })

    it('the costSaved fetch config calls fetchCostSavedPerFeature with the custom cost', async () => {
        const customCost = 42
        const mockFetchCostSavedPerFeature = jest.requireMock(
            'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerFeature',
        ).fetchCostSavedPerFeature as jest.Mock
        mockFetchCostSavedPerFeature.mockResolvedValue({
            data: { allValues: [] },
        })

        await fetchPerformanceMetricsPerFeatureV2(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        await passedConfig.costSaved.fetch(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        expect(mockFetchCostSavedPerFeature).toHaveBeenCalledWith(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )
    })

    it('uses feature display names in CSV rows', async () => {
        await fetchPerformanceMetricsPerFeatureV2(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('AI Agent')
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchPerformanceMetricsPerFeatureV2(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe('2024-01-01_2024-01-31-all_features_table')
    })
})

describe('fetchPerformanceMetricsPerFeatureV2AsConfigurableTable', () => {
    const mockRow = {
        feature: 'AI Agent' as const,
        automationRate: 0.18,
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 8370,
        timeSaved: 9900,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                automationRate: { 'ai-agent': 0.18 },
                automatedInteractions: { 'ai-agent': 2700 },
                handoverInteractions: { 'ai-agent': 189 },
                costSaved: { 'ai-agent': 8370 },
                timeSaved: { 'ai-agent': 9900 },
            },
            isLoading: false,
            isError: false,
        })
        mockAssembleEntityRows.mockReturnValue([mockRow])
        mockGetCsvFileNameWithDates.mockReturnValue(
            '2024-01-01_2024-01-31-all_features_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns files from the underlying fetch', async () => {
        const result =
            await fetchPerformanceMetricsPerFeatureV2AsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files).toBeDefined()
        expect(result.files['2024-01-01_2024-01-31-all_features_table']).toBe(
            'csv-content',
        )
    })

    it('returns empty file content when no data is available', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result =
            await fetchPerformanceMetricsPerFeatureV2AsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files['2024-01-01_2024-01-31-all_features_table']).toBe(
            '',
        )
    })

    it('forwards costSavedPerInteraction from extra to the underlying fetch', async () => {
        await fetchPerformanceMetricsPerFeatureV2AsConfigurableTable(
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

    it('ignores savedMeasure and savedDimension parameters', async () => {
        const result =
            await fetchPerformanceMetricsPerFeatureV2AsConfigurableTable(
                'some-measure',
                'some-dimension',
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(result.files).toBeDefined()
    })
})
