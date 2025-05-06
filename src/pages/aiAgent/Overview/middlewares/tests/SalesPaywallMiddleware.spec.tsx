import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { products } from 'fixtures/productPrices'
import { ProductType } from 'models/billing/types'
import { mockStore, renderWithRouter } from 'utils/testing'

import { SALES } from '../../../constants'
import { AIAgentPaywallFeatures } from '../../../types'
import { SalesPaywallMiddleware } from '../SalesPaywallMiddleware'

const MockChildComponent = () => <div data-testid="mock-child-component" />

jest.mock('pages/aiAgent/AiAgentPaywallView', () => ({
    AiAgentPaywallView: jest.fn(({ aiAgentPaywallFeature, children }) => (
        <div>
            Paywall View Mock - Feature: {aiAgentPaywallFeature}
            {/* Render children so we can query within the mock */}
            {children}
        </div>
    )),
}))

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: jest.fn(({ shopName, title, children }) => (
        <div>
            Layout Mock - Shop: {shopName}, Title: {title}
            {children}
        </div>
    )),
}))

const mockShopName = 'test-shop'

const renderMiddleware = (state = {}, flags = {}) => {
    const defaultState = {
        billing: fromJS({ products }),
        ...state,
    }
    mockFlags(flags)
    const WrappedComponent = SalesPaywallMiddleware(MockChildComponent)
    const path = '/shops/:shopName/ai-agent/sales'
    const initialRoute = `/shops/${mockShopName}/ai-agent/sales`

    return renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <Switch>
                <Route path={path} render={() => <WrappedComponent />} />
            </Switch>
        </Provider>,
        { route: initialRoute },
    )
}

describe('SalesPaywallMiddleware', () => {
    const salesFlagEnabled = {
        [FeatureFlagKey.StandaloneAIAgentSalesPage]: true,
    }
    const salesFlagDisabled = {
        [FeatureFlagKey.StandaloneAIAgentSalesPage]: false,
    }

    it('should render the child component when the sales page flag is enabled', () => {
        renderMiddleware({}, salesFlagEnabled)
        expect(screen.getByTestId('mock-child-component')).toBeInTheDocument()
        expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Paywall View Mock/)).not.toBeInTheDocument()
    })

    describe('when sales page flag is disabled', () => {
        const automatePlanPriceId = 'price_1LJBjXI9qXomtXqSSX34F3we'

        const stateWithAutomate = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {
                        [ProductType.Automation]: automatePlanPriceId,
                    },
                },
            }),
        }
        const stateWithoutAutomate = {
            currentAccount: fromJS({
                current_subscription: {
                    products: {},
                },
            }),
        }

        it('should render the SalesWaitlist paywall within layout when user has Automate', () => {
            renderMiddleware(stateWithAutomate, salesFlagDisabled)

            expect(
                screen.queryByTestId('mock-child-component'),
            ).not.toBeInTheDocument()

            const layout = screen.getByText(/Layout Mock/)
            expect(layout).toBeInTheDocument()
            expect(layout).toHaveTextContent(
                `Layout Mock - Shop: ${mockShopName}, Title: ${SALES}`,
            )

            const paywallView = screen.getByText(/Paywall View Mock/)
            expect(paywallView).toBeInTheDocument()
            expect(paywallView).toHaveTextContent(
                `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.SalesWaitlist}`,
            )
            // Check if candu div is rendered inside paywall
            expect(
                paywallView.querySelector(
                    '[data-candu-id="ai-agent-waitlist"]',
                ),
            ).toBeInTheDocument()
        })

        it('should render the Automate paywall within layout when user does not have Automate', () => {
            renderMiddleware(stateWithoutAutomate, salesFlagDisabled)

            expect(
                screen.queryByTestId('mock-child-component'),
            ).not.toBeInTheDocument()

            const layout = screen.getByText(/Layout Mock/)
            expect(layout).toBeInTheDocument()
            expect(layout).toHaveTextContent(
                `Layout Mock - Shop: ${mockShopName}, Title: ${SALES}`,
            )

            const paywallView = screen.getByText(/Paywall View Mock/)
            expect(paywallView).toBeInTheDocument()
            expect(paywallView).toHaveTextContent(
                `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.Automate}`,
            )
            // Check if candu div is NOT rendered inside paywall
            expect(
                paywallView.querySelector(
                    '[data-candu-id="ai-agent-waitlist"]',
                ),
            ).not.toBeInTheDocument()
        })
    })
})
