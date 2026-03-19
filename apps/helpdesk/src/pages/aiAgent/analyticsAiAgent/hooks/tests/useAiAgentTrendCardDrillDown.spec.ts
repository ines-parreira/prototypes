import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { useAiAgentTrendCardDrillDown } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTrendCardDrillDown'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsDrillDown:
            'ai-agent-analytics-dashboards-drilldown',
    },
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

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
    mockUseFlag.mockReturnValue(true)
})

describe('useAiAgentTrendCardDrillDown', () => {
    it('should return drillDown when feature flag is enabled and value is non-zero', () => {
        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams, 653),
        )

        expect(result.current).toBe(mockDrillDown)
    })

    it('should return undefined when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams, 653),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when value is 0', () => {
        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams, 0),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when value is null', () => {
        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams, null),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when value is undefined', () => {
        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams, undefined),
        )

        expect(result.current).toBeUndefined()
    })

    it('should call useDrillDownModalTrigger with the provided params', () => {
        renderHook(() => useAiAgentTrendCardDrillDown(mockParams, 653))

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith(mockParams)
    })
})
