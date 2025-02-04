import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen} from '@testing-library/react'
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
const onCloseMock = jest.fn()

const renderComponent = (withHistory = false) => {
    if (withHistory) {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvAiOnboarding]: false,
        }))

        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <AiAgentOnboarding onClose={onCloseMock} />
                </Provider>
            </QueryClientProvider>,
            {history}
        )
    }
    return renderWithRouter(
        <>
            <QueryClientProvider client={queryClient}>
                <AiAgentOnboarding onClose={onCloseMock} />
            </QueryClientProvider>
        </>
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

    it('renders the Onboarding component', () => {
        renderComponent()
        expect(screen.getByAltText('Gorgias')).toBeInTheDocument()
    })

    it('displays loading state correctly', () => {
        renderComponent()
        expect(screen.getByAltText('Gorgias')).toBeInTheDocument()
    })

    it('should redirect to the main page if feature flag is disabled', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvAiOnboarding]: false,
        }))
        renderComponent(true)

        expect(history.location.pathname).toEqual(
            '/app/automation/shopify/undefined/ai-agent'
        )
    })

    it('should call onClose handler when OnboardingHeader is closed', () => {
        renderComponent()

        // Simulate the OnboardingHeader close action
        const closeButton = screen.getByRole('button', {name: /close/i})

        fireEvent.click(closeButton)

        expect(onCloseMock).toHaveBeenCalled()
    })

    it('renders default step if no valid step is matched', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })

        const {container} = renderComponent()

        expect(container.textContent).toContain(
            'Welcome to Conversational AI Select your agents below to get  started!'
        )
    })
})
