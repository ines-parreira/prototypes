import { fromJS } from 'immutable'

import {
    AUTOMATION_PRODUCT_ID,
    firstTierMonthlyAutomationPlan,
    products,
} from 'fixtures/productPrices'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { RootState } from 'state/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

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
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

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
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: false,
        })
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
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useSteps({ shopName: 'test-shop' }),
            initialState,
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.SKILLSET, condition: true },
            { step: WizardStepEnum.SHOPIFY_INTEGRATION, condition: true },
            { step: WizardStepEnum.EMAIL_INTEGRATION, condition: true },
            { step: WizardStepEnum.CHANNELS, condition: true },
            { step: WizardStepEnum.SALES_PERSONALITY, condition: true },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
        expect(result.current.totalSteps).toBe(7)
    })

    it('should exclude steps based on integration and email data', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useSteps({ shopName: 'test-shop' }),
            initialState,
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.SKILLSET, condition: true },
            { step: WizardStepEnum.CHANNELS, condition: true },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
        expect(result.current.totalSteps).toBe(4)
    })

    it('should include SALES_PERSONALITY step when AiAgentScopes.SALES is in data.scopes', () => {
        mockUseGetOnboardingData.mockReturnValue({
            data: { scopes: [AiAgentScopes.SALES] },
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useSteps({
                    shopName: 'test-shop',
                    selectedScope: [AiAgentScopes.SALES],
                }),
            initialState,
        )

        expect(result.current.validSteps).toContainEqual({
            step: WizardStepEnum.SALES_PERSONALITY,
            condition: true,
        })
    })

    it('should exclude SKILLSET step when pricing is usd-6', async () => {
        mockUseGetOnboardingData.mockReturnValue({
            data: { id: '123' },
            isLoading: false,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useSteps({
                    shopName: 'test-shop',
                }),
            {
                ...initialState,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                firstTierMonthlyAutomationPlan.plan_id,
                        },
                    },
                    domain: 'test.com',
                }),
            },
        )

        expect(result.current.validSteps).not.toContainEqual({
            step: WizardStepEnum.SKILLSET,
            condition: true,
        })
    })
})
