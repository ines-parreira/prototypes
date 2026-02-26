import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { TimeSeriesResult } from 'domains/reporting/hooks/useTimeSeries'
import { useAverageOrdersPerDayTrend } from 'domains/reporting/pages/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding/components/AiAgentOnboarding/AiAgentOnboarding'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useTopProducts } from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

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
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview',
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
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/useAverageOrdersPerDayTrend',
)
const useAverageOrdersPerDayTrendMock = assumeMock(useAverageOrdersPerDayTrend)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

useAverageOrdersPerDayTrendMock.mockReturnValue({
    data: undefined,
    isFetching: false,
    isError: false,
} as unknown as TimeSeriesResult)

const mockUseFlag = jest.mocked(useFlag)

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

const queryClient = new QueryClient()
const history = createMemoryHistory()

const renderComponent = (
    initialRoute = '/app/ai-agent/onboarding/shopify integration',
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

        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )
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

        expect(
            screen.getByText(/First, let's connect your/i),
        ).toBeInTheDocument()
        expect(screen.getByText(/Shopify account/i)).toBeInTheDocument()
    })

    it('should keep user on onboarding even if feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        renderComponent()

        jest.runAllTimers()

        expect(history.location.pathname).toContain('/app/ai-agent/onboarding')
    })

    it('should navigate to the next step when Next button is clicked', async () => {
        renderComponent()

        jest.runAllTimers()

        await waitFor(() => {
            expect(
                screen.getByText(/First, let's connect your/i),
            ).toBeInTheDocument()
        })

        // Click Next
        userEvent.click(
            screen.getByRole('button', {
                name: /Next/i,
            }),
        )

        await waitFor(() => {
            expect(history.location.pathname).toContain(WizardStepEnum.CHANNELS)
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
        userEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(history.location.pathname).toContain(
                WizardStepEnum.PERSONALITY_PREVIEW,
            )
        })
    })
})
