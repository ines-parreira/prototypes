import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Route, Switch } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from 'pages/aiAgent/hooks/useTrialEligibility'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { AIAgentPaywallFeatures } from '../../../types'
import { SalesPaywallMiddleware } from '../SalesPaywallMiddleware'

const MockChildComponent = () => <div data-testid="mock-child-component" />
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const useStoreActivationsMock = assumeMock(useStoreActivations)
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

jest.mock('pages/aiAgent/hooks/useTrialEligibility')
const useTrialEligibilityMock = assumeMock(useTrialEligibility)
const useTrialEligibilityForManualActivationFromFeatureFlagMock = assumeMock(
    useTrialEligibilityForManualActivationFromFeatureFlag,
)

const mockShopName = 'test-shop'
const queryClient = mockQueryClient()

const renderMiddleware = () => {
    const WrappedComponent = SalesPaywallMiddleware(MockChildComponent)
    const path = '/shops/:shopName/ai-agent/sales'
    const initialRoute = `/shops/${mockShopName}/ai-agent/sales`

    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Switch>
                <Route path={path} render={() => <WrappedComponent />} />
            </Switch>
        </QueryClientProvider>,
        { route: initialRoute },
    )
}

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('SalesPaywallMiddleware', () => {
    beforeEach(() => {
        useStoreActivationsMock.mockReturnValue({
            storeActivations: {},
        } as any)
        useTrialEligibilityMock.mockReturnValue({
            canStartTrial: false,
            isLoading: false,
        })
        useTrialEligibilityForManualActivationFromFeatureFlagMock.mockReturnValue(
            {
                canStartTrial: false,
            },
        )
    })
    it('should render automate paywall when it doesnt has automate', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getHasAutomate) {
                return false
            }

            if (selector === getCurrentUser) {
                return fromJS(user)
            }

            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
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

                if (selector === getCurrentUser) {
                    return fromJS(user)
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
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

                if (selector === getCurrentUser) {
                    return fromJS(user)
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
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

                if (selector === getCurrentUser) {
                    return fromJS(user)
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
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

                if (selector === getCurrentUser) {
                    return fromJS(user)
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
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

            if (selector === getCurrentUser) {
                return fromJS(user)
            }

            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
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
            paywallView.querySelector('[data-candu-id="ai-agent-waitlist"]'),
        ).not.toBeInTheDocument()
    })

    it('should render start trial paywall when it has automate + beta user on usd-5 plan', () => {
        useTrialEligibilityMock.mockReturnValue({
            canStartTrial: true,
            isLoading: false,
        })
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getHasAutomate) {
                return true
            }

            if (selector === getCurrentUser) {
                return fromJS(user)
            }

            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
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
        const buttons = paywallView.querySelectorAll('button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0]).toHaveTextContent('Upgrade Now')
        expect(buttons[1]).toHaveTextContent(
            'Start 14-Day Trial At No Additional Cost',
        )
    })

    it('should render start trial paywall when it has automate + beta user on usd-5 plan + manual activation from feature flag', () => {
        useTrialEligibilityMock.mockReturnValue({
            canStartTrial: false,
            isLoading: false,
        })
        useTrialEligibilityForManualActivationFromFeatureFlagMock.mockReturnValue(
            {
                canStartTrial: true,
            },
        )
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getHasAutomate) {
                return true
            }

            if (selector === getCurrentUser) {
                return fromJS(user)
            }

            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
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
            [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
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
        const buttons = paywallView.querySelectorAll('button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0]).toHaveTextContent('Upgrade Now')
        expect(buttons[1]).toHaveTextContent(
            'Start 14-Day Trial At No Additional Cost',
        )
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

            if (selector === getCurrentUser) {
                return fromJS(user)
            }

            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
            }

            if (selector === getCurrentAutomatePlan) {
                return {
                    generation: 6,
                }
            }

            return undefined
        })

        renderMiddleware()
        expect(screen.getByTestId('mock-child-component')).toBeInTheDocument()
        expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Paywall View Mock/)).not.toBeInTheDocument()
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

            if (selector === getCurrentUser) {
                return fromJS(user)
            }

            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
            }

            if (selector === getCurrentAutomatePlan) {
                return {
                    generation: 6,
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

                if (selector === getCurrentUser) {
                    return fromJS(user)
                }

                if (selector === getCurrentAccountState) {
                    return fromJS({ domain: 'test' }) as Map<string, string>
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
