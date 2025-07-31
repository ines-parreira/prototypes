import { renderHook } from '@repo/testing'

import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const useCanUseAiSalesAgentMock = assumeMock(useCanUseAiSalesAgent)

describe('useAiAgentScopesForAutomationPlan', () => {
    it('should return Sales+Support when supports AI Agent Sales', () => {
        useCanUseAiSalesAgentMock.mockReturnValue(true)
        const { result } = renderHook(() => useAiAgentScopesForAutomationPlan())
        expect(result.current).toEqual(['support', 'sales'])
    })

    it('should return Support when does not support AI Agent Sales', () => {
        useCanUseAiSalesAgentMock.mockReturnValue(false)
        const { result } = renderHook(() => useAiAgentScopesForAutomationPlan())
        expect(result.current).toEqual(['support'])
    })
})
