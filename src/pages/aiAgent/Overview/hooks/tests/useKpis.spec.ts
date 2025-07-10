import { useKpis } from 'pages/aiAgent/Overview/hooks/useKpis'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('pages/aiAgent/Overview/hooks/kpis/useCoverageRate', () => ({
    useCoverageRate: jest.fn(() => 'mockCoverageRate'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced', () => ({
    useGmvInfluenced: jest.fn(() => 'mockGmvInfluenced'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate', () => ({
    useAiAgentAutomationRate: jest.fn(() => 'mockAiAgentAutomationRate'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useCsat', () => ({
    useCsat: jest.fn(() => 'mockCsat'),
}))

const timezone = 'UTC'
const filters = {
    period: {
        start_datetime: '',
        end_datetime: '',
    },
}

describe('useKpis', () => {
    it('should return metrics from individual hooks', () => {
        const { result } = renderHook(() =>
            useKpis({
                filters,
                timezone,
                aiAgentUserId: 123,
                aiAgentType: 'mixed',
                showActivationModal: () => {},
                showEarlyAccessModal: () => {},
                isOnNewPlan: true,
            }),
        )

        expect(result.current.metrics).toEqual([
            'mockCoverageRate',
            'mockAiAgentAutomationRate',
            'mockGmvInfluenced',
            'mockCsat',
        ])
    })
})
