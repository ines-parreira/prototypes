import React from 'react'

import { screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Route, Switch } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { AIAgentPaywallFeatures } from '../../../types'
import { SalesPaywallMiddleware } from '../SalesPaywallMiddleware'

const MockChildComponent = () => <div data-testid="mock-child-component" />

jest.mock('pages/aiAgent/Activation/hooks/useActivation', () => ({
    useActivation: jest.fn(() => ({
        earlyAccessModal: null,
        showEarlyAccessModal: jest.fn(),
    })),
}))

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

const renderMiddleware = () => {
    const WrappedComponent = SalesPaywallMiddleware(MockChildComponent)
    const path = '/shops/:shopName/ai-agent/sales'
    const initialRoute = `/shops/${mockShopName}/ai-agent/sales`

    return renderWithRouter(
        <Switch>
            <Route path={path} render={() => <WrappedComponent />} />
        </Switch>,
        { route: initialRoute },
    )
}

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('SalesPaywallMiddleware', () => {
    it('should render automate paywall when it doesnt has automate', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getHasAutomate) {
                return false
            }

            return undefined
        })

        renderMiddleware()

        expect(
            screen.queryByTestId('mock-child-component'),
        ).not.toBeInTheDocument()

        const paywallView = screen.getByText(/Paywall View Mock/)
        expect(paywallView).toBeInTheDocument()
        expect(paywallView).toHaveTextContent(
            `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.Automate}`,
        )
        // Check if candu div is NOT rendered inside paywall
        expect(
            paywallView.querySelector('[data-candu-id="ai-agent-waitlist"]'),
        ).not.toBeInTheDocument()
    })

    describe('isAiShoppingAssistantEnabled', () => {
        it('should render upgrade paywall when it has automate + beta user not on generation 6 plan', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) {
                    return true
                }

                if (selector === getCurrentAutomatePlan) {
                    return {
                        generation: 5,
                    }
                }

                return undefined
            })
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })

            renderMiddleware()

            expect(
                screen.queryByTestId('mock-child-component'),
            ).not.toBeInTheDocument()

            const paywallView = screen.getByText(/Paywall View Mock/)
            expect(paywallView).toBeInTheDocument()
            expect(paywallView).toHaveTextContent(
                `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.Upgrade}`,
            )
            // Check if candu div is NOT rendered inside paywall
            expect(
                paywallView.querySelector(
                    '[data-candu-id="ai-agent-waitlist"]',
                ),
            ).not.toBeInTheDocument()
        })

        it('should render the child component when it has automate + beta user on generation 6 plan', () => {
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) {
                    return true
                }

                if (selector === getCurrentAutomatePlan) {
                    return {
                        generation: 6,
                    }
                }

                return undefined
            })

            renderMiddleware()
            expect(
                screen.getByTestId('mock-child-component'),
            ).toBeInTheDocument()
            expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
            expect(
                screen.queryByText(/Paywall View Mock/),
            ).not.toBeInTheDocument()
        })

        it('should render the child component when it has automate + alpha/demo user', () => {
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: true,
                [FeatureFlagKey.AiSalesAgentBeta]: false,
            })
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) {
                    return true
                }

                if (selector === getCurrentAutomatePlan) {
                    return {
                        generation: 6,
                    }
                }

                return undefined
            })

            renderMiddleware()
            expect(
                screen.getByTestId('mock-child-component'),
            ).toBeInTheDocument()
            expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
            expect(
                screen.queryByText(/Paywall View Mock/),
            ).not.toBeInTheDocument()
        })
    })

    describe('isAiShoppingAssistantEnabled false', () => {
        it('should render waitlist paywall when it has automate + beta user not on generation 6 plan', () => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) {
                    return true
                }

                if (selector === getCurrentAutomatePlan) {
                    return {
                        generation: 5,
                    }
                }

                return undefined
            })
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })

            renderMiddleware()

            expect(
                screen.queryByTestId('mock-child-component'),
            ).not.toBeInTheDocument()

            const paywallView = screen.getByText(/Paywall View Mock/)
            expect(paywallView).toBeInTheDocument()
            expect(paywallView).toHaveTextContent(
                `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.SalesWaitlist}`,
            )
            // Check if candu div is NOT rendered inside paywall
            expect(
                paywallView.querySelector(
                    '[data-candu-id="ai-agent-waitlist"]',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should render the child component when it has automate + beta user on generation 5 plan + alpha/demo user', () => {
        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
            [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: true,
            [FeatureFlagKey.AiSalesAgentBeta]: true,
        })
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getHasAutomate) {
                return true
            }

            if (selector === getCurrentAutomatePlan) {
                return {
                    generation: 5,
                }
            }

            return undefined
        })

        renderMiddleware()
        expect(screen.getByTestId('mock-child-component')).toBeInTheDocument()
        expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Paywall View Mock/)).not.toBeInTheDocument()
    })

    it.each([{ generation: 5 }, { generation: 6 }])(
        'should render waitlist paywall when it has automate + any generation plan and not part of demo/alpha/beta',
        ({ generation }) => {
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) {
                    return true
                }

                if (selector === getCurrentAutomatePlan) {
                    return {
                        generation,
                    }
                }

                return undefined
            })
            mockFlags({
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: false,
            })

            renderMiddleware()

            expect(
                screen.queryByTestId('mock-child-component'),
            ).not.toBeInTheDocument()

            const paywallView = screen.getByText(/Paywall View Mock/)
            expect(paywallView).toBeInTheDocument()
            expect(paywallView).toHaveTextContent(
                `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.SalesWaitlist}`,
            )
            expect(
                paywallView.querySelector(
                    '[data-candu-id="ai-agent-waitlist"]',
                ),
            ).toBeInTheDocument()
        },
    )
})
