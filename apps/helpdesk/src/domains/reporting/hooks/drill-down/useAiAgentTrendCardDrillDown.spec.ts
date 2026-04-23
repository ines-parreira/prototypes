import { useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsDrillDown:
            'ai-agent-analytics-dashboards-drilldown',
    },
    useFlagWithLoading: jest.fn(),
}))
const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)

jest.mock('domains/reporting/hooks/drill-down/useDrillDownModalTrigger')
const mockUseDrillDownModalTrigger = jest.mocked(useDrillDownModalTrigger)

const mockDrillDown = {
    openDrillDownModal: jest.fn(),
    tooltipText: 'Click to view tickets',
}

const mockParams = {
    metricName: AiAgentDrillDownMetricName.AutomatedInteractionsCard,
    title: 'Automated interactions',
}

beforeEach(() => {
    jest.resetAllMocks()
    mockUseDrillDownModalTrigger.mockReturnValue(mockDrillDown)
    mockUseFlagWithLoading.mockReturnValue({ value: true, isLoading: false })
})

describe('useAiAgentTrendCardDrillDown', () => {
    it('should return drillDown when feature flag is enabled and value is non-zero', () => {
        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams),
        )

        expect(result.current).toBe(mockDrillDown)
    })

    it('should return undefined when feature flag is disabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when feature flag is loading', () => {
        mockUseFlagWithLoading.mockReturnValue({ value: true, isLoading: true })

        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when metricName is absent', () => {
        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown({ title: 'Some title' }),
        )

        expect(result.current).toBeUndefined()
    })

    it('should call useDrillDownModalTrigger with the provided params', () => {
        renderHook(() => useAiAgentTrendCardDrillDown(mockParams))

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            ...mockParams,
            metricName: mockParams.metricName,
        })
    })
})
