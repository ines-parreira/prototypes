import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchTrendFromMultipleMetricsTrend,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAiAgentAllAgentsCostSavedTrend,
    useAiAgentAllAgentsCostSavedTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsCostSavedTrend'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseTrendFromMultipleMetricsTrend = assumeMock(
    useTrendFromMultipleMetricsTrend,
)
const mockFetchTrendFromMultipleMetricsTrend = assumeMock(
    fetchTrendFromMultipleMetricsTrend,
)
const mockUseAIAgentUserId = assumeMock(useAIAgentUserId)
const mockApplyAiAgentFilter = assumeMock(applyAiAgentFilter)
const mockUseMoneySavedPerInteractionWithAutomate = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)

describe('useAiAgentAllAgentsCostSavedTrend', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    } as StatsFilters

    const mockFilteredFilters: StatsFilters = {
        ...mockFilters,
        agents: { values: [42], operator: 'eq' },
    } as unknown as StatsFilters

    const mockAutomatedInteractionTrend = {
        isFetching: false,
        isError: false,
        data: { value: 100, prevValue: 80 },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAIAgentUserId.mockReturnValue(42)
        mockApplyAiAgentFilter.mockReturnValue(mockFilteredFilters)
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue(
            mockAutomatedInteractionTrend,
        )
        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(
            AGENT_COST_PER_TICKET,
        )
    })

    it('should apply AI agent filter and call useTrendFromMultipleMetricsTrend with correct args', () => {
        const { result } = renderHook(() =>
            useAiAgentAllAgentsCostSavedTrend(mockFilters, 'UTC'),
        )

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(mockFilters, 42)
        expect(mockUseTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilteredFilters,
            'UTC',
            expect.any(Function),
            AutomationDatasetMeasure.AutomatedInteractions,
            expect.any(Function),
            'automatedInteractions',
        )
        expect(result.current.data).toEqual({
            value: 100 * AGENT_COST_PER_TICKET,
            prevValue: 80 * AGENT_COST_PER_TICKET,
        })
    })

    it('should use a query factory that sets the correct metricName', () => {
        renderHook(() => useAiAgentAllAgentsCostSavedTrend(mockFilters, 'UTC'))

        const factoryFn = mockUseTrendFromMultipleMetricsTrend.mock.calls[0][2]
        const result = factoryFn(mockFilteredFilters, 'UTC')

        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_ALL_AGENTS_COST_SAVED,
        )
    })

    it('should use a V2 query factory that sets the correct metricName', () => {
        renderHook(() => useAiAgentAllAgentsCostSavedTrend(mockFilters, 'UTC'))

        const v2FactoryFn =
            mockUseTrendFromMultipleMetricsTrend.mock.calls[0][4]!
        const result = v2FactoryFn({
            filters: mockFilteredFilters,
            timezone: 'UTC',
        })

        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_ALL_AGENTS_AUTOMATED_INTERACTIONS,
        )
    })

    it('should handle undefined aiAgentUserId', () => {
        mockUseAIAgentUserId.mockReturnValue(undefined)

        renderHook(() => useAiAgentAllAgentsCostSavedTrend(mockFilters, 'UTC'))

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            undefined,
        )
    })

    it('should return loading state from useTrendFromMultipleMetricsTrend', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined as any,
        })

        const { result } = renderHook(() =>
            useAiAgentAllAgentsCostSavedTrend(mockFilters, 'UTC'),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return error state from useTrendFromMultipleMetricsTrend', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            isFetching: false,
            isError: true,
            data: undefined as any,
        })

        const { result } = renderHook(() =>
            useAiAgentAllAgentsCostSavedTrend(mockFilters, 'UTC'),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAiAgentAllAgentsCostSavedTrend', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    } as StatsFilters

    const mockFilteredFilters: StatsFilters = {
        ...mockFilters,
        agents: { values: [42], operator: 'eq' },
    } as unknown as StatsFilters

    const mockAutomatedInteractionTrend = {
        data: { value: 100, prevValue: 80 },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockApplyAiAgentFilter.mockReturnValue(mockFilteredFilters)
        mockFetchTrendFromMultipleMetricsTrend.mockResolvedValue(
            mockAutomatedInteractionTrend,
        )
    })

    it('should apply AI agent filter and call fetchTrendFromMultipleMetricsTrend with correct args', async () => {
        const result = await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            'UTC',
            42,
            AGENT_COST_PER_TICKET,
        )

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(mockFilters, 42)
        expect(mockFetchTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilteredFilters,
            'UTC',
            expect.any(Function),
            AutomationDatasetMeasure.AutomatedInteractions,
            expect.any(Function),
            'automatedInteractions',
        )
        expect(result.data).toEqual({
            value: 100 * AGENT_COST_PER_TICKET,
            prevValue: 80 * AGENT_COST_PER_TICKET,
        })
    })

    it('should handle undefined aiAgentUserId', async () => {
        await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            'UTC',
            undefined,
            AGENT_COST_PER_TICKET,
        )

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            undefined,
        )
    })
})
