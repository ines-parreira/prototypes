import { renderHook } from '@testing-library/react'

import { fetchFlowsMetrics, useFlowsMetrics } from '../useFlowsMetrics'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters', () => ({
    useAutomateFilters: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useEntityMetrics: jest.fn(),
    assembleEntityRows: jest.fn(),
    fetchEntityMetrics: jest.fn(),
    filterEntitiesWithData: jest.fn(),
    toEntityMap: jest.fn(),
    mapMetricValues: jest.fn(),
}))
jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
    fetchWorkflowConfigurations: jest.fn(),
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
    'pages/aiAgent/analyticsOverview/hooks/useAutomationRatePerFlows',
    () => ({
        useAutomationRatePerFlows: jest.fn(),
        fetchAutomationRatePerFlows: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useAutomatedInteractionsPerFlows',
    () => ({
        useAutomatedInteractionsPerFlows: jest.fn(),
        fetchAutomatedInteractionsPerFlows: jest.fn(),
    }),
)
jest.mock('pages/aiAgent/analyticsOverview/hooks/useCostSavedPerFlows', () => ({
    useCostSavedPerFlows: jest.fn(),
    fetchCostSavedPerFlows: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFlows',
    () => ({
        useHandoverInteractionsPerFlows: jest.fn(),
        fetchHandoverInteractionsPerFlows: jest.fn(),
    }),
)
jest.mock('pages/aiAgent/analyticsOverview/hooks/useTimeSavedPerFlows', () => ({
    useTimeSavedPerFlows: jest.fn(),
    fetchTimeSavedPerFlows: jest.fn(),
}))

const mockUseAutomateFilters = jest.requireMock(
    'domains/reporting/hooks/automate/useAutomateFilters',
).useAutomateFilters as jest.Mock

const mockUseEntityMetrics = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useEntityMetrics as jest.Mock

const mockAssembleEntityRows = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).assembleEntityRows as jest.Mock

const mockUseGetWorkflowConfigurations = jest.requireMock(
    'models/workflows/queries',
).useGetWorkflowConfigurations as jest.Mock

const mockFetchWorkflowConfigurations = jest.requireMock(
    'models/workflows/queries',
).fetchWorkflowConfigurations as jest.Mock

const mockFetchEntityMetrics = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchEntityMetrics as jest.Mock

const mockFilterEntitiesWithData = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).filterEntitiesWithData as jest.Mock

const mockGetCsvFileNameWithDates = jest.requireMock(
    'domains/reporting/hooks/common/utils',
).getCsvFileNameWithDates as jest.Mock

const mockFetchCostSavedPerFlows = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerFlows',
).fetchCostSavedPerFlows as jest.Mock

const mockCreateCsv = jest.requireMock('utils/file').createCsv as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'

const defaultWorkflows = [
    {
        id: 'uuid-10',
        internal_id: 'flow-seed-10',
        name: 'Product availability',
    },
    { id: 'uuid-25', internal_id: 'flow-seed-25', name: 'Product sizing' },
    {
        id: 'uuid-6',
        internal_id: 'flow-seed-6',
        name: 'Return & exchange policy',
    },
    { id: 'uuid-9', internal_id: 'flow-seed-9', name: 'Repairs' },
]

const defaultEntityData = {
    overallAutomationRate: {
        'uuid-10': 0.75,
        'uuid-25': 0.9,
        'uuid-6': 0.6,
        'uuid-9': 0.8,
    },
    automatedInteractions: {
        'uuid-10': 1200,
        'uuid-25': 800,
        'uuid-6': 500,
        'uuid-9': 300,
    },
    handoverInteractions: {
        'uuid-10': 80,
        'uuid-25': 45,
        'uuid-6': 30,
        'uuid-9': 20,
    },
    costSaved: {
        'uuid-10': 3720,
        'uuid-25': 2480,
        'uuid-6': 1550,
        'uuid-9': 930,
    },
    timeSaved: {
        'uuid-10': 3600,
        'uuid-25': 2400,
        'uuid-6': 1800,
        'uuid-9': 900,
    },
}

const defaultRows = [
    {
        entity: 'uuid-10',
        automationRate: 0.75,
        automatedInteractions: 1200,
        handoverInteractions: 80,
        costSaved: 3720,
        timeSaved: 3600,
    },
    {
        entity: 'uuid-25',
        automationRate: 0.9,
        automatedInteractions: 800,
        handoverInteractions: 45,
        costSaved: 2480,
        timeSaved: 2400,
    },
    {
        entity: 'uuid-6',
        automationRate: 0.6,
        automatedInteractions: 500,
        handoverInteractions: 30,
        costSaved: 1550,
        timeSaved: 1800,
    },
    {
        entity: 'uuid-9',
        automationRate: 0.8,
        automatedInteractions: 300,
        handoverInteractions: 20,
        costSaved: 930,
        timeSaved: 900,
    },
]

describe('useFlowsMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAutomateFilters.mockReturnValue({
            statsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
        })
        mockUseGetWorkflowConfigurations.mockReturnValue({
            data: defaultWorkflows,
            isLoading: false,
        })
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                overallAutomationRate: false,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })
        mockFilterEntitiesWithData.mockReturnValue([
            'uuid-10',
            'uuid-25',
            'uuid-6',
            'uuid-9',
        ])
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.data).toEqual(defaultRows)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('returns displayNames derived from workflow id and name', () => {
        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.displayNames).toEqual({
            'uuid-10': 'Product availability',
            'uuid-25': 'Product sizing',
            'uuid-6': 'Return & exchange policy',
            'uuid-9': 'Repairs',
        })
    })

    it('returns isLoading true when workflow configurations are loading', () => {
        mockUseGetWorkflowConfigurations.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isLoading true when entity metrics are loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: true,
            isError: false,
            loadingStates: {
                overallAutomationRate: true,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isError true when entity metrics have an error', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: true,
            loadingStates: {
                overallAutomationRate: false,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.isError).toBe(true)
    })

    it('maps entity loading states to output loading states', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: false,
            isError: false,
            loadingStates: {
                overallAutomationRate: true,
                automatedInteractions: false,
                handoverInteractions: true,
                costSaved: false,
                timeSaved: true,
            },
        })

        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.loadingStates.automationRate).toBe(true)
        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.costSaved).toBe(false)
        expect(result.current.loadingStates.timeSaved).toBe(true)
    })

    it('returns empty array when assembleEntityRows returns empty array while loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: true,
            isError: false,
            loadingStates: {
                overallAutomationRate: true,
                automatedInteractions: true,
                handoverInteractions: true,
                costSaved: true,
                timeSaved: true,
            },
        })
        mockAssembleEntityRows.mockReturnValue([])

        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty displayNames when workflows data is undefined', () => {
        mockUseGetWorkflowConfigurations.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() => useFlowsMetrics())

        expect(result.current.displayNames).toEqual({})
    })

    it('only passes entities with at least one non-null metric value to assembleEntityRows', () => {
        mockFilterEntitiesWithData.mockReturnValue(['uuid-10'])

        renderHook(() => useFlowsMetrics())

        const entitiesPassedToAssemble = mockAssembleEntityRows.mock.calls[0][1]
        expect(entitiesPassedToAssemble).toEqual(['uuid-10'])
    })

    it('passes all entities to assembleEntityRows while loading', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: defaultEntityData,
            isLoading: true,
            isError: false,
            loadingStates: {
                overallAutomationRate: true,
                automatedInteractions: true,
                handoverInteractions: true,
                costSaved: true,
                timeSaved: true,
            },
        })

        renderHook(() => useFlowsMetrics())

        const entitiesPassedToAssemble = mockAssembleEntityRows.mock.calls[0][1]
        expect(entitiesPassedToAssemble).toEqual([
            'uuid-10',
            'uuid-25',
            'uuid-6',
            'uuid-9',
        ])
    })

    it('includes entities with a metric value of 0', () => {
        mockFilterEntitiesWithData.mockReturnValue(['uuid-10'])

        renderHook(() => useFlowsMetrics())

        const entitiesPassedToAssemble = mockAssembleEntityRows.mock.calls[0][1]
        expect(entitiesPassedToAssemble).toEqual(['uuid-10'])
    })

    describe('buildFlowsRow', () => {
        it('maps entity data fields to a row', () => {
            renderHook(() => useFlowsMetrics())

            const buildRow = mockAssembleEntityRows.mock.calls[0][2]
            expect(buildRow('uuid-10')).toEqual({
                entity: 'uuid-10',
                automationRate: 0.75,
                automatedInteractions: 1200,
                handoverInteractions: 80,
                costSaved: 3720,
                timeSaved: 3600,
            })
        })

        it('returns null for missing metric values', () => {
            renderHook(() => useFlowsMetrics())

            const buildRow = mockAssembleEntityRows.mock.calls[0][2]
            expect(buildRow('nonexistent')).toEqual({
                entity: 'nonexistent',
                automationRate: null,
                automatedInteractions: null,
                handoverInteractions: null,
                costSaved: null,
                timeSaved: null,
            })
        })
    })
})

describe('fetchFlowsMetrics', () => {
    const mockMetricsData = {
        overallAutomationRate: { 'uuid-10': 0.75 },
        automatedInteractions: { 'uuid-10': 1200 },
        handoverInteractions: { 'uuid-10': 80 },
        costSaved: { 'uuid-10': 3720 },
        timeSaved: { 'uuid-10': 3600 },
    }

    const mockRow = {
        entity: 'uuid-10',
        automationRate: 0.75,
        automatedInteractions: 1200,
        handoverInteractions: 80,
        costSaved: 3720,
        timeSaved: 3600,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchWorkflowConfigurations.mockResolvedValue(defaultWorkflows)
        mockFetchEntityMetrics.mockResolvedValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })
        mockFilterEntitiesWithData.mockReturnValue(['uuid-10'])
        mockAssembleEntityRows.mockReturnValue([mockRow])
        mockGetCsvFileNameWithDates.mockReturnValue(
            '2024-01-01_2024-01-31_flows_breakdown_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchFlowsMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchFlowsMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('passes only period filters to fetchEntityMetrics', async () => {
        const filtersWithExtra = {
            ...MOCK_STATS_FILTERS,
            channel: 'chat',
        }

        await fetchFlowsMetrics(filtersWithExtra, MOCK_TIMEZONE)

        const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
        expect(passedFilters).toEqual({ period: MOCK_STATS_FILTERS.period })
    })

    it('uses display names to resolve entity names in CSV rows', async () => {
        await fetchFlowsMetrics(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('Product availability')
    })

    it('falls back to entity id when display name is missing', async () => {
        mockFetchWorkflowConfigurations.mockResolvedValue([])
        mockAssembleEntityRows.mockReturnValue([mockRow])

        await fetchFlowsMetrics(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('uuid-10')
    })

    it('passes costSavedPerInteraction to createFlowsFetchConfig', async () => {
        const customCost = 42

        await fetchFlowsMetrics(MOCK_STATS_FILTERS, MOCK_TIMEZONE, customCost)

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        const periodFilters = { period: MOCK_STATS_FILTERS.period }
        await passedConfig.costSaved.fetch(periodFilters, MOCK_TIMEZONE)
        expect(mockFetchCostSavedPerFlows).toHaveBeenCalledWith(
            periodFilters,
            MOCK_TIMEZONE,
            customCost,
        )
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchFlowsMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe(
            '2024-01-01_2024-01-31_flows_breakdown_table',
        )
    })
})
