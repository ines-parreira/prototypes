import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS, Map} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {AiAgentOnboarding} from 'pages/aiAgent/Onboarding/components/AiAgentOnboarding/AiAgentOnboarding'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

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
        default: ({children}: {children: React.ReactNode}) => (
            <div>{children}</div>
        ),
    })
)

jest.mock(
    'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation',
    () => ({
        __esModule: true,
        default: () => <div>AI Agent Preview</div>,
    })
)

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

const queryClient = new QueryClient()
const history = createMemoryHistory()

const renderComponent = (
    initialRoute = '/app/ai-agent/onboarding/skillset'
) => {
    history.push(initialRoute)

    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <AiAgentOnboarding />
            </Provider>
        </QueryClientProvider>,
        {history, path: '/app/ai-agent/onboarding/:step'}
    )
}

describe('AiAgentOnboarding', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
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

        expect(
            screen.getByText('Welcome to Conversational AI!')
        ).toBeInTheDocument()
    })

    it('should redirect to the main page if feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvAiOnboarding]: false,
        }))

        renderComponent()

        jest.runAllTimers()

        expect(history.location.pathname).toEqual(
            '/app/automation/shopify/undefined/ai-agent'
        )
    })

    it('should navigate to the next step when Next button is clicked', async () => {
        renderComponent(`/app/ai-agent/onboarding/${WizardStepEnum.HANDOVER}`)
        jest.runAllTimers()

        await waitFor(() => {
            expect(screen.getByText('Handover step')).toBeInTheDocument()
        })

        // Click Next
        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(history.location.pathname).toContain(
                WizardStepEnum.KNOWLEDGE
            )
        })
    })

    it('should navigate to the previous step when Back button is clicked', async () => {
        renderComponent(`/app/ai-agent/onboarding/${WizardStepEnum.HANDOVER}`)
        jest.runAllTimers()

        await waitFor(() => {
            expect(screen.getByText('Handover step')).toBeInTheDocument()
        })

        // Click Back
        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(history.location.pathname).toContain(
                WizardStepEnum.SALES_PERSONALITY
            )
        })
    })
})
