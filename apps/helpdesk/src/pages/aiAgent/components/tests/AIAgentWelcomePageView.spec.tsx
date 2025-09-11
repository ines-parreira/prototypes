import { FeatureFlagKey } from '@repo/feature-flags'
import { userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { createMemoryHistory, History } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { shopifyIntegration } from 'fixtures/integrations'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import {
    AiAgentWelcomePageProps,
    AIAgentWelcomePageView,
} from '../AIAgentWelcomePageView/AIAgentWelcomePageView'

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
    currentAutomatePlan: null,
    trialType: TrialType.AiAgent,
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

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentWelcomePageViewed: 'ai-agent-welcome-page-viewed',
        AiAgentWelcomePageCtaClicked: 'ai-agent-welcome-page-cta-clicked',
    },
}))

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

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

jest.mock('../ShoppingAssistant/hooks/useAiAgentPaywallCTA', () => ({
    useAiAgentCtas: jest.fn(),
}))
const mockUseAiAgentCtas =
    require('../ShoppingAssistant/hooks/useAiAgentPaywallCTA')
        .useAiAgentCtas as jest.MockedFunction<any>

jest.mock('../ShoppingAssistant/utils/extractShopNameFromUrl', () => ({
    extractShopNameFromUrl: jest.fn(),
}))
const mockExtractShopNameFromUrl =
    require('../ShoppingAssistant/utils/extractShopNameFromUrl')
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
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiAgentOnboardingWizard) {
                return false
            }
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) {
                return true
            }
            return false
        })

        mockUseTrialAccess.mockReturnValue(DEFAULT_TRIAL_ACCESS_MOCK)

        mockUseAiAgentOnboardingState.mockReturnValue('onboarded')

        mockUseStoreActivations.mockReturnValue({
            storeActivations: [],
        })

        mockUseTrialModalProps.mockReturnValue({
            newTrialUpgradePlanModal: { isOpen: false },
            trialRequestModal: { isOpen: false },
        })

        mockUseAiAgentCtas.mockImplementation(
            ({
                onOpenWizard,
                isOnUpdateOnboardingWizard,
            }: {
                onOpenWizard: () => void
                isOnUpdateOnboardingWizard: boolean
            }) => ({
                ctas: (
                    <button onClick={onOpenWizard}>
                        <span>
                            {isOnUpdateOnboardingWizard
                                ? 'Continue Setup'
                                : 'Set Up AI Agent'}
                        </span>
                    </button>
                ),
                modals: null,
                afterCtas: null,
            }),
        )

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
                /Introducing AI Agent: Your new team member that drives sales and automates support in 1:1 conversations./,
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
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await userEvent.click(button)

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: '',
        })
    })

    it('should redirect to AiAgentOnboardingWizard page when Set up AI Agent button is clicked with the skillset step skipped', async () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await userEvent.click(button)

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: '',
        })
    })

    it('should redirect to AiAgentOnboardingWizard page with search params when Continue Set Up button is clicked', async () => {
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

        await userEvent.click(button)

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: `?${WIZARD_UPDATE_QUERY_KEY}=true`,
        })
    })

    it('should redirect to the new onboarding page without search params when Continue Set Up button is clicked', async () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) {
                return true
            }
            return false
        })

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await userEvent.click(button)

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/channels`,
            search: '',
        })
    })

    it('should redirect to the new onboarding page without search params when Continue Set Up button is clicked and the skillset step is skipped', async () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) {
                return true
            }
            return false
        })

        renderWithProvider({}, history)

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        await userEvent.click(button)

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
})
