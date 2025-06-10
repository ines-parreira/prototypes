import { fromJS } from 'immutable'

import { products } from 'fixtures/productPrices'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { RootState } from 'state/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

import { useSteps } from '../useSteps'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')
jest.mock('pages/aiAgent/Onboarding/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock
const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock

jest.mock('pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan')
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
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: [{}],
            defaultIntegration: {},
        })

        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
    })

    it('should return all steps when no integrations exist and data is loading', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: null,
            integrationId: null,
            needScopeUpdate: false,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: null,
            defaultIntegration: null,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useSteps({ shopName: 'test-shop' }),
            initialState,
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.SHOPIFY_INTEGRATION, condition: true },
            { step: WizardStepEnum.EMAIL_INTEGRATION, condition: true },
            { step: WizardStepEnum.CHANNELS, condition: true },
            { step: WizardStepEnum.SALES_PERSONALITY, condition: true },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.ENGAGEMENT, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
    })

    it('should exclude steps based on integration and email data', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useSteps({ shopName: 'test-shop' }),
            initialState,
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.CHANNELS, condition: true },
            {
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.ENGAGEMENT, condition: true },
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
