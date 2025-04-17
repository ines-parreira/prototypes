import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import LD from 'launchdarkly-react-client-sdk'

import '@testing-library/jest-dom/extend-expect'

import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding/components/AiAgentOnboarding/AiAgentOnboarding'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useGetSkillsetStep } from 'pages/aiAgent/Onboarding/hooks/useGetSkillsetStep'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

// Mock the hooks
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

jest.mock('pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview',
    () => ({
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation',
    () => ({
        __esModule: true,
        default: () => <div>AI Agent Preview</div>,
    }),
)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData', () => ({
    useGetOnboardingData: jest.fn(),
}))

jest.mock('pages/aiAgent/Onboarding/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetSkillsetStep')
const useGetSkillsetStepMock = assumeMock(useGetSkillsetStep)

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

const queryClient = new QueryClient()
const history = createMemoryHistory()

const renderComponent = (
    initialRoute = '/app/ai-agent/onboarding/skillset',
    defaultPath = '/app/ai-agent/onboarding/:step',
) => {
    history.push(initialRoute)

    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <AiAgentOnboarding />
            </Provider>
        </QueryClientProvider>,
        { history, path: defaultPath },
    )
}

describe('AiAgentOnboarding', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: null,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                id: 1,
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.8,
                scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
                shopName: shopifyIntegration.meta.shop_name,
            },
        })
        useTopProductsMock.mockReturnValue({
            isLoading: false,
            data: [],
        })

        useGetSkillsetStepMock.mockReturnValue({
            hasSkillsetStep: true,
        })

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvAiOnboarding]: true,
        }))
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders the Onboarding component', () => {
        renderComponent()
        jest.runAllTimers()

        expect(screen.getByText(/Welcome to AI Agent!/i)).toBeInTheDocument()
    })

    it('should redirect to the main page if feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvAiOnboarding]: false,
        }))

        renderComponent()

        jest.runAllTimers()

        expect(history.location.pathname).toEqual(
            '/app/automation/shopify/undefined/ai-agent',
        )
    })

    it('should navigate to the next step when Next button is clicked', async () => {
        renderComponent()

        jest.runAllTimers()

        await waitFor(() => {
            expect(screen.getByText(/Select your skills/)).toBeInTheDocument()
        })

        // Click Next
        await userEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(history.location.pathname).toContain(
                WizardStepEnum.SHOPIFY_INTEGRATION,
            )
        })
    })

    it('should navigate to the previous step when Back button is clicked', async () => {
        renderComponent(
            `/app/ai-agent/shopify/shopify-store/onboarding/${WizardStepEnum.KNOWLEDGE}`,
            '/app/ai-agent/:shopType/:shopName/onboarding/:step',
        )

        jest.runAllTimers()

        await waitFor(() => {
            expect(screen.getByText(/AI Agent's knowledge/)).toBeInTheDocument()
        })

        // Click Back
        await userEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(history.location.pathname).toContain(
                WizardStepEnum.PERSONALITY_PREVIEW,
            )
        })
    })
})
