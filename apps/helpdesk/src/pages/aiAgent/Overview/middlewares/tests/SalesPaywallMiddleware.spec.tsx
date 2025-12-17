import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Route, Switch } from 'react-router-dom'

import { user } from 'fixtures/users'
import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from 'pages/aiAgent/hooks/useTrialEligibility'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useNotifyAdmins } from 'pages/aiAgent/trial/hooks/useNotifyAdmins'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { SalesPaywallMiddleware } from '../SalesPaywallMiddleware'

const MockChildComponent = () => <div data-testid="mock-child-component" />
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const useStoreActivationsMock = assumeMock(useStoreActivations)
jest.mock('pages/aiAgent/Activation/hooks/useActivation')
const useActivationMock = jest.requireMock(
    'pages/aiAgent/Activation/hooks/useActivation',
).useActivation

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

jest.mock(
    'pages/aiAgent/components/AIAgentWelcomePageView/AIAgentWelcomePageView',
    () => ({
        AIAgentWelcomePageView: jest.fn(() => (
            <div>Paywall View Mock - Feature: TrialSetup</div>
        )),
    }),
)

jest.mock('pages/aiAgent/hooks/useTrialEligibility')
const useTrialEligibilityMock = assumeMock(useTrialEligibility)
const useTrialEligibilityForManualActivationFromFeatureFlagMock = assumeMock(
    useTrialEligibilityForManualActivationFromFeatureFlag,
)

jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
jest.mock('pages/aiAgent/trial/hooks/useNotifyAdmins')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
jest.mock('@repo/feature-flags')
jest.mock('pages/aiAgent/Activation/hooks/useActivateAiAgentTrial')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')
jest.mock('hooks/aiAgent/useAiAgentUpgradePlan')
jest.mock('@repo/logging')
jest.mock('hooks/useModalManager')

// Mock modal components
jest.mock(
    'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal',
    () => ({
        UpgradePlanModal: jest.fn(
            ({ onConfirm, onClose, onDismiss, isLoading, title }) => (
                <div>
                    <h2>{title}</h2>
                    <button onClick={onConfirm} disabled={isLoading}>
                        Confirm
                    </button>
                    <button onClick={onDismiss}>Dismiss</button>
                    <button onClick={onClose}>Close</button>
                </div>
            ),
        ),
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal',
    () => ({
        TrialActivatedModal: jest.fn(({ onConfirm, title }) => (
            <div>
                <h2>{title}</h2>
                <button onClick={onConfirm}>Confirm</button>
            </div>
        )),
    }),
)

jest.mock('pages/aiAgent/Activation/components/AIAgentTrialSuccessModal', () =>
    jest.fn(({ isOpen, onClick, onClose }) =>
        isOpen ? (
            <div>
                <h2>Trial Success Modal</h2>
                <button onClick={onClick}>Navigate</button>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
    ),
)

const mockShopName = 'test-shop'

const renderMiddleware = () => {
    const WrappedComponent = SalesPaywallMiddleware(MockChildComponent)
    const path = '/shops/:shopName/ai-agent/sales'
    const initialRoute = `/shops/${mockShopName}/ai-agent/sales`

    return renderWithStoreAndQueryClientAndRouter(
        <Switch>
            <Route path={path} render={() => <WrappedComponent />} />
        </Switch>,
        {},
        { route: initialRoute, path },
    )
}

jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')

const useAppSelectorMock = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

const useStoreIntegrationsMock = useStoreIntegrations as jest.Mock

const mockUseSalesTrialRevampMilestone =
    useSalesTrialRevampMilestone as jest.Mock
const mockUseTrialAccess = useTrialAccess as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseAiAgentOnboardingNotification =
    useAiAgentOnboardingNotification as jest.Mock
const mockUseNotifyAdmins = useNotifyAdmins as jest.Mock
const mockUseFlag = useFlag as jest.Mock
const mockAtLeastOneStoreHasActiveTrialOnSpecificStores =
    atLeastOneStoreHasActiveTrialOnSpecificStores as jest.Mock
const mockUseActivateAiAgentTrial = jest.requireMock(
    'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial',
).useActivateAiAgentTrial as jest.Mock
const mockUseShoppingAssistantTrialFlow =
    useShoppingAssistantTrialFlow as jest.Mock
const mockUseTrialModalProps = useTrialModalProps as jest.Mock
const mockUseUpgradePlan = useUpgradePlan as jest.Mock
const mockLogEvent = logEvent as jest.Mock
const mockUseModalManager = useModalManager as jest.Mock
const mockAiAgentUpgradePlan = useAiAgentUpgradePlan as jest.Mock

const setupUseAppSelectorMock = ({
    hasAutomate = true,
    currentUser = fromJS(user),
    currentAccountDomain = 'test',
    currentAutomatePlan = null,
    userRole = 'admin',
}: {
    hasAutomate?: boolean
    currentUser?: any
    currentAccountDomain?: string
    currentAutomatePlan?: any
    userRole?: string
} = {}) => {
    useAppSelectorMock.mockImplementation((selector) => {
        if (selector === getHasAutomate) {
            return hasAutomate
        }
        if (selector === getCurrentUser) {
            return currentUser
        }
        if (selector === getCurrentAccountState) {
            return fromJS({ domain: currentAccountDomain })
        }
        if (selector === getCurrentAutomatePlan) {
            return currentAutomatePlan
        }
        if (selector === getRoleName) {
            return userRole
        }
        return undefined
    })
}

describe('SalesPaywallMiddleware', () => {
    beforeEach(() => {
        // Default to 'off' for the milestone hook
        mockUseSalesTrialRevampMilestone.mockReturnValue('off')
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
        mockUseNotifyAdmins.mockReturnValue({
            isDisabled: false,
        })
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: undefined,
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            onboardingNotificationState: undefined,
            handleOnSave: jest.fn(),
            handleOnSendOrCancelNotification: jest.fn(),
            handleOnPerformActionPostReceivedNotification: jest.fn(),
        })
        mockUseTrialAccess.mockReturnValue({
            canSeeTrialCTA: false,
            canStartTrial: false,
            hasTrialExpired: false,
            hasCurrentStoreTrialStarted: false,
            hasCurrentStoreTrialExpired: false,
            hasAnyTrialOptedIn: false,
            canBookDemo: false,
        })
        mockUseFlag.mockReturnValue(false)
        mockAtLeastOneStoreHasActiveTrialOnSpecificStores.mockReturnValue(false)
        mockUseActivateAiAgentTrial.mockReturnValue({
            canStartTrial: false,
            routes: {},
            startTrial: jest.fn(),
            isLoading: false,
            canStartTrialFromFeatureFlag: false,
            shopName: 'test-shop',
        })
        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            getUseShoppingAssistantTrialFlowFixture(),
        )
        mockUseTrialModalProps.mockReturnValue({
            trialUpgradePlanModal: {
                title: 'Try the full power of AI Agent for 14 days at no additional cost',
                description: 'Test description',
            },
            trialActivatedModal: {
                title: 'Shopping Assistant Activated',
                description: 'Test description',
            },
            upgradePlanModal: {
                title: 'Upgrade your plan',
                description: 'Test description',
            },
        })
        mockUseUpgradePlan.mockReturnValue({
            upgradePlanAsync: jest.fn(),
            isLoading: false,
        })
        useActivationMock.mockReturnValue({
            earlyAccessModal: null,
            showEarlyAccessModal: jest.fn(),
        })
        mockUseModalManager.mockReturnValue({
            isOpen: jest.fn().mockReturnValue(false),
            openModal: jest.fn(),
            closeModal: jest.fn(),
        })
        mockLogEvent.mockClear()
        // Default useAppSelector mock
        setupUseAppSelectorMock()
        // Default useEarlyAccessAutomatePlan mock to null (no plan)
        mockAiAgentUpgradePlan.mockReturnValue({ data: null })
        // Mock store integrations to have at least one integration
        useStoreIntegrationsMock.mockReturnValue([
            {
                id: 1,
                name: 'test-shop',
                type: IntegrationType.Shopify,
            } as StoreIntegration,
        ])
    })
    it('should render AI Agent paywall when it doesnt has AI Agent', () => {
        setupUseAppSelectorMock({ hasAutomate: false })

        renderMiddleware()

        expect(
            screen.queryByTestId('mock-child-component'),
        ).not.toBeInTheDocument()

        const paywallView = screen.getByText(/Paywall View Mock/)
        expect(paywallView).toBeInTheDocument()
        expect(paywallView).toHaveTextContent(
            `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.TrialSetup}`,
        )
        // Check if candu div is NOT rendered inside paywall
        expect(
            paywallView.querySelector('[data-candu-id="ai-agent-waitlist"]'),
        ).not.toBeInTheDocument()
    })

    describe('isAiShoppingAssistantEnabled', () => {
        it('should render upgrade paywall when it has automate not on generation 6 plan', () => {
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    isAdminUser: true,
                }),
            )
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

        it('should render the child component when it has automate on generation 6 plan', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 6 },
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

        it('should render the child component when it has automate + alpha user', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                    key === FeatureFlagKey.AiSalesAgentBypassPlanCheck ||
                    false,
            )
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 6 },
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
        it('should render waitlist paywall when it has automate not on generation 6 plan', () => {
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
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

    it('should render the child component when it has automate on generation 5 plan + alpha/demo user', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
        })

        mockUseTrialAccess.mockReturnValue(
            createMockTrialAccess({
                isAdminUser: true,
            }),
        )
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

    it('should render start trial paywall when it has automate on usd-5 plan', () => {
        useTrialEligibilityMock.mockReturnValue({
            canStartTrial: true,
            isLoading: false,
        })
        // Mock the milestone to 'off' to use original logic
        mockUseSalesTrialRevampMilestone.mockReturnValue('off')
        // Mock trial access to return false for canSeeTrialCTA (revamp disabled)
        mockUseTrialAccess.mockReturnValue(
            createMockTrialAccess({
                canSeeTrialCTA: true,
                canSeeSubscribeNowCTA: false,
                canStartTrial: false,
                hasTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                canBookDemo: false,
                isAdminUser: true,
            }),
        )
        // Mock the original trial hook to return canStartTrial: true
        mockUseActivateAiAgentTrial.mockReturnValue({
            canStartTrial: true,
            routes: {},
            startTrial: jest.fn(),
            isLoading: false,
            canStartTrialFromFeatureFlag: false,
            shopName: 'test-shop',
        })
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
        })
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )
        // Mock earlyAccessPlan to have value for Upgrade Now button to appear
        mockAiAgentUpgradePlan.mockReturnValue({
            data: {
                id: 'early-access-123',
                name: 'Early Access Plan',
            },
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
        expect(buttons).toHaveLength(1)
        expect(buttons[0]).toHaveTextContent(
            `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
        )
    })

    it('should render start trial paywall when it has automate on usd-5 plan + manual activation from feature flag', () => {
        useTrialEligibilityMock.mockReturnValue({
            canStartTrial: true,
            isLoading: false,
        })
        useTrialEligibilityForManualActivationFromFeatureFlagMock.mockReturnValue(
            {
                canStartTrial: true,
            },
        )
        // Mock the milestone to 'off' to use original logic
        mockUseSalesTrialRevampMilestone.mockReturnValue('off')
        // Mock trial access to return false for canSeeTrialCTA (revamp disabled)
        mockUseTrialAccess.mockReturnValue(
            createMockTrialAccess({
                canSeeTrialCTA: true,
                canStartTrial: true,
                hasTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                canBookDemo: false,
                isAdminUser: true,
            }),
        )
        // Mock the original trial hook to return canStartTrialFromFeatureFlag: true
        mockUseActivateAiAgentTrial.mockReturnValue({
            canStartTrial: false,
            routes: {},
            startTrial: jest.fn(),
            isLoading: false,
            canStartTrialFromFeatureFlag: true,
            shopName: 'test-shop',
        })
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
        })
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                false,
        )
        // Mock earlyAccessPlan to have value for Upgrade Now button to appear
        mockAiAgentUpgradePlan.mockReturnValue({
            data: {
                id: 'early-access-123',
                name: 'Early Access Plan',
            },
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
        expect(buttons).toHaveLength(1)
        expect(buttons[0]).toHaveTextContent(
            `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
        )
    })

    it('should render the child component when it has automate on generation 6 plan', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 6 },
        })

        renderMiddleware()
        expect(screen.getByTestId('mock-child-component')).toBeInTheDocument()
        expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Paywall View Mock/)).not.toBeInTheDocument()
    })

    it('should render the child component when it has automate + alpha/demo user', () => {
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                key === FeatureFlagKey.AiSalesAgentBypassPlanCheck ||
                false,
        )
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 6 },
        })

        renderMiddleware()
        expect(screen.getByTestId('mock-child-component')).toBeInTheDocument()
        expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Paywall View Mock/)).not.toBeInTheDocument()
    })

    it('should render the child component and bypass paywall when AB testing flag is enabled', () => {
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                key === FeatureFlagKey.AiShoppingAssistantAbTesting ||
                false,
        )
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
        })

        renderMiddleware()
        expect(screen.getByTestId('mock-child-component')).toBeInTheDocument()
        expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Paywall View Mock/)).not.toBeInTheDocument()
    })

    it('should render waitlist paywall when it has automate + generation 5 plan and not part of alpha', () => {
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
        })

        renderMiddleware()

        const paywallView = screen.getByText(/Paywall View Mock/)
        expect(paywallView).toBeInTheDocument()
        expect(paywallView).toHaveTextContent(
            `Paywall View Mock - Feature: ${AIAgentPaywallFeatures.SalesWaitlist}`,
        )
        expect(
            paywallView.querySelector('[data-candu-id="ai-agent-waitlist"]'),
        ).toBeInTheDocument()
    })

    describe('Shopping Assistant Trial Revamp', () => {
        it('shows trial button when revamp flag is enabled and canSeeTrialCTA is true', () => {
            // Mock the milestone to 'milestone-0' (equivalent to true)
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            // canSeeTrialCTA controls the button
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: false,
                    isAdminUser: true,
                }),
            )
            // Set up other mocks to hit the upgrade paywall
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            // The trial button should be present
            expect(
                screen.getByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                ),
            ).toBeInTheDocument()
        })

        it('does not show trial button when revamp flag is enabled and canSeeTrialCTA is false', () => {
            // Mock the milestone to 'milestone-0' (equivalent to true)
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: false,
                hasTrialExpired: false,
            })
            // Set up other mocks to hit the upgrade paywall
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            // The trial button should NOT be present
            expect(
                screen.queryByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                ),
            ).not.toBeInTheDocument()
        })

        it('opens the revamp modal when trial button is clicked and revamp is enabled', async () => {
            // Mock the milestone to 'milestone-0' (equivalent to true)
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: false,
                    isAdminUser: true,
                }),
            )

            const mockOpenTrialUpgradeModal = jest.fn()
            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    openTrialUpgradeModal: mockOpenTrialUpgradeModal,
                }),
            )

            // Set up other mocks to hit the upgrade paywall
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            const trialButton = screen.getByText(
                `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            )
            await act(() => userEvent.click(trialButton))

            // Verify that the openTrialUpgradeModal function was called
            expect(mockOpenTrialUpgradeModal).toHaveBeenCalled()
        })

        it('calls startTrialOriginal when revamp is disabled and trial button is clicked', async () => {
            mockUseFlag.mockImplementation(() => false) // revamp disabled
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: true,
                    isAdminUser: true,
                }),
            )
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
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            const trialButton = screen.getByText(
                `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            )
            await act(() => userEvent.click(trialButton))

            expect(startTrialOriginal).toHaveBeenCalled()
        })
    })

    describe('Modal Interactions and onUpgradeClick', () => {
        beforeEach(() => {
            // Set up conditions for upgrade paywall with modals
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentUser) return fromJS(user)
                if (selector === getCurrentAccountState)
                    return fromJS({ domain: 'test' })
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                return undefined
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
        })

        it('renders trial upgrade modal when isTrialModalOpen is true', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    isTrialModalOpen: true,
                }),
            )

            renderMiddleware()

            expect(
                screen.getByText(
                    'Try the full power of AI Agent for 14 days at no additional cost',
                ),
            ).toBeInTheDocument()
        })

        it('renders success modal when isSuccessModalOpen is true', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    isSuccessModalOpen: true,
                }),
            )

            renderMiddleware()

            expect(
                screen.getByText('Shopping Assistant Activated'),
            ).toBeInTheDocument()
        })

        it('calls startRevampTrial when trial upgrade modal confirm is clicked', async () => {
            const mockStartRevampTrial = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    startTrialDeprecated: mockStartRevampTrial,
                    isTrialModalOpen: true,
                }),
            )

            renderMiddleware()

            // Find and click the trial modal confirm button
            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            await act(() => userEvent.click(confirmButton))

            expect(mockStartRevampTrial).toHaveBeenCalled()
        })

        it('shows loading state in trial modal when isTrialRevampLoading is true', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    isLoading: true,
                    isTrialModalOpen: true,
                }),
            )

            renderMiddleware()

            // The modal should show loading state
            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            expect(confirmButton).toBeDisabled()
        })
    })

    describe('Event Logging', () => {
        beforeEach(() => {
            // Set up conditions for upgrade paywall
            useAppSelectorMock.mockImplementation((selector) => {
                if (selector === getHasAutomate) return true
                if (selector === getCurrentUser) return fromJS(user)
                if (selector === getCurrentAccountState)
                    return fromJS({ domain: 'test', id: 'test-account' })
                if (selector === getCurrentAutomatePlan)
                    return { generation: 5 }
                return undefined
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )
            mockUseTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
                hasTrialExpired: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                canBookDemo: false,
            })
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
        })

        it('logs TrialLinkPaywallViewed and AiAgentShoppingAssistantTrialCtaDisplayed events when paywall with trial button is displayed', () => {
            renderMiddleware()

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent-shopping-assistant-trial-cta-displayed',
                {
                    accountId: 'test-account',
                    userId: user.id,
                    userRole: '',
                    type: 'sales-paywall',
                    storeName: 'test-shop',
                },
            )
            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-link-paywall-viewed',
                {
                    trialType: TrialType.ShoppingAssistant,
                },
            )
        })

        it('logs AiAgentShoppingAssistantStartTrialClicked event when start trial button is clicked', async () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: true,
                    isAdminUser: true,
                }),
            )

            renderMiddleware()

            const trialButton = screen.getByText(
                `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            )
            await act(() => userEvent.click(trialButton))

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent-shopping-assistant-start-trial-clicked',
                {
                    accountId: 'test-account',
                    userId: user.id,
                    userRole: '',
                    type: 'sales-paywall',
                    storeName: 'test-shop',
                },
            )
        })

        it('calls openTrialUpgradeModal when trial button is clicked with hasOptedOut and no active trial', async () => {
            const mockOpenTrialUpgradeModal = jest.fn()

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasOptedOut: true,
                    hasActiveTrial: false,
                    isAdminUser: true,
                }),
            )

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    openTrialUpgradeModal: mockOpenTrialUpgradeModal,
                }),
            )

            renderMiddleware()

            const trialButton = screen.getByText(
                `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            )
            await act(() => userEvent.click(trialButton))

            expect(mockOpenTrialUpgradeModal).toHaveBeenCalled()
        })

        it('calls openUpgradePlanModal when upgrade button is clicked with hasOptedOut and no active trial', async () => {
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    canSeeSubscribeNowCTA: true,
                    hasOptedOut: true,
                    hasActiveTrial: false,
                    isAdminUser: true,
                }),
            )

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    openUpgradePlanModal: mockOpenUpgradePlanModal,
                }),
            )

            const mockUpgradePlan = jest.fn()
            mockUseUpgradePlan.mockReturnValue({
                upgradePlanAsync: mockUpgradePlan,
                isLoading: false,
            })
            // Mock earlyAccessPlan to have value for Upgrade Now button to appear
            mockAiAgentUpgradePlan.mockReturnValue({
                data: {
                    id: 'early-access-123',
                    name: 'Early Access Plan',
                },
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            await act(() => userEvent.click(upgradeButton))

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('calls onUpgradeClick when upgrade button is clicked with active trial', async () => {
            const mockUpgradePlan = jest.fn().mockResolvedValue({})

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                    canStartTrial: false,
                    canSeeSubscribeNowCTA: true,
                    hasOptedOut: false,
                    hasAnyTrialOptedIn: true,
                    isAdminUser: true,
                }),
            )

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture(),
            )

            mockUseUpgradePlan.mockReturnValue({
                upgradePlanAsync: mockUpgradePlan,
                isLoading: false,
            })
            // Mock earlyAccessPlan to have value for Upgrade Now button to appear
            mockAiAgentUpgradePlan.mockReturnValue({
                data: {
                    id: 'early-access-123',
                    name: 'Early Access Plan',
                },
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            await act(() => userEvent.click(upgradeButton))

            // Wait for async call to complete
            await new Promise((resolve) => setTimeout(resolve, 0))

            expect(mockUpgradePlan).toHaveBeenCalled()
        })

        it('calls showEarlyAccessModal when upgrade button is clicked and revamp is disabled', async () => {
            const mockShowEarlyAccessModal = jest.fn()

            // Override the default mock for this test
            useActivationMock.mockReturnValue({
                earlyAccessModal: null,
                showEarlyAccessModal: mockShowEarlyAccessModal,
            })

            mockUseSalesTrialRevampMilestone.mockReturnValue('off')

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                    canStartTrial: false,
                    canSeeSubscribeNowCTA: true,
                    hasOptedOut: false,
                    hasActiveTrial: false,
                    isAdminUser: true,
                }),
            )
            // Mock earlyAccessPlan to have value for Upgrade Now button to appear
            mockAiAgentUpgradePlan.mockReturnValue({
                data: {
                    id: 'early-access-123',
                    name: 'Early Access Plan',
                },
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            await act(() => userEvent.click(upgradeButton))

            expect(mockShowEarlyAccessModal).toHaveBeenCalled()
        })

        it('does not log events when trial button is not displayed', () => {
            mockUseTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: false,
                hasTrialExpired: false,
            })

            renderMiddleware()

            expect(mockLogEvent).not.toHaveBeenCalledWith(
                'ai-agent-shopping-assistant-trial-cta-displayed',
                expect.any(Object),
            )
            expect(mockLogEvent).not.toHaveBeenCalledWith(
                'ai-agent/trial-link-paywall-viewed',
            )
        })

        it('should handle hasTrialExpired property correctly', () => {
            mockUseTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: false,
                hasTrialExpired: true,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                canBookDemo: false,
            })

            renderMiddleware()

            expect(
                screen.queryByTestId('mock-child-component'),
            ).not.toBeInTheDocument()
        })

        it('should show "Book a demo" link when canBookDemo is true', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: true,
                    isAdminUser: true,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            expect(screen.getByText('Book a demo')).toBeInTheDocument()
        })

        it('should not show "Book a demo" link when canBookDemo is false as a non-admin', async () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                    canNotifyAdmin: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: false,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            expect(screen.queryByText('Book a demo')).not.toBeInTheDocument()
        })

        it('should show "Notify Admin" link when user is not an admin', async () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                    canStartTrial: false,
                    canNotifyAdmin: true,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: true,
                    isAdminUser: false,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            const notifyAdminButton = screen.getByText('Notify admin')
            expect(notifyAdminButton).toBeInTheDocument()

            await act(() => userEvent.click(notifyAdminButton))
        })

        it('should disable the "Notify Admin" link when the user has sent a notification in the last day', () => {
            // Sales paywall middleware doesn't disable the button immediately, it needs to find
            // a notification sent by the current user within the last 24 hours, so mock it and rerender
            mockUseNotifyAdmins.mockReturnValue({ isDisabled: true })

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                    canStartTrial: false,
                    canNotifyAdmin: true,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: true,
                    isAdminUser: false,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            const adminNotifedButton = screen.getByRole('button', {
                name: 'Admin notified',
            })
            expect(adminNotifedButton).toBeInTheDocument()
            expect(adminNotifedButton).toBeAriaDisabled()
        })

        it('should open external URL when "Book a demo" primary button is clicked', async () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: true,
                    isAdminUser: true,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
                const flags = {
                    [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: true,
                    [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                }

                if (key in flags) {
                    return flags[key as keyof typeof flags]
                }

                return false
            })

            renderMiddleware()

            const bookDemoButton = screen.getByText('Book a demo')
            await act(() => userEvent.click(bookDemoButton))

            expect(mockWindowOpen).toHaveBeenCalledWith(
                expect.stringContaining('https://'),
                '_blank',
            )
        })

        it('should open external URL when "Book a demo" secondary button is clicked', async () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: true,
                    isAdminUser: true,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            const bookDemoButton = screen.getByText('Book a demo')
            await act(() => userEvent.click(bookDemoButton))

            expect(mockWindowOpen).toHaveBeenCalledWith(
                expect.stringContaining('https://'),
                '_blank',
            )
        })

        it('should show "Learn More" button when hasCurrentStoreTrialOptedOut is true', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: false,
                    hasCurrentStoreTrialOptedOut: true,
                    isAdminUser: true,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            expect(screen.getByText('Learn more')).toBeInTheDocument()
        })

        it('should open shopping assistant info URL when "Learn more" button is clicked', async () => {
            const mockWindowOpen = jest.fn()
            global.window.open = mockWindowOpen

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: false,
                    hasCurrentStoreTrialOptedOut: true,
                    isAdminUser: true,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            const learnMoreButton = screen.getByText('Learn more')
            expect(learnMoreButton).toHaveAttribute(
                'href',
                expect.stringContaining('https://'),
            )
        })

        it('should prioritize Book a demo link over other secondary buttons', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasCurrentStoreTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    canBookDemo: true,
                    isAdminUser: true,
                    hasCurrentStoreTrialOptedOut: true, // This should be ignored when canBookDemo is true
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            // Should show Book a demo, not the opted out button
            expect(screen.getByText('Book a demo')).toBeInTheDocument()
            expect(
                screen.queryByText('How shopping Assistants boosts sales'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Additional Coverage Tests', () => {
        it('should handle undefined shopName parameter', () => {
            const WrappedComponent = SalesPaywallMiddleware(MockChildComponent)
            const path = '/shops/ai-agent/sales'
            const initialRoute = '/shops/ai-agent/sales'

            renderWithStoreAndQueryClientAndRouter(
                <Switch>
                    <Route path={path} render={() => <WrappedComponent />} />
                </Switch>,
                {},
                { route: initialRoute, path },
            )

            // Should still render without crashing when shopName is undefined
            expect(screen.getByText(/Paywall View Mock/)).toBeInTheDocument()
        })

        it('should render TrialEndedModal when currentStore exists', () => {
            const mockStoreActivations = {
                'test-shop': {
                    name: 'test-shop',
                    configuration: {
                        sales: {
                            trial: {
                                startDatetime: '2023-11-01T00:00:00.000Z',
                                endDatetime: '2023-11-15T00:00:00.000Z',
                            },
                        },
                    },
                },
            }

            useStoreActivationsMock.mockReturnValue({
                storeActivations: mockStoreActivations,
            } as any)

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 6 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            // Verify that the component renders - we expect the child component to be shown
            expect(
                screen.getByTestId('mock-child-component'),
            ).toBeInTheDocument()
        })

        it('should call history.push when AIAgentTrialSuccessModal onClick is triggered', async () => {
            mockUseModalManager.mockReturnValue({
                isOpen: jest.fn().mockReturnValue(true), // Modal is open
                openModal: jest.fn(),
                closeModal: jest.fn(),
            })

            const mockRoutes = {
                customerEngagement: '/customer-engagement',
            }

            mockUseActivateAiAgentTrial.mockReturnValue({
                canStartTrial: false,
                routes: mockRoutes,
                startTrialDeprecated: jest.fn(),
                isLoading: false,
                canStartTrialFromFeatureFlag: false,
                shopName: 'test-shop',
            })

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 6 },
            })

            const { history } = renderMiddleware()

            // Find the navigate button in the AIAgentTrialSuccessModal
            const navigateButton = screen.getByText('Navigate')
            await act(() => userEvent.click(navigateButton))

            expect(history.location.pathname).toBe('/customer-engagement')
        })

        it('should call closeModal when AIAgentTrialSuccessModal onClose is triggered', async () => {
            const mockCloseModal = jest.fn()

            mockUseModalManager.mockReturnValue({
                isOpen: jest.fn().mockReturnValue(true), // Modal is open
                openModal: jest.fn(),
                closeModal: mockCloseModal,
            })

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 6 },
            })

            renderMiddleware()

            // Find the close button in the AIAgentTrialSuccessModal
            const closeButton = screen.getByText('Close')
            await act(() => userEvent.click(closeButton))

            expect(mockCloseModal).toHaveBeenCalled()
        })

        it('should handle onUpgradePlanClicked when revamp is enabled and has any trial opted in', async () => {
            const mockUpgradePlan = jest.fn()
            const mockCloseManageTrialModal = jest.fn()
            const mockCloseUpgradePlanModal = jest.fn()

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')

            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeSubscribeNowCTA: true,
                    canSeeTrialCTA: false,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasAnyTrialOptedIn: true,
                    isAdminUser: true,
                    trialType: TrialType.ShoppingAssistant,
                }),
            )

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    closeUpgradePlanModal: mockCloseUpgradePlanModal,
                    closeManageTrialModal: mockCloseManageTrialModal,
                }),
            )

            mockUseUpgradePlan.mockReturnValue({
                upgradePlanAsync: mockUpgradePlan.mockResolvedValue({}),
                isLoading: false,
            })

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )
            // Mock earlyAccessPlan to have value for Upgrade Now button to appear
            mockAiAgentUpgradePlan.mockReturnValue({
                data: {
                    id: 'early-access-123',
                    name: 'Early Access Plan',
                },
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            await act(() => userEvent.click(upgradeButton))

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/pricing-modal-clicked',
                { type: 'upgraded', trialType: TrialType.ShoppingAssistant },
            )
        })

        it('should handle start trial with hasAnyTrialOptedIn true', async () => {
            const mockStartRevampTrial = jest.fn()

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                    canStartTrial: false,
                    hasTrialExpired: false,
                    hasAnyTrialOptedIn: true,
                    isAdminUser: true,
                }),
            )

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    startTrialDeprecated: mockStartRevampTrial,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            const trialButton = screen.getByText(
                `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            )
            await act(() => userEvent.click(trialButton))

            expect(mockStartRevampTrial).toHaveBeenCalled()
        })

        it('should handle milestone-1 trial logic with active trial', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
            mockUseTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
                hasTrialExpired: false,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialOptedIn: false,
                canBookDemo: false,
            })

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            expect(
                screen.getByTestId('mock-child-component'),
            ).toBeInTheDocument()
        })

        it('should handle milestone-1 trial logic with expired trial', () => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
            mockUseTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
                hasTrialExpired: false,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: true,
                hasAnyTrialOptedIn: false,
                canBookDemo: false,
            })

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            renderMiddleware()

            expect(
                screen.queryByTestId('mock-child-component'),
            ).not.toBeInTheDocument()
        })

        it('should handle upgrade plan modal when no trial opted in', async () => {
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canSeeSubscribeNowCTA: true,
                canStartTrial: false,
                hasTrialExpired: false,
                hasAnyTrialOptedIn: false,
                isAdminUser: true,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    openUpgradePlanModal: mockOpenUpgradePlanModal,
                }),
            )

            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
            })

            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )
            // Mock earlyAccessPlan to have value for Upgrade Now button to appear
            mockAiAgentUpgradePlan.mockReturnValue({
                data: {
                    id: 'early-access-123',
                    name: 'Early Access Plan',
                },
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            await act(() => userEvent.click(upgradeButton))

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('should handle trial modal props with undefined shopName', () => {
            mockUseTrialModalProps.mockReturnValue({
                trialUpgradePlanModal: {
                    title: 'Try the full power of AI Agent for 14 days at no additional cost',
                    description: 'Test description',
                },
                trialActivatedModal: {
                    title: 'Shopping Assistant Activated',
                    description: 'Test description',
                },
                upgradePlanModal: {
                    title: 'Upgrade your plan',
                    description: 'Test description',
                },
            })

            const WrappedComponent = SalesPaywallMiddleware(MockChildComponent)
            const path = '/shops/ai-agent/sales'
            const initialRoute = '/shops/ai-agent/sales'

            renderWithStoreAndQueryClientAndRouter(
                <Switch>
                    <Route path={path} render={() => <WrappedComponent />} />
                </Switch>,
                {},
                { route: initialRoute, path },
            )

            expect(mockUseTrialModalProps).toHaveBeenCalledWith({
                storeName: undefined,
            })
        })
    })

    describe('CurrentStoreName and CurrentStoreHasActiveTrial Logic', () => {
        const renderMiddlewareWithCustomRoute = (
            route: string,
            path: string,
        ) => {
            const WrappedComponent = SalesPaywallMiddleware(MockChildComponent)

            return renderWithStoreAndQueryClientAndRouter(
                <Switch>
                    <Route path={path} render={() => <WrappedComponent />} />
                </Switch>,
                {},
                { route, path },
            )
        }

        describe('currentStoreName states', () => {
            it('should handle undefined shopName (global context)', () => {
                setupUseAppSelectorMock({
                    hasAutomate: true,
                    currentAutomatePlan: { generation: 6 },
                })
                mockUseFlag.mockImplementation(
                    (key) =>
                        key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                        false,
                )
                mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

                const { history } = renderMiddlewareWithCustomRoute(
                    '/shops/ai-agent/sales',
                    '/shops/ai-agent/sales',
                )

                expect(
                    screen.getByTestId('mock-child-component'),
                ).toBeInTheDocument()
                expect(history.location.pathname).toBe('/shops/ai-agent/sales')
            })

            it('should handle shopName exists but store not in storeActivations', () => {
                useStoreActivationsMock.mockReturnValue({
                    storeActivations: {}, // Empty - no store activations
                } as any)
                setupUseAppSelectorMock({
                    hasAutomate: true,
                    currentAutomatePlan: { generation: 6 },
                })
                mockUseFlag.mockImplementation(
                    (key) =>
                        key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                        false,
                )
                mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

                renderMiddleware()

                expect(
                    screen.getByTestId('mock-child-component'),
                ).toBeInTheDocument()
            })

            it('should handle both shopName and store configuration exist', () => {
                const mockStoreActivations = {
                    'test-shop': {
                        name: 'test-shop',
                        configuration: {
                            sales: {
                                isActive: true,
                            },
                        },
                    },
                }

                useStoreActivationsMock.mockReturnValue({
                    storeActivations: mockStoreActivations,
                } as any)
                setupUseAppSelectorMock({
                    hasAutomate: true,
                    currentAutomatePlan: { generation: 6 },
                })
                mockUseFlag.mockImplementation(
                    (key) =>
                        key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                        false,
                )
                mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

                renderMiddleware()

                expect(
                    screen.getByTestId('mock-child-component'),
                ).toBeInTheDocument()
            })
        })

        describe('currentStoreHasActiveTrial logic', () => {
            describe('store-specific context (with shopName)', () => {
                it('should show child component when store has active trial', () => {
                    setupUseAppSelectorMock({
                        hasAutomate: true,
                        currentAutomatePlan: { generation: 6 },
                    })
                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            hasCurrentStoreTrialStarted: true,
                            hasCurrentStoreTrialExpired: false,
                        }),
                    )

                    renderMiddleware()

                    expect(
                        screen.getByTestId('mock-child-component'),
                    ).toBeInTheDocument()
                    expect(
                        screen.queryByText(/Paywall View Mock/),
                    ).not.toBeInTheDocument()
                })

                it('should show paywall when store trial is expired', () => {
                    setupUseAppSelectorMock({
                        hasAutomate: true,
                        currentAutomatePlan: { generation: 5 },
                    })
                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            hasCurrentStoreTrialStarted: true,
                            hasCurrentStoreTrialExpired: true,
                        }),
                    )

                    renderMiddleware()

                    expect(
                        screen.queryByTestId('mock-child-component'),
                    ).not.toBeInTheDocument()
                    expect(
                        screen.getByText(/Paywall View Mock/),
                    ).toBeInTheDocument()
                })

                it('should show paywall when store trial has not started', () => {
                    setupUseAppSelectorMock({
                        hasAutomate: true,
                        currentAutomatePlan: { generation: 5 },
                    })
                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess(
                            createMockTrialAccess({
                                isAdminUser: true,
                            }),
                        ),
                    )

                    renderMiddleware()

                    expect(
                        screen.queryByTestId('mock-child-component'),
                    ).not.toBeInTheDocument()
                    expect(
                        screen.getByText(/Paywall View Mock/),
                    ).toBeInTheDocument()
                })

                it('should show Continue Setup action when onboarding wizard is in progress', async () => {
                    mockUseSalesTrialRevampMilestone.mockReturnValue(
                        'milestone-0',
                    )
                    mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                        storeConfiguration: {
                            wizard: {
                                completedDatetime: null,
                            },
                        },
                    })
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            canSeeTrialCTA: true,
                            canStartTrial: false,
                            hasTrialExpired: false,
                            hasAnyTrialOptedIn: true,
                            isAdminUser: true,
                            isTrialingSubscription: true,
                        }),
                    )

                    setupUseAppSelectorMock({
                        hasAutomate: true,
                        currentAutomatePlan: { generation: 5 },
                    })

                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )

                    renderMiddleware()

                    const setUpAIAgentButton =
                        screen.getByText('Continue Setup')
                    await act(() => userEvent.click(setUpAIAgentButton))
                })

                it("should show Set Up AI Agent action when onboarding wizard hasn't started", async () => {
                    mockUseSalesTrialRevampMilestone.mockReturnValue(
                        'milestone-0',
                    )
                    mockUseAiAgentOnboardingNotification.mockReturnValue({
                        onboardingNotificationState: {
                            finishAiAgentSetupNotificationReceivedDatetime:
                                null,
                        },
                        handleOnSave: jest.fn(),
                        handleOnSendOrCancelNotification: jest.fn(),
                        handleOnPerformActionPostReceivedNotification:
                            jest.fn(),
                    })
                    mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                        storeConfiguration: {
                            wizard: {
                                completedDatetime: new Date().toISOString(),
                            },
                        },
                    })
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            canSeeTrialCTA: true,
                            canStartTrial: false,
                            hasTrialExpired: false,
                            hasAnyTrialOptedIn: true,
                            isAdminUser: true,
                            isTrialingSubscription: true,
                        }),
                    )

                    setupUseAppSelectorMock({
                        hasAutomate: true,
                        currentAutomatePlan: { generation: 5 },
                    })

                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )

                    renderMiddleware()

                    const setUpAIAgentButton =
                        screen.getByText('Set Up AI Agent')
                    await act(() => userEvent.click(setUpAIAgentButton))
                })
            })

            describe('global context (no shopName)', () => {
                it('should show child component when any trial is active', () => {
                    setupUseAppSelectorMock({
                        hasAutomate: true,
                        currentAutomatePlan: { generation: 6 },
                    })
                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            hasAnyTrialActive: true,
                        }),
                    )

                    const { history } = renderMiddlewareWithCustomRoute(
                        '/shops/ai-agent/sales',
                        '/shops/ai-agent/sales',
                    )

                    expect(
                        screen.getByTestId('mock-child-component'),
                    ).toBeInTheDocument()
                    expect(
                        screen.queryByText(/Paywall View Mock/),
                    ).not.toBeInTheDocument()
                    expect(history.location.pathname).toBe(
                        '/shops/ai-agent/sales',
                    )
                })

                it('should show child component when shopName is undefined and hasAnyTrialActive is true', () => {
                    setupUseAppSelectorMock({
                        hasAutomate: false, // No automate plan
                        currentAutomatePlan: { generation: 5 },
                    })
                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            hasAnyTrialActive: true, // Has any trial active
                            isLoading: false,
                        }),
                    )

                    const { history } = renderMiddlewareWithCustomRoute(
                        '/shops/ai-agent/sales',
                        '/shops/ai-agent/sales',
                    )

                    expect(
                        screen.getByTestId('mock-child-component'),
                    ).toBeInTheDocument()
                    expect(
                        screen.queryByText(/Layout Mock/),
                    ).not.toBeInTheDocument()
                    expect(history.location.pathname).toBe(
                        '/shops/ai-agent/sales',
                    )
                })

                it('should show TrialPaywallMiddleware when shopName is undefined and hasAnyTrialActive is false', () => {
                    setupUseAppSelectorMock({
                        hasAutomate: false, // No automate plan
                        currentAutomatePlan: { generation: 5 },
                    })
                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            hasAnyTrialActive: false, // No active trials
                            isLoading: false,
                        }),
                    )

                    const { history } = renderMiddlewareWithCustomRoute(
                        '/shops/ai-agent/sales',
                        '/shops/ai-agent/sales',
                    )

                    expect(
                        screen.queryByTestId('mock-child-component'),
                    ).not.toBeInTheDocument()
                    expect(screen.getByText(/Layout Mock/)).toBeInTheDocument()
                    expect(history.location.pathname).toBe(
                        '/shops/ai-agent/sales',
                    )
                })

                it('should show paywall when no trials are active', () => {
                    setupUseAppSelectorMock({
                        hasAutomate: true,
                        currentAutomatePlan: { generation: 5 },
                    })
                    mockUseFlag.mockImplementation(
                        (key) =>
                            key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                            false,
                    )
                    mockUseTrialAccess.mockReturnValue(
                        createMockTrialAccess({
                            isAdminUser: true,
                        }),
                    )

                    const { history } = renderMiddlewareWithCustomRoute(
                        '/shops/ai-agent/sales',
                        '/shops/ai-agent/sales',
                    )

                    expect(
                        screen.queryByTestId('mock-child-component'),
                    ).not.toBeInTheDocument()
                    expect(
                        screen.getByText(/Paywall View Mock/),
                    ).toBeInTheDocument()
                    expect(history.location.pathname).toBe(
                        '/shops/ai-agent/sales',
                    )
                })
            })
        })
    })
})
