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
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
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

jest.mock('hooks/aiAgent/useAiAgentAccess')
const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)

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

const shop1 = {
    ...shopifyIntegration,
    meta: { ...shopifyIntegration.meta, shop_name: 'Test Store' },
}
const shop2 = {
    ...shopifyIntegration,
    meta: { ...shopifyIntegration.meta, shop_name: 'Test Store 2' },
}

describe('AiAgentRedirect', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentNavigation.mockImplementation(({ shopName }) => ({
            routes: {
                main: `/app/ai-agent/${shopName}`,
                overview: '/app/ai-agent/overview',
            },
        }))
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    test('renders the store integration view if no store is found, and hasAutomate is true', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) return []
            return []
        })
        const { getByText, history } = renderWithProvider()

        expect(history.location.pathname).toBe('/app/ai-agent')
        expect(
            getByText(
                'Connect Shopify, Magento or BigCommerce stores to start using AI Agent!',
            ),
        ).toBeInTheDocument()
    })

    test('redirects to overview page when user has AI Agent access and a store', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName)
                return [shop1, shop2]
            return []
        })

        const { history } = renderWithProvider()
        expect(history.location.pathname).toBe('/app/ai-agent/overview')
    })

    test('renders the store integration view when no store AND no AI Agent access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) return []
            return []
        })

        const { getByText, history } = renderWithProvider()

        expect(history.location.pathname).toBe('/app/ai-agent')
        expect(
            getByText(
                'Connect Shopify, Magento or BigCommerce stores to start using AI Agent!',
            ),
        ).toBeInTheDocument()
    })

    test('renders the paywall view when has store but no AI Agent access', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName)
                return [shop1, shop2]
            return []
        })

        const { getByText, history } = renderWithProvider()

        expect(getByText(/Paywall/)).toBeInTheDocument()
        expect(history.location.pathname).toBe('/app/ai-agent')
    })
})
