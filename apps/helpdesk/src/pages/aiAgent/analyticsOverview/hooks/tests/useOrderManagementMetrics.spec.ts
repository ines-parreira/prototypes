import { renderHook } from '@testing-library/react'

import {
    fetchOrderManagementMetrics,
    useOrderManagementMetrics,
} from '../useOrderManagementMetrics'

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
    'pages/aiAgent/analyticsOverview/hooks/useAutomatedInteractionsPerOrderManagementType',
    () => ({
        useAutomatedInteractionsPerOrderManagementType: jest.fn(),
        fetchAutomatedInteractionsPerOrderManagementType: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerOrderManagementType',
    () => ({
        useCostSavedPerOrderManagementType: jest.fn(),
        fetchCostSavedPerOrderManagementType: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerOrderManagementType',
    () => ({
        useHandoverInteractionsPerOrderManagementType: jest.fn(),
        fetchHandoverInteractionsPerOrderManagementType: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRatePerOrderManagementType',
    () => ({
        useOverallAutomationRatePerOrderManagementType: jest.fn(),
        fetchOverallAutomationRatePerOrderManagementType: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useOverallTimeSavedByAgentPerOrderManagementType',
    () => ({
        useOverallTimeSavedByAgentPerOrderManagementType: jest.fn(),
        fetchOverallTimeSavedByAgentPerOrderManagementType: jest.fn(),
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

const mockFilterEntitiesWithData = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).filterEntitiesWithData as jest.Mock

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
    overallAutomationRate: {
        cancel_order: 0.75,
        track_order: 0.9,
        loop_returns_started: 0.6,
        automated_response_started: 0.8,
    },
    automatedInteractions: {
        cancel_order: 10,
        track_order: 25,
        loop_returns_started: 5,
        automated_response_started: 8,
    },
    handoverInteractions: {
        automated_response_started: 3,
    },
    costSaved: {
        cancel_order: 31,
        track_order: 77.5,
        loop_returns_started: 15.5,
        automated_response_started: 24.8,
    },
    timeSaved: {
        cancel_order: 120,
        track_order: 90,
        loop_returns_started: 60,
        automated_response_started: 45,
    },
}

const defaultRows = [
    {
        entity: 'cancel_order',
        automationRate: 0.75,
        automatedInteractions: 10,
        handoverInteractions: null,
        costSaved: 31,
        timeSaved: 120,
    },
    {
        entity: 'track_order',
        automationRate: 0.9,
        automatedInteractions: 25,
        handoverInteractions: null,
        costSaved: 77.5,
        timeSaved: 90,
    },
    {
        entity: 'loop_returns_started',
        automationRate: 0.6,
        automatedInteractions: 5,
        handoverInteractions: null,
        costSaved: 15.5,
        timeSaved: 60,
    },
    {
        entity: 'automated_response_started',
        automationRate: 0.8,
        automatedInteractions: 8,
        handoverInteractions: 3,
        costSaved: 24.8,
        timeSaved: 45,
    },
]

describe('useOrderManagementMetrics', () => {
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
                overallAutomationRate: false,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })
        mockFilterEntitiesWithData.mockReturnValue([
            'cancel_order',
            'track_order',
            'loop_returns_started',
            'automated_response_started',
        ])
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() => useOrderManagementMetrics())

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
                overallAutomationRate: true,
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                timeSaved: false,
            },
        })

        const { result } = renderHook(() => useOrderManagementMetrics())

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

        const { result } = renderHook(() => useOrderManagementMetrics())

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

        const { result } = renderHook(() => useOrderManagementMetrics())

        expect(result.current.loadingStates.automationRate).toBe(true)
        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.costSaved).toBe(false)
        expect(result.current.loadingStates.timeSaved).toBe(true)
    })

    it('returns undefined data when assembleEntityRows returns empty array while loading', () => {
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

        const { result } = renderHook(() => useOrderManagementMetrics())

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(true)
    })
})

describe('fetchOrderManagementMetrics', () => {
    const mockMetricsData = {
        overallAutomationRate: { cancel_order: 0.75 },
        automatedInteractions: { cancel_order: 10 },
        handoverInteractions: { cancel_order: 3 },
        costSaved: { cancel_order: 31 },
        timeSaved: { cancel_order: 120 },
    }

    const mockRow = {
        entity: 'cancel_order' as const,
        automationRate: 0.75,
        automatedInteractions: 10,
        handoverInteractions: 3,
        costSaved: 31,
        timeSaved: 120,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })
        mockFilterEntitiesWithData.mockReturnValue(['cancel_order'])
        mockAssembleEntityRows.mockReturnValue([mockRow])
        mockGetCsvFileNameWithDates.mockReturnValue(
            '2024-01-01_2024-01-31_order-management-breakdown',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchOrderManagementMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchOrderManagementMetrics(
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

        await fetchOrderManagementMetrics(filtersWithExtra, MOCK_TIMEZONE)

        const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
        expect(passedFilters).toEqual({ period: MOCK_STATS_FILTERS.period })
    })

    it('passes costSavedPerInteraction to createOrderManagementFetchConfig', async () => {
        const customCost = 42

        await fetchOrderManagementMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        expect(typeof passedConfig.costSaved.fetch).toBe('function')
    })

    it('calls filterEntitiesWithData with ORDER_MANAGEMENT_ENTITIES and isLoading=false', async () => {
        await fetchOrderManagementMetrics(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        const [entities, , isLoading] = mockFilterEntitiesWithData.mock.calls[0]
        expect(entities).toEqual([
            'cancel_order',
            'track_order',
            'loop_returns_started',
            'automated_response_started',
        ])
        expect(isLoading).toBe(false)
    })

    it('uses entity display names in CSV rows', async () => {
        await fetchOrderManagementMetrics(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('Cancel order')
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchOrderManagementMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe(
            '2024-01-01_2024-01-31_order-management-breakdown',
        )
    })
})
