import { renderHook } from '@testing-library/react'

import { useAutomationRateByFeature } from '../useAutomationRateByFeature'

jest.mock('domains/reporting/hooks/automate/automateStatsFormulae')
jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration', () => ({
    useGetNewStatsFeatureFlagMigration: jest.fn().mockReturnValue('off'),
}))
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/overallAutomationRate', () => {
    const actual = jest.requireActual(
        'domains/reporting/models/scopes/overallAutomationRate',
    )
    return {
        ...actual,
        automationRatePerFeatureQueryFactoryV2: jest.fn(),
    }
})

const mockUseStatsFilters = jest.requireMock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
).useStatsFilters as jest.Mock
const mockUseAIAgentUserId = jest.requireMock(
    'domains/reporting/hooks/automate/useAIAgentUserId',
).useAIAgentUserId as jest.Mock
const mockUseTrendFromMultipleMetricsTrend = jest.requireMock(
    'domains/reporting/hooks/automate/automationTrends',
).useTrendFromMultipleMetricsTrend as jest.Mock
const mockUseAllAutomatedInteractions = jest.requireMock(
    'domains/reporting/hooks/automate/automationTrends',
).useAllAutomatedInteractions as jest.Mock
const mockUseAllAutomatedInteractionsByAutoResponders = jest.requireMock(
    'domains/reporting/hooks/automate/automationTrends',
).useAllAutomatedInteractionsByAutoResponders as jest.Mock
const mockUseBillableTicketsExcludingAIAgent = jest.requireMock(
    'domains/reporting/hooks/automate/automationTrends',
).useBillableTicketsExcludingAIAgent as jest.Mock
const mockAutomationRateUnfilteredDenominator = jest.requireMock(
    'domains/reporting/hooks/automate/automateStatsFormulae',
).automationRateUnfilteredDenominator as jest.Mock
const mockUseGetNewStatsFeatureFlagMigration = jest.requireMock(
    'domains/reporting/utils/useGetNewStatsFeatureFlagMigration',
).useGetNewStatsFeatureFlagMigration as jest.Mock
const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

describe('useAutomationRateByFeature', () => {
    beforeEach(() => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {},
            userTimezone: 'UTC',
        })

        mockUseAIAgentUserId.mockReturnValue('ai-agent-123')

        mockAutomationRateUnfilteredDenominator.mockImplementation(() => 0.5)

        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            data: { value: 100 },
            isFetching: false,
            isError: false,
        })

        mockUseAllAutomatedInteractions.mockReturnValue({
            data: { value: 500 },
            isFetching: false,
            isError: false,
        })

        mockUseAllAutomatedInteractionsByAutoResponders.mockReturnValue({
            data: { value: 200 },
            isFetching: false,
            isError: false,
        })

        mockUseBillableTicketsExcludingAIAgent.mockReturnValue({
            data: { value: 1000 },
            isFetching: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return data when all dependencies are loaded', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toBeDefined()
        expect(result.current.data).toHaveLength(4)
    })

    it('should return chart data with correct feature names', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toBeDefined()
        const names = result.current.data?.map((item) => item.name)
        expect(names).toEqual([
            'AI Agent',
            'Flows',
            'Article Recommendation',
            'Order Management',
        ])
    })

    it('should calculate automation rates correctly', () => {
        mockAutomationRateUnfilteredDenominator.mockImplementation(
            ({ filteredAutomatedInteractions }) => {
                return filteredAutomatedInteractions / 1000
            },
        )

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toBeDefined()
        result.current.data?.forEach((item) => {
            expect(item.value).toBe(10.0)
        })
    })

    it('should return isLoading true when any dependency is fetching', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValueOnce({
            data: { value: 100 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isError true when any dependency has error', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValueOnce({
            data: { value: 100 },
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isError).toEqual(true)
    })

    it('should return empty data when AI Agent interactions data is missing', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValueOnce({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([])
    })

    it('should return undefined data when all automated interactions data is missing', () => {
        mockUseAllAutomatedInteractions.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([])
    })

    it('should return undefined data when billable tickets data is missing', () => {
        mockUseBillableTicketsExcludingAIAgent.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([])
    })

    it('should handle zero interactions gracefully', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            data: { value: 0 },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toBeDefined()
        expect(result.current.data).toHaveLength(4)
    })

    it('should handle null values in data', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            data: { value: null },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toBeDefined()
        result.current.data?.forEach((item) => {
            expect(typeof item.value).toBe('number')
        })
    })

    it('should format automation rate to 2 decimal places', () => {
        mockAutomationRateUnfilteredDenominator.mockReturnValue(0.123456)

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toBeDefined()
        result.current.data?.forEach((item) => {
            expect(item.value).toBe(12.35)
        })
    })

    it('should call useTrendFromMultipleMetricsTrend for each feature', () => {
        renderHook(() => useAutomationRateByFeature())

        expect(mockUseTrendFromMultipleMetricsTrend).toHaveBeenCalledTimes(4)
    })

    it('should call automationRateUnfilteredDenominator with correct parameters', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            data: { value: 150 },
            isFetching: false,
            isError: false,
        })

        mockUseAllAutomatedInteractions.mockReturnValue({
            data: { value: 600 },
            isFetching: false,
            isError: false,
        })

        mockUseAllAutomatedInteractionsByAutoResponders.mockReturnValue({
            data: { value: 250 },
            isFetching: false,
            isError: false,
        })

        mockUseBillableTicketsExcludingAIAgent.mockReturnValue({
            data: { value: 1200 },
            isFetching: false,
            isError: false,
        })

        renderHook(() => useAutomationRateByFeature())

        expect(mockAutomationRateUnfilteredDenominator).toHaveBeenCalledWith({
            filteredAutomatedInteractions: 150,
            allAutomatedInteractions: 600,
            allAutomatedInteractionsByAutoResponders: 250,
            billableTicketsCount: 1200,
        })
    })

    it('should return isLoading false and isError false when all data is available', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should handle different interaction values for each feature', () => {
        let callCount = 0
        mockUseTrendFromMultipleMetricsTrend.mockImplementation(() => {
            const values = [100, 200, 300, 400]
            return {
                data: { value: values[callCount++] },
                isFetching: false,
                isError: false,
            }
        })

        mockAutomationRateUnfilteredDenominator.mockImplementation(
            ({ filteredAutomatedInteractions }) => {
                return filteredAutomatedInteractions / 1000
            },
        )

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toBeDefined()
        expect(result.current.data?.[0].value).toBe(10.0)
        expect(result.current.data?.[1].value).toBe(20.0)
        expect(result.current.data?.[2].value).toBe(30.0)
        expect(result.current.data?.[3].value).toBe(40.0)
    })

    it('should return isLoading true when allAutomatedInteractions is fetching', () => {
        mockUseAllAutomatedInteractions.mockReturnValue({
            data: { value: 500 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading true when billableTickets is fetching', () => {
        mockUseBillableTicketsExcludingAIAgent.mockReturnValue({
            data: { value: 1000 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isError true when allAutomatedInteractions has error', () => {
        mockUseAllAutomatedInteractions.mockReturnValue({
            data: { value: 500 },
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isError).toBe(true)
    })

    it('should return isError true when billableTickets has error', () => {
        mockUseBillableTicketsExcludingAIAgent.mockReturnValue({
            data: { value: 1000 },
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isError).toBe(true)
    })
})

describe('useAutomationRateByFeature when stage is live or complete', () => {
    const defaultAllValues = [
        { dimension: 'ai-agent', value: 30, decile: null },
        { dimension: 'flow', value: 20, decile: null },
        { dimension: 'order-management', value: 10, decile: null },
        { dimension: 'article-recommendation', value: 15, decile: null },
    ]

    beforeEach(() => {
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('live')
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {},
            userTimezone: 'UTC',
        })
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: defaultAllValues,
            },
            isFetching: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return chart data with correct feature names', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data?.map((item) => item.name)).toEqual([
            'AI Agent',
            'Flows',
            'Order Management',
            'Article Recommendation',
        ])
    })

    it('should preserve values from the response', () => {
        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([
            { name: 'AI Agent', value: 30 },
            { name: 'Flows', value: 20 },
            { name: 'Order Management', value: 10 },
            { name: 'Article Recommendation', value: 15 },
        ])
    })

    it('should filter out unknown dimensions', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    ...defaultAllValues,
                    { dimension: 'unknown-feature', value: 99, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toHaveLength(4)
        expect(result.current.data?.map((item) => item.name)).not.toContain(
            'unknown-feature',
        )
    })

    it('should return isLoading true when response is fetching', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isError true when response has error', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.isError).toBe(true)
    })

    it('should return undefined data when response data is null', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([])
    })

    it('should handle null values in dimension data', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    { dimension: 'ai-agent', value: null, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toEqual([{ name: 'AI Agent', value: null }])
    })

    it('should use the V2 path when stage is complete', () => {
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('complete')

        const { result } = renderHook(() => useAutomationRateByFeature())

        expect(result.current.data).toHaveLength(4)
    })
})
