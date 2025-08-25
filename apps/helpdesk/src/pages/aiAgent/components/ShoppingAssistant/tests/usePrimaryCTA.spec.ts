import { renderHook } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'

import { useAiAgentPrimaryCTA } from '../hooks/useAiAgentPrimaryCTA'
import { usePrimaryCTA } from '../hooks/usePrimaryCTA'
import { useShoppingAssistantPrimaryCTA } from '../hooks/useShoppingAssistantPrimaryCTA'
import { PromoCardVariant, TrialType } from '../types/ShoppingAssistant'

jest.mock('../hooks/useAiAgentPrimaryCTA', () => ({
    useAiAgentPrimaryCTA: jest.fn(),
}))

jest.mock('../hooks/useShoppingAssistantPrimaryCTA', () => ({
    useShoppingAssistantPrimaryCTA: jest.fn(),
}))

const mockUseAiAgentPrimaryCTA = useAiAgentPrimaryCTA as jest.Mock
const mockUseShoppingAssistantPrimaryCTA =
    useShoppingAssistantPrimaryCTA as jest.Mock

const createMockTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture(overrides)

const createMockTrialMetrics = (overrides = {}) => ({
    gmvInfluenced: '$0.00',
    gmvInfluencedRate: 0,
    automationRate: 0,
    isLoading: false,
    ...overrides,
})

describe('usePrimaryCTA', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentPrimaryCTA.mockReturnValue({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: 'AI Agent CTA',
                onClick: jest.fn(),
            },
        })

        mockUseShoppingAssistantPrimaryCTA.mockReturnValue({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: 'Shopping Assistant CTA',
                onClick: jest.fn(),
            },
        })
    })

    it('returns AI Agent CTA when trial type is AiAgent', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                trialType: TrialType.AiAgent,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(mockUseAiAgentPrimaryCTA).toHaveBeenCalledWith(props)
        expect(mockUseShoppingAssistantPrimaryCTA).toHaveBeenCalledWith(props)
        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: 'AI Agent CTA',
                onClick: expect.any(Function),
            },
        })
    })

    it('returns Shopping Assistant CTA by default', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                trialType: TrialType.ShoppingAssistant,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(mockUseAiAgentPrimaryCTA).toHaveBeenCalledWith(props)
        expect(mockUseShoppingAssistantPrimaryCTA).toHaveBeenCalledWith(props)
        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: 'Shopping Assistant CTA',
                onClick: expect.any(Function),
            },
        })
    })

    it('returns Shopping Assistant CTA when trial type is undefined', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                trialType: undefined,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(mockUseAiAgentPrimaryCTA).toHaveBeenCalledWith(props)
        expect(mockUseShoppingAssistantPrimaryCTA).toHaveBeenCalledWith(props)
        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: 'Shopping Assistant CTA',
                onClick: expect.any(Function),
            },
        })
    })
})
