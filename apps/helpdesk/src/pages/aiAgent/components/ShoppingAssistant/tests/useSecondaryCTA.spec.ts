import { renderHook } from '@testing-library/react'

import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'

import { useAiAgentSecondaryCTA } from '../hooks/useAiAgentSecondaryCTA'
import { useSecondaryCTA } from '../hooks/useSecondaryCTA'
import { useShoppingAssistantSecondaryCTA } from '../hooks/useShoppingAssistantSecondaryCTA'
import { PromoCardVariant, TrialType } from '../types/ShoppingAssistant'

jest.mock('../hooks/useAiAgentSecondaryCTA', () => ({
    useAiAgentSecondaryCTA: jest.fn(),
}))

jest.mock('../hooks/useShoppingAssistantSecondaryCTA', () => ({
    useShoppingAssistantSecondaryCTA: jest.fn(),
}))

const mockUseAiAgentSecondaryCTA = useAiAgentSecondaryCTA as jest.Mock
const mockUseShoppingAssistantSecondaryCTA =
    useShoppingAssistantSecondaryCTA as jest.Mock

const createMockTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture(overrides)

describe('useSecondaryCTA', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentSecondaryCTA.mockReturnValue({
            label: 'AI Agent Secondary CTA',
            onClick: jest.fn(),
        })

        mockUseShoppingAssistantSecondaryCTA.mockReturnValue({
            label: 'Shopping Assistant Secondary CTA',
            onClick: jest.fn(),
        })
    })

    it('returns AI Agent Secondary CTA when trial type is AiAgent', () => {
        const variant = PromoCardVariant.AdminTrial
        const trialAccess = createMockTrialAccess({
            trialType: TrialType.AiAgent,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(variant, trialAccess, trialFlow),
        )

        expect(mockUseAiAgentSecondaryCTA).toHaveBeenCalledWith(
            variant,
            trialAccess,
            trialFlow,
        )
        expect(mockUseShoppingAssistantSecondaryCTA).toHaveBeenCalledWith(
            variant,
            trialAccess,
            trialFlow,
        )
        expect(result.current).toEqual({
            label: 'AI Agent Secondary CTA',
            onClick: expect.any(Function),
        })
    })

    it('returns Shopping Assistant Secondary CTA by default', () => {
        const variant = PromoCardVariant.AdminTrial
        const trialAccess = createMockTrialAccess({
            trialType: TrialType.ShoppingAssistant,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(variant, trialAccess, trialFlow),
        )

        expect(mockUseAiAgentSecondaryCTA).toHaveBeenCalledWith(
            variant,
            trialAccess,
            trialFlow,
        )
        expect(mockUseShoppingAssistantSecondaryCTA).toHaveBeenCalledWith(
            variant,
            trialAccess,
            trialFlow,
        )
        expect(result.current).toEqual({
            label: 'Shopping Assistant Secondary CTA',
            onClick: expect.any(Function),
        })
    })

    it('returns Shopping Assistant Secondary CTA when trial type is undefined', () => {
        const variant = PromoCardVariant.AdminTrial
        const trialAccess = createMockTrialAccess({
            trialType: undefined,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(variant, trialAccess, trialFlow),
        )

        expect(mockUseAiAgentSecondaryCTA).toHaveBeenCalledWith(
            variant,
            trialAccess,
            trialFlow,
        )
        expect(mockUseShoppingAssistantSecondaryCTA).toHaveBeenCalledWith(
            variant,
            trialAccess,
            trialFlow,
        )
        expect(result.current).toEqual({
            label: 'Shopping Assistant Secondary CTA',
            onClick: expect.any(Function),
        })
    })
})
