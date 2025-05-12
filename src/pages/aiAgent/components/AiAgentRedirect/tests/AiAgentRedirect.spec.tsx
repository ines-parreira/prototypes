import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getHasAutomate } from 'state/billing/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { AiAgentRedirect } from '../AiAgentRedirect'

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock

jest.mock('pages/aiAgent/AiAgentPaywallView', () => ({
    AiAgentPaywallView: () => <div>Paywall</div>,
}))

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    currentAccount: fromJS(account),
    currentUser: fromJS(user),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const renderWithProvider = () => {
    const { container, getByText, history } = renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={mockQueryClient()}>
                <AiAgentRedirect />
            </QueryClientProvider>
        </Provider>,
        {
            path: '/app/ai-agent',
            route: '/app/ai-agent',
        },
    )

    return { container, getByText, history }
}

describe('RedirectToAiAgentStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentNavigation.mockImplementation(({ shopName }) => ({
            routes: {
                main: `/app/ai-agent/${shopName}`,
                overview: '/app/ai-agent/overview',
            },
        }))
    })

    test('redirects to overview page when user has AI Agent and a store', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            if (selector === getShopifyIntegrationsSortedByName)
                return [{ name: 'Test Store' }, { name: 'Test Store 2' }]
            return []
        })

        const { history } = renderWithProvider()
        expect(history.location.pathname).toBe('/app/ai-agent/overview')
    })

    test('renders the store integration view if no store is found', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getHasAutomate) return true
            if (selector === getShopifyIntegrationsSortedByName) return []
            return []
        })

        const { getByText, history } = renderWithProvider()

        expect(history.location.pathname).toBe('/app/ai-agent')
        expect(
            getByText(
                'Connect Shopify, Magento or BigCommerce stores to start using Automate!',
            ),
        ).toBeInTheDocument()
    })

    describe('when user does not have Automate', () => {
        beforeEach(() => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getHasAutomate) return false
                if (selector === getShopifyIntegrationsSortedByName)
                    return [{ name: 'Test Store' }, { name: 'Test Store 2' }]
                return []
            })
        })

        describe('when the automate paywall flag is enabled', () => {
            test('renders the paywall view', () => {
                const { getByText, history } = renderWithProvider()

                expect(getByText(/Paywall/)).toBeInTheDocument()
                expect(history.location.pathname).toBe('/app/ai-agent')
            })
        })
    })
})
