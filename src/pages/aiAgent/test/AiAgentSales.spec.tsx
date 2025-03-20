// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { AGENT_ROLE } from 'config/user'
import { HTTP_INTEGRATION_TYPE } from 'constants/integration'
import {
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPlan,
    products,
} from 'fixtures/productPrices'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentSales } from '../AiAgentSales'

jest.mock('../AiAgentPaywallView', () => ({
    AiAgentPaywallView: jest.fn(() => (
        <div data-testid="ai-agent-paywall-view" />
    )),
}))

jest.mock('../components/SalesSettings/SalesSettings', () => ({
    SalesSettings: jest.fn(() => <div data-testid="sales-settings" />),
}))

const queryClient = mockQueryClient()
const defaultState = {
    integrations: fromJS({
        integrations: [{ type: HTTP_INTEGRATION_TYPE }],
    }),
    ticket: fromJS(ticket),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: legacyBasicHelpdeskPlan.price_id,
            },
        },
    }),
    currentUser: fromJS({
        ...user,
        role: { name: AGENT_ROLE },
    }),
    billing: fromJS({ products }),
}

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentSales />
            </QueryClientProvider>
        </Provider>,
    )

describe('<AiAgentSales />', () => {
    describe('when feature flag is enabled', () => {
        it.each([
            { standaloneMenuFlag: false, title: 'AI Agent' },
            { standaloneMenuFlag: true, title: 'Sales Skills' },
        ])(
            'should render the sales settings with title "$title" when standalone menu flag is $standaloneMenuFlag',
            ({ standaloneMenuFlag, title }) => {
                mockFlags({
                    [FeatureFlagKey.StandaloneAIAgentSalesPage]: true,
                    [FeatureFlagKey.ConvAiStandaloneMenu]: standaloneMenuFlag,
                })
                renderComponent()

                expect(screen.getByTestId('sales-settings')).toBeInTheDocument()

                expect(
                    screen.queryByText(title, { selector: 'h1' }),
                ).toBeInTheDocument()
            },
        )
    })

    describe('when feature flag is disabled', () => {
        it.each([
            { standaloneMenuFlag: false, title: 'AI Agent' },
            { standaloneMenuFlag: true, title: 'Sales Skills' },
        ])(
            'should render the sales paywall with title "$title" when standalone menu flag is $standaloneMenuFlag',
            ({ standaloneMenuFlag, title }) => {
                mockFlags({
                    [FeatureFlagKey.StandaloneAIAgentSalesPage]: false,
                    [FeatureFlagKey.ConvAiStandaloneMenu]: standaloneMenuFlag,
                })
                renderComponent()

                expect(
                    screen.getByTestId('ai-agent-paywall-view'),
                ).toBeInTheDocument()

                expect(
                    screen.queryByText(title, { selector: 'h1' }),
                ).toBeInTheDocument()
            },
        )
    })
})
