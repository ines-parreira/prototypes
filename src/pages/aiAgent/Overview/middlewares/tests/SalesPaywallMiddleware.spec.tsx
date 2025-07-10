import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Route, Switch } from 'react-router-dom'

import { logEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { user } from 'fixtures/users'
import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from 'pages/aiAgent/hooks/useTrialEligibility'
// Import mocks
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

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

jest.mock('pages/aiAgent/hooks/useTrialEligibility')
const useTrialEligibilityMock = assumeMock(useTrialEligibility)
const useTrialEligibilityForManualActivationFromFeatureFlagMock = assumeMock(
    useTrialEligibilityForManualActivationFromFeatureFlag,
)

jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
jest.mock('launchdarkly-react-client-sdk')
jest.mock('core/flags')
jest.mock('pages/aiAgent/Activation/hooks/useActivateAiAgentTrial')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')
jest.mock('common/segment')
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
const useAppSelectorMock = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>

const mockUseSalesTrialRevampMilestone =
    useSalesTrialRevampMilestone as jest.Mock
const mockUseShoppingAssistantTrialAccess =
    useShoppingAssistantTrialAccess as jest.Mock
const mockUseFlag = useFlag as jest.Mock
const mockUseFlags = useFlags as jest.Mock
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
        mockUseShoppingAssistantTrialFlow.mockReturnValue({
            startTrial: jest.fn(),
            isLoading: false,
            isTrialModalOpen: false,
            isSuccessModalOpen: false,
            closeTrialUpgradeModal: jest.fn(),
            closeSuccessModal: jest.fn(),
            openTrialUpgradeModal: jest.fn(),
            openUpgradePlanModal: jest.fn(),
            closeUpgradePlanModal: jest.fn(),
            closeManageTrialModal: jest.fn(),
            isUpgradePlanModalOpen: false,
            onDismissTrialUpgradeModal: jest.fn(),
            onDismissUpgradePlanModal: jest.fn(),
        })
        mockUseTrialModalProps.mockReturnValue({
            trialUpgradePlanModal: {
                title: 'Try Shopping Assistant for 14 days at no additional cost',
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
            upgradePlan: jest.fn(),
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
    })
    it('should render automate paywall when it doesnt has automate', () => {
        setupUseAppSelectorMock({ hasAutomate: false })

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
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
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

        it('should render the child component when it has automate + alpha/demo user', () => {
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: true,
                [FeatureFlagKey.AiSalesAgentBeta]: false,
            })
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
        it('should render waitlist paywall when it has automate + beta user not on generation 6 plan', () => {
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
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
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
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
        // Mock the milestone to 'off' to use original logic
        mockUseSalesTrialRevampMilestone.mockReturnValue('off')
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
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
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
        // Mock the milestone to 'off' to use original logic
        mockUseSalesTrialRevampMilestone.mockReturnValue('off')
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
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 5 },
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
        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
            [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: true,
            [FeatureFlagKey.AiSalesAgentBeta]: false,
        })
        setupUseAppSelectorMock({
            hasAutomate: true,
            currentAutomatePlan: { generation: 6 },
        })

        renderMiddleware()
        expect(screen.getByTestId('mock-child-component')).toBeInTheDocument()
        expect(screen.queryByText(/Layout Mock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Paywall View Mock/)).not.toBeInTheDocument()
    })

    it.each([{ generation: 5 }, { generation: 6 }])(
        'should render waitlist paywall when it has automate + any generation plan and not part of demo/alpha/beta',
        ({ generation }) => {
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation },
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
            // Mock the milestone to 'milestone-0' (equivalent to true)
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            // canSeeTrialCTA controls the button
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
            })
            // Set up other mocks to hit the upgrade paywall
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
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
            // Mock the milestone to 'milestone-0' (equivalent to true)
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: false,
            })
            // Set up other mocks to hit the upgrade paywall
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
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
            // Mock the milestone to 'milestone-0' (equivalent to true)
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
            })

            const mockOpenTrialUpgradeModal = jest.fn()
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: mockOpenTrialUpgradeModal,
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            // Set up other mocks to hit the upgrade paywall
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
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

            // Verify that the openTrialUpgradeModal function was called
            expect(mockOpenTrialUpgradeModal).toHaveBeenCalled()
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
            setupUseAppSelectorMock({
                hasAutomate: true,
                currentAutomatePlan: { generation: 5 },
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
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-0')
        })

        it('renders UpgradePlanModal when isUpgradePlanModalOpen is true', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: true,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            renderMiddleware()

            expect(screen.getByText('Upgrade your plan')).toBeInTheDocument()
        })

        it('renders trial upgrade modal when isTrialModalOpen is true', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: true,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            renderMiddleware()

            expect(
                screen.getByText(
                    'Try Shopping Assistant for 14 days at no additional cost',
                ),
            ).toBeInTheDocument()
        })

        it('renders success modal when isSuccessModalOpen is true', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: true,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            renderMiddleware()

            expect(
                screen.getByText('Shopping Assistant Activated'),
            ).toBeInTheDocument()
        })

        it('calls onUpgradeClick with correct event logging when upgrade plan modal confirm is clicked', () => {
            const mockUpgradePlan = jest.fn()
            const mockCloseManageTrialModal = jest.fn()

            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: mockUpgradePlan,
                isLoading: false,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: mockCloseManageTrialModal,
                isUpgradePlanModalOpen: true,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            renderMiddleware()

            // Find and click the upgrade plan modal confirm button
            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            fireEvent.click(confirmButton)

            // Verify the segment event was logged
            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/pricing-modal-clicked',
                {
                    type: 'upgraded',
                },
            )

            // Verify upgradePlan was called
            expect(mockUpgradePlan).toHaveBeenCalled()

            // Verify closeManageTrialModal was called
            expect(mockCloseManageTrialModal).toHaveBeenCalled()
        })

        it('shows loading state in upgrade plan modal when isUpgradePlanLoading is true', () => {
            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: jest.fn(),
                isLoading: true,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: true,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            renderMiddleware()

            // The modal should show loading state
            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            expect(confirmButton).toBeDisabled()
        })

        it('calls startRevampTrial when trial upgrade modal confirm is clicked', () => {
            const mockStartRevampTrial = jest.fn()

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: mockStartRevampTrial,
                isLoading: false,
                isTrialModalOpen: true,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            renderMiddleware()

            // Find and click the trial modal confirm button
            const confirmButton = screen.getByRole('button', {
                name: /confirm/i,
            })
            fireEvent.click(confirmButton)

            expect(mockStartRevampTrial).toHaveBeenCalled()
        })

        it('shows loading state in trial modal when isTrialRevampLoading is true', () => {
            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: true,
                isTrialModalOpen: true,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

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
            mockFlags({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiSalesAgentBypassPlanCheck]: false,
                [FeatureFlagKey.AiSalesAgentBeta]: true,
            })
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
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
            )
        })

        it('logs AiAgentShoppingAssistantStartTrialClicked event when start trial button is clicked', () => {
            renderMiddleware()

            const trialButton = screen.getByText(
                'Start 14-Day Trial At No Additional Cost',
            )
            fireEvent.click(trialButton)

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

        it('calls openTrialUpgradeModal when trial button is clicked with hasOptedOut and no active trial', () => {
            const mockOpenTrialUpgradeModal = jest.fn()

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
                hasOptedOut: true,
                hasActiveTrial: false,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: mockOpenTrialUpgradeModal,
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            renderMiddleware()

            const trialButton = screen.getByText(
                'Start 14-Day Trial At No Additional Cost',
            )
            fireEvent.click(trialButton)

            expect(mockOpenTrialUpgradeModal).toHaveBeenCalled()
        })

        it('calls openUpgradePlanModal when upgrade button is clicked with hasOptedOut and no active trial', () => {
            const mockOpenUpgradePlanModal = jest.fn()

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
                hasOptedOut: true,
                hasActiveTrial: false,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: mockOpenUpgradePlanModal,
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            const mockUpgradePlan = jest.fn()
            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: mockUpgradePlan,
                isLoading: false,
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            fireEvent.click(upgradeButton)

            expect(mockOpenUpgradePlanModal).toHaveBeenCalled()
        })

        it('calls onUpgradeClick when upgrade button is clicked with active trial', () => {
            const mockUpgradePlan = jest.fn()

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
                canStartTrial: false,
                hasOptedOut: false,
                hasActiveTrial: true,
            })

            mockUseShoppingAssistantTrialFlow.mockReturnValue({
                startTrial: jest.fn(),
                isLoading: false,
                isTrialModalOpen: false,
                isSuccessModalOpen: false,
                closeTrialUpgradeModal: jest.fn(),
                closeSuccessModal: jest.fn(),
                openTrialUpgradeModal: jest.fn(),
                openUpgradePlanModal: jest.fn(),
                closeUpgradePlanModal: jest.fn(),
                closeManageTrialModal: jest.fn(),
                isUpgradePlanModalOpen: false,
                onDismissTrialUpgradeModal: jest.fn(),
                onDismissUpgradePlanModal: jest.fn(),
            })

            mockUseUpgradePlan.mockReturnValue({
                upgradePlan: mockUpgradePlan,
                isLoading: false,
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            fireEvent.click(upgradeButton)

            expect(mockUpgradePlan).toHaveBeenCalled()
        })

        it('calls showEarlyAccessModal when upgrade button is clicked and revamp is disabled', () => {
            const mockShowEarlyAccessModal = jest.fn()

            // Override the default mock for this test
            useActivationMock.mockReturnValue({
                earlyAccessModal: null,
                showEarlyAccessModal: mockShowEarlyAccessModal,
            })

            mockUseSalesTrialRevampMilestone.mockReturnValue('off')

            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: false,
                hasOptedOut: false,
                hasActiveTrial: false,
            })

            renderMiddleware()

            const upgradeButton = screen.getByText('Upgrade Now')
            fireEvent.click(upgradeButton)

            expect(mockShowEarlyAccessModal).toHaveBeenCalled()
        })

        it('does not log events when trial button is not displayed', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
                canStartTrial: false,
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
    })
})
