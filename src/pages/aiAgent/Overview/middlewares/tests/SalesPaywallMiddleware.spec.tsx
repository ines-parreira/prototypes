import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Route, Switch } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { user } from 'fixtures/users'
import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from 'pages/aiAgent/hooks/useTrialEligibility'
// Import mocks
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
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

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
jest.mock('launchdarkly-react-client-sdk')
jest.mock('core/flags')
jest.mock('pages/aiAgent/Activation/hooks/useActivateAiAgentTrial')

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

const mockUseShoppingAssistantTrialAccess =
    useShoppingAssistantTrialAccess as jest.Mock
const mockUseFlag = useFlag as jest.Mock
const mockUseFlags = useFlags as jest.Mock
const mockAtLeastOneStoreHasActiveTrialOnSpecificStores =
    atLeastOneStoreHasActiveTrialOnSpecificStores as jest.Mock
const mockUseActivateAiAgentTrial = jest.requireMock(
    'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial',
).useActivateAiAgentTrial as jest.Mock

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
        mockUseShoppingAssistantTrialAccess.mockReturnValue({
            canSeeTrialCTA: false,
            canStartTrial: false,
        })
        mockUseFlag.mockReturnValue(false)
        mockUseFlags.mockReturnValue({})
        mockAtLeastOneStoreHasActiveTrialOnSpecificStores.mockReturnValue(false)
        mockUseActivateAiAgentTrial.mockReturnValue({
            canStartTrial: false,
            routes: {},
            startTrial: jest.fn(),
            isLoading: false,
            canStartTrialFromFeatureFlag: false,
            shopName: 'test-shop',
        })
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
        // Mock the revamp flag to false to use original logic
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.ShoppingAssistantTrialRevamp
                ? false
                : false,
        )
        // Mock trial access to return false for canSeeTrialCTA (revamp disabled)
        mockUseShoppingAssistantTrialAccess.mockReturnValue({
            canSeeTrialCTA: false,
            canStartTrial: false,
        })
        // Mock the original trial hook to return canStartTrial: true
        mockUseActivateAiAgentTrial.mockReturnValue({
            canStartTrial: true,
            routes: {},
            startTrial: jest.fn(),
            isLoading: false,
            canStartTrialFromFeatureFlag: false,
            shopName: 'test-shop',
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
        // Mock the revamp flag to false to use original logic
        mockUseFlag.mockImplementation((flag) =>
            flag === FeatureFlagKey.ShoppingAssistantTrialRevamp
                ? false
                : false,
        )
        // Mock trial access to return false for canSeeTrialCTA (revamp disabled)
        mockUseShoppingAssistantTrialAccess.mockReturnValue({
            canSeeTrialCTA: false,
            canStartTrial: false,
        })
        // Mock the original trial hook to return canStartTrialFromFeatureFlag: true
        mockUseActivateAiAgentTrial.mockReturnValue({
            canStartTrial: false,
            routes: {},
            startTrial: jest.fn(),
            isLoading: false,
            canStartTrialFromFeatureFlag: true,
            shopName: 'test-shop',
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

    describe('Shopping Assistant Trial Revamp', () => {
        it('shows trial button when revamp flag is enabled and canSeeTrialCTA is true', () => {
            // Mock the revamp flag to true
            mockUseFlag.mockImplementation((flag) =>
                flag === FeatureFlagKey.ShoppingAssistantTrialRevamp
                    ? true
                    : false,
            )
            // canSeeTrialCTA controls the button
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
            })
            // Set up other mocks to hit the upgrade paywall
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentUser) return fromJS(user)
                if (selector === getCurrentAccountState)
                    return fromJS({ domain: 'test' })
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                return undefined
            })
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })

            renderMiddleware()

            // The trial button should be present
            expect(
                screen.getByText('Start 14-Day Trial At No Additional Cost'),
            ).toBeInTheDocument()
        })

        it('does not show trial button when revamp flag is enabled and canSeeTrialCTA is false', () => {
            mockUseFlag.mockImplementation((flag) =>
                flag === FeatureFlagKey.ShoppingAssistantTrialRevamp
                    ? true
                    : false,
            )
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: false,
            })
            // Set up other mocks to hit the upgrade paywall
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentUser) return fromJS(user)
                if (selector === getCurrentAccountState)
                    return fromJS({ domain: 'test' })
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                return undefined
            })
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })

            renderMiddleware()

            // The trial button should NOT be present
            expect(
                screen.queryByText('Start 14-Day Trial At No Additional Cost'),
            ).not.toBeInTheDocument()
        })

        it('opens the revamp modal when trial button is clicked and revamp is enabled', () => {
            mockUseFlag.mockImplementation((flag) =>
                flag === FeatureFlagKey.ShoppingAssistantTrialRevamp
                    ? true
                    : false,
            )
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
            })
            // Set up other mocks to hit the upgrade paywall
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentUser) return fromJS(user)
                if (selector === getCurrentAccountState)
                    return fromJS({ domain: 'test' })
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                return undefined
            })
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })

            renderMiddleware()

            const trialButton = screen.getByText(
                'Start 14-Day Trial At No Additional Cost',
            )
            fireEvent.click(trialButton)

            // The modal should now be open (check for modal title)
            expect(
                screen.getByText(
                    'Try Shopping Assistant for 14 days at no additional cost',
                ),
            ).toBeInTheDocument()
        })

        it('calls startTrialOriginal when revamp is disabled and trial button is clicked', () => {
            mockUseFlag.mockImplementation(() => false) // revamp disabled
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: true,
            })
            const startTrialOriginal = jest.fn()
            mockUseActivateAiAgentTrial.mockReturnValue({
                canStartTrial: true,
                routes: {},
                startTrial: startTrialOriginal,
                isLoading: false,
                canStartTrialFromFeatureFlag: false,
                shopName: 'test-shop',
            })
            // Set up other mocks to hit the upgrade paywall
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentUser) return fromJS(user)
                if (selector === getCurrentAccountState)
                    return fromJS({ domain: 'test' })
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                return undefined
            })
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })

            renderMiddleware()

            const trialButton = screen.getByText(
                'Start 14-Day Trial At No Additional Cost',
            )
            fireEvent.click(trialButton)

            expect(startTrialOriginal).toHaveBeenCalled()
        })
    })
})
