import { renderHook } from '@repo/testing'

import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'

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
})

describe('useAiAgentTrendCardDrillDown', () => {
    it('should return drillDown when metricName is provided', () => {
        const { result } = renderHook(() =>
            useAiAgentTrendCardDrillDown(mockParams),
        )

        expect(result.current).toBe(mockDrillDown)
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
