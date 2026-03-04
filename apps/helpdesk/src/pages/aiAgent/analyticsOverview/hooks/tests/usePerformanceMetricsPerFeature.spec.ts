import { renderHook } from '@testing-library/react'

import { usePerformanceMetricsPerFeature } from '../usePerformanceMetricsPerFeature'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('domains/reporting/hooks/metricTrends')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('../useAutomationRateByFeature')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseStatsFilters = jest.requireMock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
).useStatsFilters as jest.Mock

const mockUseTrendFromMultipleMetricsTrend = jest.requireMock(
    'domains/reporting/hooks/automate/automationTrends',
).useTrendFromMultipleMetricsTrend as jest.Mock

const mockUseTicketHandleTimeTrend = jest.requireMock(
    'domains/reporting/hooks/metricTrends',
).useTicketHandleTimeTrend as jest.Mock

const mockUseAutomationRateByFeature = jest.requireMock(
    '../useAutomationRateByFeature',
).useAutomationRateByFeature as jest.Mock

const mockUseMoneySavedPerInteractionWithAutomate = jest.requireMock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
).useMoneySavedPerInteractionWithAutomate as jest.Mock

describe('usePerformanceMetricsPerFeature', () => {
    beforeEach(() => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: { from: '2024-01-01', to: '2024-01-31' },
            },
            userTimezone: 'UTC',
        })

        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(3.1)

        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            data: { value: 100 },
            isFetching: false,
            isError: false,
        })

        mockUseTicketHandleTimeTrend.mockReturnValue({
            data: { value: 1.5 },
            isFetching: false,
            isError: false,
        })

        mockUseAutomationRateByFeature.mockReturnValue({
            data: [
                { name: 'AI Agent', value: 18 },
                { name: 'Flows', value: 8 },
                { name: 'Article Recommendation', value: 4 },
                { name: 'Order Management', value: 6 },
            ],
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return data when all dependencies are loaded', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toBeDefined()
        expect(result.current.data).toHaveLength(4)
    })

    it('should return correct feature names', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.data).toBeDefined()
        const features = result.current.data?.map((item) => item.feature)
        expect(features).toEqual([
            'AI Agent',
            'Article Recommendation',
            'Flows',
            'Order Management',
        ])
    })

    it('should calculate AI Agent metrics correctly', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const aiAgentMetrics = result.current.data?.find(
            (item) => item.feature === 'AI Agent',
        )
        expect(aiAgentMetrics).toBeDefined()
        expect(aiAgentMetrics?.automationRate).toBe(18)
        expect(aiAgentMetrics?.automatedInteractions).toBe(100)
        expect(aiAgentMetrics?.handoverCount).toBe(100)
        expect(aiAgentMetrics?.costSaved).toBe(100 * 3.1)
        expect(aiAgentMetrics?.timeSaved).toBe(100 * 1.5)
    })

    it('should calculate Flows metrics correctly', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const flowsMetrics = result.current.data?.find(
            (item) => item.feature === 'Flows',
        )
        expect(flowsMetrics).toBeDefined()
        expect(flowsMetrics?.automationRate).toBe(8)
        expect(flowsMetrics?.automatedInteractions).toBe(100)
        expect(flowsMetrics?.handoverCount).toBe(100)
        expect(flowsMetrics?.costSaved).toBe(100 * 3.1)
        expect(flowsMetrics?.timeSaved).toBe(100 * 1.5)
    })

    it('should calculate Article Recommendation metrics correctly', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const articleMetrics = result.current.data?.find(
            (item) => item.feature === 'Article Recommendation',
        )
        expect(articleMetrics).toBeDefined()
        expect(articleMetrics?.automationRate).toBe(4)
        expect(articleMetrics?.automatedInteractions).toBe(100)
        expect(articleMetrics?.handoverCount).toBeNull()
        expect(articleMetrics?.costSaved).toBe(100 * 3.1)
        expect(articleMetrics?.timeSaved).toBe(100 * 1.5)
    })

    it('should calculate Order Management metrics correctly', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const orderMetrics = result.current.data?.find(
            (item) => item.feature === 'Order Management',
        )
        expect(orderMetrics).toBeDefined()
        expect(orderMetrics?.automationRate).toBe(6)
        expect(orderMetrics?.automatedInteractions).toBe(100)
        expect(orderMetrics?.handoverCount).toBeNull()
        expect(orderMetrics?.costSaved).toBe(100 * 3.1)
        expect(orderMetrics?.timeSaved).toBe(100 * 1.5)
    })

    it('should return isLoading true when any dependency is fetching', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValueOnce({
            data: { value: 100 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading true when ticket handle time is fetching', () => {
        mockUseTicketHandleTimeTrend.mockReturnValue({
            data: { value: 1.5 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading true when automation rate is loading', () => {
        mockUseAutomationRateByFeature.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isError true when any dependency has error', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValueOnce({
            data: { value: 100 },
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.isError).toBe(true)
    })

    it('should return isError true when ticket handle time has error', () => {
        mockUseTicketHandleTimeTrend.mockReturnValue({
            data: { value: 1.5 },
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.isError).toBe(true)
    })

    it('should return isError true when automation rate has error', () => {
        mockUseAutomationRateByFeature.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.isError).toBe(true)
    })

    it('should handle null interactions gracefully', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const aiAgentMetrics = result.current.data?.find(
            (item) => item.feature === 'AI Agent',
        )
        expect(aiAgentMetrics?.automatedInteractions).toBeNull()
        expect(aiAgentMetrics?.costSaved).toBeNull()
        expect(aiAgentMetrics?.timeSaved).toBeNull()
    })

    it('should handle null handle time gracefully', () => {
        mockUseTicketHandleTimeTrend.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const aiAgentMetrics = result.current.data?.find(
            (item) => item.feature === 'AI Agent',
        )
        expect(aiAgentMetrics?.timeSaved).toBeNull()
    })

    it('should handle missing automation rate data gracefully', () => {
        mockUseAutomationRateByFeature.mockReturnValue({
            data: [{ name: 'AI Agent', value: 18 }],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const flowsMetrics = result.current.data?.find(
            (item) => item.feature === 'Flows',
        )
        expect(flowsMetrics?.automationRate).toBeNull()
    })

    it('should calculate cost saved correctly with different interaction values', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValueOnce({
            data: { value: 500 },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const aiAgentMetrics = result.current.data?.find(
            (item) => item.feature === 'AI Agent',
        )
        expect(aiAgentMetrics?.costSaved).toBe(500 * 3.1)
    })

    it('should calculate time saved correctly with different values', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValueOnce({
            data: { value: 200 },
            isFetching: false,
            isError: false,
        })

        mockUseTicketHandleTimeTrend.mockReturnValue({
            data: { value: 2.5 },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        const aiAgentMetrics = result.current.data?.find(
            (item) => item.feature === 'AI Agent',
        )
        expect(aiAgentMetrics?.timeSaved).toBe(200 * 2.5)
    })

    it('should provide correct loading states', () => {
        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.loadingStates).toBeDefined()
        expect(result.current.loadingStates.automationRate).toBe(false)
        expect(result.current.loadingStates.automatedInteractions).toBe(false)
        expect(result.current.loadingStates.handovers).toBe(false)
        expect(result.current.loadingStates.timeSaved).toBe(false)
    })

    it('should set automationRate loading state correctly', () => {
        mockUseAutomationRateByFeature.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.loadingStates.automationRate).toBe(true)
    })

    it('should set automatedInteractions loading state correctly', () => {
        mockUseTrendFromMultipleMetricsTrend.mockReturnValue({
            data: { value: 100 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.loadingStates.automatedInteractions).toBe(true)
    })

    it('should set timeSaved loading state correctly', () => {
        mockUseTicketHandleTimeTrend.mockReturnValue({
            data: { value: 1.5 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() => usePerformanceMetricsPerFeature())

        expect(result.current.loadingStates.timeSaved).toBe(true)
    })

    it('should call hooks with stable filters without aggregation', () => {
        renderHook(() => usePerformanceMetricsPerFeature())

        expect(mockUseTrendFromMultipleMetricsTrend).toHaveBeenCalled()
        const firstCallArgs = mockUseTrendFromMultipleMetricsTrend.mock.calls[0]
        expect(firstCallArgs[0]).not.toHaveProperty('aggregation_window')
    })
})
