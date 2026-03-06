import { logEvent, SegmentEvent } from '@repo/logging'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { History } from 'history'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { shopifyIntegration } from 'fixtures/integrations'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import type { AiAgentWelcomePageProps } from '../AIAgentWelcomePageView/AIAgentWelcomePageView'
import { AIAgentWelcomePageView } from '../AIAgentWelcomePageView/AIAgentWelcomePageView'

const MOCK_WIZARD_VALUES = {
    wizard: {
        id: 1,
        stepName: AiAgentOnboardingWizardStep.Personalize,
        completedDatetime: null,
        stepData: {
            enabledChannels: [],
            isAutoresponderTurnedOff: null,
            onCompletePathway: null,
        },
    },
}

const SHOP_NAME = 'my-store'
const SHOP_TYPE = 'shopify'

const DEFAULT_TRIAL_ACCESS_MOCK = {
    hasAnyTrialStarted: false,
    hasAnyTrialActive: false,
    hasAnyTrialExpired: false,
    hasAnyTrialOptedIn: false,
    hasAnyTrialOptedOut: false,
    canSeeTrialCTA: false,
    isAdminUser: false,
    canBookDemo: false,
    canNotifyAdmin: false,
    hasCurrentStoreTrialStarted: false,
    hasCurrentStoreTrialExpired: false,
    currentAutomatePlan: { generation: 6 },
    trialType: TrialType.AiAgent,
    isOnboarded: false,
}

jest.mock('../../hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(() => ({
        isAdmin: true,
        isLoading: false,
        onboardingNotificationState: undefined,
        handleOnSave: jest.fn(),
        handleOnSendOrCancelNotification: jest.fn(),
        handleOnEnablementPostReceivedNotification: jest.fn(),
        handleOnPerformActionPostReceivedNotification: jest.fn(),
        isAiAgentOnboardingNotificationEnabled: true,
    })),
}))

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentWelcomePageViewed: 'ai-agent-welcome-page-viewed',
        AiAgentWelcomePageCtaClicked: 'ai-agent-welcome-page-cta-clicked',
    },
}))

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess', () => ({
    useTrialAccess: jest.fn(),
}))
const mockUseTrialAccess = require('pages/aiAgent/trial/hooks/useTrialAccess')
    .useTrialAccess as jest.MockedFunction<any>

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState', () => ({
    useAiAgentOnboardingState: jest.fn(),
    OnboardingState: {
        Loading: 'loading',
        OnboardingWizard: 'onboardingWizard',
        Onboarded: 'onboarded',
    },
}))
const mockUseAiAgentOnboardingState =
    require('pages/aiAgent/hooks/useAiAgentOnboardingState')
        .useAiAgentOnboardingState as jest.MockedFunction<any>

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: jest.fn(),
}))
const mockUseStoreActivations =
    require('pages/aiAgent/Activation/hooks/useStoreActivations')
        .useStoreActivations as jest.MockedFunction<any>

jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps', () => ({
    useTrialModalProps: jest.fn(),
    EXTERNAL_URLS: {},
}))
const mockUseTrialModalProps =
    require('pages/aiAgent/trial/hooks/useTrialModalProps')
        .useTrialModalProps as jest.MockedFunction<any>

jest.mock('../ShoppingAssistant/utils/eventLogger', () => ({
    logInTrialEventFromPaywall: jest.fn(),
}))

jest.mock('pages/common/components/TrialTryModal/TrialTryModal', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}))

jest.mock(
    'pages/common/components/RequestTrialModal/RequestTrialModal',
    () => ({
        __esModule: true,
        default: jest.fn(() => null),
    }),
)

jest.mock(
    'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal',
    () => ({
        __esModule: true,
        default: jest.fn(() => null),
    }),
)

jest.mock(
    'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal',
    () => ({
        __esModule: true,
        default: jest.fn(() => null),
        UpgradePlanModal: jest.fn(() => null),
    }),
)
const mockUpgradePlanModal =
    require('pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal')
        .UpgradePlanModal as jest.Mock

// Mock window.open
Object.defineProperty(window, 'open', {
    value: jest.fn(),
    writable: true,
})

jest.mock('pages/aiAgent/utils/extractShopNameFromUrl', () => ({
    extractShopNameFromUrl: jest.fn(),
}))
const mockExtractShopNameFromUrl =
    require('pages/aiAgent/utils/extractShopNameFromUrl')
        .extractShopNameFromUrl as jest.MockedFunction<any>

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow', () => ({
    useShoppingAssistantTrialFlow: jest.fn(),
}))
const mockUseShoppingAssistantTrialFlow =
    require('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
        .useShoppingAssistantTrialFlow as jest.MockedFunction<any>

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const defaultProps = {
    accountDomain: 'my-account-domain',
    shopType: 'shopify',
    shopName: 'my-store',
    state: 'loading',
}
const renderWithProvider = (
    props: Partial<AiAgentWelcomePageProps> = defaultProps,
    history?: History,
) => {
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <AIAgentWelcomePageView {...defaultProps} {...props} />
            </Provider>
        </QueryClientProvider>,
        { history },
    )
}

describe('<AIAgentWelcomePageView />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()

        mockUseTrialAccess.mockReturnValue(DEFAULT_TRIAL_ACCESS_MOCK)

        mockUseAiAgentOnboardingState.mockReturnValue('onboarded')

        mockUseStoreActivations.mockReturnValue({
            storeActivations: [],
            allStoreActivations: {},
        })

        mockUseTrialModalProps.mockReturnValue({
            newTrialUpgradePlanModal: { isOpen: false },
            trialRequestModal: { isOpen: false },
            trialFinishSetupModal: {},
            upgradePlanModal: { isOpen: false },
        })

        mockExtractShopNameFromUrl.mockReturnValue(SHOP_NAME)

        mockUseShoppingAssistantTrialFlow.mockReturnValue(
            getUseShoppingAssistantTrialFlowFixture(),
        )
    })

    const assertButtonAndLearnMore = () => {
        expect(
            screen.getByText('Set Up AI Agent', {
                selector: 'button span',
            }),
        ).toBeInTheDocument()
    }

    it('should render static state correctly', () => {
        renderWithProvider()

        expect(
            screen.getByText(
                /Introducing AI Agent with Shopping Assistant: Your new team member that drives sales and automates support in 1:1 conversations./,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Leads customers to fast resolutions in seconds, not hours./,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Enhances team productivity, reducing workload & response times by automating up to 60% of your tickets./,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Offers tailored discounts and product recommendations to drive personalized shopping experiences./,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText(/AI Agent Skills/)).toBeInTheDocument()

        assertButtonAndLearnMore()

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            { version: 'Basic', store: 'my-store' },
        )
    })

    it('should redirect to AiAgentOnboardingWizard page when Set up AI Agent button is clicked', async () => {
        const user = userEvent.setup()
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await act(() => user.click(button))

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: '',
        })
    })

    it('should redirect to AiAgentOnboardingWizard page when Set up AI Agent button is clicked with the skillset step skipped', async () => {
        const user = userEvent.setup()
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await act(() => user.click(button))

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: '',
        })
    })

    it('should redirect to AiAgentOnboardingWizard page with search params when Continue Set Up button is clicked', async () => {
        const user = userEvent.setup()
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithProvider(
            {
                storeConfiguration:
                    getStoreConfigurationFixture(MOCK_WIZARD_VALUES),
            },
            history,
        )

        const button = screen.getByRole('button', {
            name: /Continue Setup/i,
        })

        await act(() => user.click(button))

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: `?${WIZARD_UPDATE_QUERY_KEY}=true`,
        })
    })

    it('should redirect to the new onboarding page without search params when Continue Set Up button is clicked', async () => {
        const user = userEvent.setup()
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await act(() => user.click(button))

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: '',
        })
    })

    it('should redirect to the new onboarding page without search params when Continue Set Up button is clicked and the skillset step is skipped', async () => {
        const user = userEvent.setup()
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await act(() => user.click(button))

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: '',
        })
    })

    it('should render dynamic state for Onboarding Wizard update when storeConfiguration exists', () => {
        renderWithProvider({
            storeConfiguration:
                getStoreConfigurationFixture(MOCK_WIZARD_VALUES),
        })

        expect(
            screen.getByRole('button', {
                name: /Continue Setup/i,
            }),
        ).toBeInTheDocument()
    })

    describe('Automatic onboarding wizard navigation for trial users', () => {
        it('should redirect when all conditions are met', () => {
            const history = createMemoryHistory()
            const historyPushSpy = jest.spyOn(history, 'push')

            mockUseAiAgentOnboardingState.mockReturnValue('onboardingWizard')
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                isInAiAgentTrial: true,
            })

            renderWithProvider({}, history)

            expect(historyPushSpy).toHaveBeenCalledWith({
                pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
                search: '',
            })
        })

        it('should NOT redirect when onboarding state is Loading', () => {
            const history = createMemoryHistory()
            const historyPushSpy = jest.spyOn(history, 'push')

            mockUseAiAgentOnboardingState.mockReturnValue('loading')
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                isInAiAgentTrial: true,
            })

            renderWithProvider({}, history)

            expect(historyPushSpy).not.toHaveBeenCalled()
        })

        it('should NOT redirect when already onboarded', () => {
            const history = createMemoryHistory()
            const historyPushSpy = jest.spyOn(history, 'push')

            mockUseAiAgentOnboardingState.mockReturnValue('onboarded')
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                isInAiAgentTrial: true,
            })

            renderWithProvider({}, history)

            expect(historyPushSpy).not.toHaveBeenCalled()
        })

        it('should NOT redirect for ShoppingAssistant trial type', () => {
            const history = createMemoryHistory()
            const historyPushSpy = jest.spyOn(history, 'push')

            mockUseAiAgentOnboardingState.mockReturnValue('onboardingWizard')
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                isInAiAgentTrial: false,
            })

            renderWithProvider({}, history)

            expect(historyPushSpy).not.toHaveBeenCalled()
        })

        it('should NOT redirect when trial has not started', () => {
            const history = createMemoryHistory()
            const historyPushSpy = jest.spyOn(history, 'push')

            mockUseAiAgentOnboardingState.mockReturnValue('onboardingWizard')
            mockUseTrialAccess.mockReturnValue(DEFAULT_TRIAL_ACCESS_MOCK)

            renderWithProvider({}, history)

            expect(historyPushSpy).not.toHaveBeenCalled()
        })

        it('should NOT redirect when not on store page', () => {
            const history = createMemoryHistory()
            const historyPushSpy = jest.spyOn(history, 'push')

            mockUseAiAgentOnboardingState.mockReturnValue('onboardingWizard')
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                isInAiAgentTrial: true,
            })
            mockExtractShopNameFromUrl.mockReturnValue('different-store')

            renderWithProvider({}, history)

            expect(historyPushSpy).not.toHaveBeenCalled()
        })

        it('should NOT redirect when trial finish setup modal is open', () => {
            const history = createMemoryHistory()
            const historyPushSpy = jest.spyOn(history, 'push')

            mockUseAiAgentOnboardingState.mockReturnValue('onboardingWizard')
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                isInAiAgentTrial: true,
            })
            mockUseShoppingAssistantTrialFlow.mockReturnValue(
                getUseShoppingAssistantTrialFlowFixture({
                    isTrialFinishSetupModalOpen: true,
                }),
            )

            renderWithProvider({}, history)

            expect(historyPushSpy).not.toHaveBeenCalled()
        })
    })

    describe('CTA button display based on trial and onboarding state', () => {
        it('should show "Set Up AI Agent" CTA when trial expired and not onboarded', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                hasCurrentStoreTrialExpired: true,
                isOnboarded: false,
            })

            renderWithProvider()

            expect(
                screen.getByText('Set Up AI Agent', {
                    selector: 'button span',
                }),
            ).toBeInTheDocument()
        })

        it('should show a book a demo CTA', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: undefined,
                isOnboarded: false,
                canBookDemo: true,
                isAdminUser: true,
            })

            renderWithProvider()

            expect(
                screen.getByRole('button', {
                    name: 'Book a demo',
                }),
            ).toBeInTheDocument()
        })

        it('should show trial CTA when has old Automate plan (gen 5) and not onboarded', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 5 },
                isOnboarded: false,
                canSeeTrialCTA: true,
                isAdminUser: true,
            })

            renderWithProvider()

            expect(
                screen.getByRole('button', {
                    name: /Try for 14 days/i,
                }),
            ).toBeInTheDocument()

            expect(
                screen.queryByText('Set Up AI Agent', {
                    selector: 'button span',
                }),
            ).not.toBeInTheDocument()
        })

        it('should NOT show "Set Up AI Agent" CTA when trial expired but already onboarded (with old generation Automate plan)', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                hasCurrentStoreTrialExpired: true,
                isOnboarded: true,
                currentAutomatePlan: { generation: 5 },
            })

            renderWithProvider()

            expect(
                screen.queryByText('Set Up AI Agent', {
                    selector: 'button span',
                }),
            ).not.toBeInTheDocument()
        })

        it('should NOT show "Set Up AI Agent" CTA when no qualifying conditions are met (no trial, onboarded, old plan)', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                hasCurrentStoreTrialExpired: false,
                isOnboarded: true,
                currentAutomatePlan: { generation: 5 },
            })

            renderWithProvider()

            expect(
                screen.queryByText('Set Up AI Agent', {
                    selector: 'button span',
                }),
            ).not.toBeInTheDocument()
        })

        it('should show "Set Up AI Agent" CTA when has Automate plan generation 6+', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 6 },
                isOnboarded: false,
            })

            renderWithProvider()

            expect(
                screen.getByText('Set Up AI Agent', {
                    selector: 'button span',
                }),
            ).toBeInTheDocument()
        })

        it('should show "Set Up AI Agent" CTA when trial expired and not onboarded (even with old plan)', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 5 },
                hasCurrentStoreTrialExpired: true,
                isOnboarded: false,
            })

            renderWithProvider()

            expect(
                screen.getByText('Set Up AI Agent', {
                    selector: 'button span',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('canStartOnboarding calculation', () => {
        it('should allow onboarding when trial expired is the only qualifying condition', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                hasCurrentStoreTrialExpired: true,
                isTrialingSubscription: false,
                currentAutomatePlan: { generation: 6 },
                isOnboarded: false,
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            expect(
                screen.getByText('Set Up AI Agent', {
                    selector: 'button span',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('Trial CTA visibility based on onboarding status', () => {
        it('should show trial CTA when Shopping Assistant user has NOT onboarded AI Agent for current store', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 5 },
                isOnboarded: false,
                canSeeTrialCTA: true,
                isAdminUser: true,
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            expect(
                screen.getByRole('button', {
                    name: /Try for 14 days/i,
                }),
            ).toBeInTheDocument()
        })

        it('should NOT show trial CTA when Shopping Assistant user HAS onboarded AI Agent for current store', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 5 },
                isOnboarded: true,
                canSeeTrialCTA: false, // Should be false when onboarded
                isAdminUser: true,
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            expect(
                screen.queryByRole('button', {
                    name: /Try for 14 days/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('should show "Start AI Agent only" when has Automate but AI Agent not onboarded for current store', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 5 },
                isOnboarded: false,
                canSeeTrialCTA: false, // No trial CTA
                canSeeSubscribeNowCTA: false,
                canBookDemo: false,
                isAdminUser: true,
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            // Should show "Start AI Agent only" as tertiary CTA
            expect(screen.getByText(/Start AI Agent only/i)).toBeInTheDocument()
        })

        it('should NOT show "Start AI Agent only" when has Automate and AI Agent IS onboarded for current store', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 5 },
                isOnboarded: true, // Already onboarded
                canSeeTrialCTA: false, // No trial CTA
                canSeeSubscribeNowCTA: false,
                canBookDemo: false,
                isAdminUser: true,
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            // Should NOT show "Start AI Agent only" when already onboarded
            expect(
                screen.queryByText(/Start AI Agent only/i),
            ).not.toBeInTheDocument()
            // Should also NOT show trial CTA
            expect(
                screen.queryByRole('button', {
                    name: /Try for 14 days/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('should show "Learn more" for Enterprise Admin Shopping Assistant when onboarded', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 5 },
                isOnboarded: true, // Already onboarded
                canSeeTrialCTA: false, // No trial CTA because onboarded
                canSeeSubscribeNowCTA: false,
                canBookDemo: true, // Enterprise tier can book demo
                isAdminUser: true,
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            // Should show "Book a demo" as primary CTA for Enterprise tier
            expect(
                screen.getByRole('button', {
                    name: /Book a demo/i,
                }),
            ).toBeInTheDocument()

            // Should show "Learn more" as secondary CTA
            expect(screen.getByText(/Learn more/i)).toBeInTheDocument()

            // Should NOT show trial CTA
            expect(
                screen.queryByRole('button', {
                    name: /Try for 14 days/i,
                }),
            ).not.toBeInTheDocument()

            // Should NOT show "Start AI Agent only"
            expect(
                screen.queryByText(/Start AI Agent only/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('Paywall type selection based on trial conditions', () => {
        it('should display AI Agent logo when in AI Agent trial', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                trialType: TrialType.AiAgent,
            })

            renderWithProvider()

            expect(screen.getByAltText('AI Agent Logo')).toBeInTheDocument()
            expect(
                screen.queryByAltText('Shopping Assistant Logo'),
            ).not.toBeInTheDocument()
        })

        it('should display AI Agent logo when has Automate plan generation 6+', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                currentAutomatePlan: { generation: 6 },
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            expect(screen.getByAltText('AI Agent Logo')).toBeInTheDocument()
            expect(
                screen.queryByAltText('Shopping Assistant Logo'),
            ).not.toBeInTheDocument()
        })

        it('should display AI Agent logo when trial expired and not onboarded', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                hasCurrentStoreTrialExpired: true,
                isOnboarded: false,
                currentAutomatePlan: { generation: 5 },
                trialType: TrialType.ShoppingAssistant,
            })

            renderWithProvider()

            expect(screen.getByAltText('AI Agent Logo')).toBeInTheDocument()
            expect(
                screen.queryByAltText('Shopping Assistant Logo'),
            ).not.toBeInTheDocument()
        })

        it('should display Shopping Assistant logo when neither AI Agent trial nor new Automate plan', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                trialType: TrialType.ShoppingAssistant,
                currentAutomatePlan: { generation: 5 },
                hasCurrentStoreTrialExpired: false,
                isOnboarded: true,
            })

            renderWithProvider()

            expect(
                screen.getByAltText('Shopping Assistant Logo'),
            ).toBeInTheDocument()
            expect(
                screen.queryByAltText('AI Agent Logo'),
            ).not.toBeInTheDocument()
        })

        it('should display Shopping Assistant logo when onboarded with old Automate plan', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                trialType: TrialType.ShoppingAssistant,
                currentAutomatePlan: { generation: 5 },
                isOnboarded: true,
            })

            renderWithProvider()

            expect(
                screen.getByAltText('Shopping Assistant Logo'),
            ).toBeInTheDocument()
            expect(
                screen.queryByAltText('AI Agent Logo'),
            ).not.toBeInTheDocument()
        })

        it('should display AI Agent logo when canStartOnboarding is true via isTrialingSubscription with ShoppingAssistant trial', () => {
            mockUseTrialAccess.mockReturnValue({
                ...DEFAULT_TRIAL_ACCESS_MOCK,
                isTrialingSubscription: true,
                isOnboarded: false,
                trialType: TrialType.ShoppingAssistant,
                currentAutomatePlan: { generation: 6 },
            })

            renderWithProvider()

            expect(screen.getByAltText('AI Agent Logo')).toBeInTheDocument()
            expect(
                screen.queryByAltText('Shopping Assistant Logo'),
            ).not.toBeInTheDocument()
        })
    })

    it('renders UpgradePlanModal when upgradePlanModal.isOpen is true and passes props', () => {
        mockUpgradePlanModal.mockClear()

        mockUseTrialModalProps.mockReturnValue({
            newTrialUpgradePlanModal: { isOpen: false },
            trialRequestModal: { isOpen: false },
            trialFinishSetupModal: {},
            upgradePlanModal: { isOpen: true, someModalProp: 'value' },
        })

        renderWithProvider()

        expect(mockUpgradePlanModal).toHaveBeenCalled()
        const passedProps = mockUpgradePlanModal.mock.calls[0][0]
        expect(passedProps.isOpen).toBe(true)
        expect(passedProps.someModalProp).toBe('value')
    })
})
