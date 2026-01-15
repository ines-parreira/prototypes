import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import { products } from 'fixtures/plans'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import type { RootState } from 'state/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

import { useSteps } from '../useSteps'

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan')
const useAiAgentScopesForAutomationPlanMock = assumeMock(
    useAiAgentScopesForAutomationPlan,
)

const initialState = {
    billing: fromJS({
        products,
    }),
} as RootState

describe('useSteps', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseShopifyIntegrations.mockReturnValue([])
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
            integrationId: 123,
            needScopeUpdate: false,
        })

        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
    })

    it('should return all steps when no integration exists', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: null,
            integrationId: null,
            needScopeUpdate: false,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useSteps({ shopName: 'test-shop' }),
            initialState,
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.SHOPIFY_INTEGRATION, condition: true },
            { step: WizardStepEnum.TONE_OF_VOICE, condition: true },
            { step: WizardStepEnum.SALES_PERSONALITY, condition: true },
            { step: WizardStepEnum.ENGAGEMENT, condition: true },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
    })

    it('should exclude SHOPIFY_INTEGRATION step when integration exists', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useSteps({ shopName: 'test-shop' }),
            initialState,
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.TONE_OF_VOICE, condition: true },
            {
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            },
            { step: WizardStepEnum.ENGAGEMENT, condition: true },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
        expect(result.current.totalSteps).toBe(5)
    })

    it('should include SALES_PERSONALITY step when plan supports AI Agent Sales', () => {
        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useSteps({
                    shopName: 'test-shop',
                }),
            initialState,
        )

        expect(result.current.validSteps).toContainEqual({
            step: WizardStepEnum.SALES_PERSONALITY,
            condition: true,
        })
    })

    it('should not include SALES_PERSONALITY step when when plan does not support AI Agent Sales', () => {
        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
        ])
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useSteps({
                    shopName: 'test-shop',
                }),
            initialState,
        )

        expect(result.current.validSteps).not.toContainEqual({
            step: WizardStepEnum.SALES_PERSONALITY,
            condition: true,
        })
    })
})
