import { renderHook } from '@testing-library/react'

import {
    fetchAllAgentsPerformanceByChannelMetrics,
    useAllAgentsPerformanceByChannelMetrics,
} from '../useAllAgentsPerformanceByChannelMetrics'

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
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsPerChannel',
    () => ({
        useAiAgentAutomatedInteractionsPerChannel: jest.fn(),
        fetchAiAgentAutomatedInteractionsPerChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentCostSavedPerChannel',
    () => ({
        useAiAgentCostSavedPerChannel: jest.fn(),
        fetchAiAgentCostSavedPerChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentHandoverInteractionsPerChannel',
    () => ({
        useAiAgentHandoverInteractionsPerChannel: jest.fn(),
        fetchAiAgentHandoverInteractionsPerChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentCoverageRatePerChannel',
    () => ({
        useAiAgentCoverageRatePerChannel: jest.fn(),
        fetchAiAgentCoverageRatePerChannel: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSuccessRatePerChannel',
    () => ({
        useAiAgentSuccessRatePerChannel: jest.fn(),
        fetchAiAgentSuccessRatePerChannel: jest.fn(),
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
    automatedInteractions: { email: 1200, chat: 800 },
    handoverInteractions: { email: 45, chat: 12 },
    costSaved: { email: 3720, chat: 2480 },
    coverageRate: { email: 0.85, chat: 0.92 },
    successRate: { email: 0.78, chat: 0.91 },
}

const defaultRows = [
    {
        entity: 'email',
        automatedInteractions: 1200,
        handoverInteractions: 45,
        costSaved: 3720,
        coverageRate: 0.85,
        successRate: 0.78,
    },
    {
        entity: 'chat',
        automatedInteractions: 800,
        handoverInteractions: 12,
        costSaved: 2480,
        coverageRate: 0.92,
        successRate: 0.91,
    },
]

describe('useAllAgentsPerformanceByChannelMetrics', () => {
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
                automatedInteractions: false,
                handoverInteractions: false,
                costSaved: false,
                coverageRate: false,
                successRate: false,
            },
        })
        mockFilterEntitiesWithData.mockReturnValue(['email', 'chat'])
        mockAssembleEntityRows.mockReturnValue(defaultRows)
    })

    it('returns assembled rows when all data is loaded', () => {
        const { result } = renderHook(() =>
            useAllAgentsPerformanceByChannelMetrics(),
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
            },
        })

        const { result } = renderHook(() =>
            useAllAgentsPerformanceByChannelMetrics(),
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
            },
        })

        const { result } = renderHook(() =>
            useAllAgentsPerformanceByChannelMetrics(),
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
            },
        })

        const { result } = renderHook(() =>
            useAllAgentsPerformanceByChannelMetrics(),
        )

        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.costSaved).toBe(false)
        expect(result.current.loadingStates.coverageRate).toBe(false)
        expect(result.current.loadingStates.successRate).toBe(false)
    })

    describe('buildAllAgentsPerformanceByChannelRow', () => {
        it('falls back to null when entity data values are missing', () => {
            mockUseEntityMetrics.mockReturnValue({
                data: {
                    automatedInteractions: {},
                    handoverInteractions: {},
                    costSaved: {},
                    coverageRate: {},
                    successRate: {},
                },
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

            renderHook(() => useAllAgentsPerformanceByChannelMetrics())

            const rowBuilder = mockAssembleEntityRows.mock.calls[0][2]
            const row = rowBuilder('email')

            expect(row.automatedInteractions).toBeNull()
            expect(row.handoverInteractions).toBeNull()
            expect(row.costSaved).toBeNull()
            expect(row.coverageRate).toBeNull()
            expect(row.successRate).toBeNull()
        })
    })
})

describe('fetchAllAgentsPerformanceByChannelMetrics', () => {
    const mockMetricsData = {
        automatedInteractions: { email: 1200 },
        handoverInteractions: { email: 45 },
        costSaved: { email: 3720 },
        coverageRate: { email: 0.85 },
        successRate: { email: 0.78 },
    }

    const mockRow = {
        entity: 'email' as const,
        automatedInteractions: 1200,
        handoverInteractions: 45,
        costSaved: 3720,
        coverageRate: 0.85,
        successRate: 0.78,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchEntityMetrics.mockResolvedValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })
        mockFilterEntitiesWithData.mockReturnValue(['email'])
        mockAssembleEntityRows.mockReturnValue([mockRow])
        mockGetCsvFileNameWithDates.mockReturnValue(
            '2024-01-01_2024-01-31-all_agents_performance_by_channel_table',
        )
        mockCreateCsv.mockReturnValue('csv-content')
    })

    it('returns empty file content when data is empty', async () => {
        mockAssembleEntityRows.mockReturnValue([])

        const result = await fetchAllAgentsPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('')
    })

    it('returns CSV content when data is available', async () => {
        const result = await fetchAllAgentsPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('passes only period filters to fetchEntityMetrics', async () => {
        const filtersWithExtra = { ...MOCK_STATS_FILTERS, channel: 'chat' }

        await fetchAllAgentsPerformanceByChannelMetrics(
            filtersWithExtra,
            MOCK_TIMEZONE,
        )

        const [, passedFilters] = mockFetchEntityMetrics.mock.calls[0]
        expect(passedFilters).toEqual({ period: MOCK_STATS_FILTERS.period })
    })

    it('passes costSavedPerInteraction to createAllAgentsPerformanceByChannelFetchConfig', async () => {
        const customCost = 42

        await fetchAllAgentsPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            customCost,
        )

        const [passedConfig] = mockFetchEntityMetrics.mock.calls[0]
        expect(typeof passedConfig.costSaved.fetch).toBe('function')
    })

    it('calls filterEntitiesWithData with ALL_AGENTS_CHANNEL_ENTITIES and isLoading=false', async () => {
        await fetchAllAgentsPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const [entities, , isLoading] = mockFilterEntitiesWithData.mock.calls[0]
        expect(entities).toEqual([
            'email',
            'chat',
            'sms',
            'contact-form',
            'help-center',
            'voice',
        ])
        expect(isLoading).toBe(false)
    })

    it('uses channel display names in CSV rows', async () => {
        await fetchAllAgentsPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const csvCallArgs = mockCreateCsv.mock.calls[0][0]
        const firstDataRow = csvCallArgs[1]
        expect(firstDataRow[0]).toBe('Email')
    })

    it('returns fileName from getCsvFileNameWithDates', async () => {
        const result = await fetchAllAgentsPerformanceByChannelMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe(
            '2024-01-01_2024-01-31-all_agents_performance_by_channel_table',
        )
    })
})
