import { screen } from '@testing-library/react'
import { createMemoryHistory, History } from 'history'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { shopifyIntegration } from 'fixtures/integrations'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

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

mockFlags({
    [FeatureFlagKey.AiAgentOnboardingWizard]: false,
})

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

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
        <Provider store={mockStore(defaultState)}>
            <AIAgentWelcomePageView {...defaultProps} {...props} />
        </Provider>,
        { history },
    )
}

describe('<AIAgentWelcomePageView />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizard]: false,
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
        })
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
                /Stay available 24\/7 across chat, email, and more — without extra headcount/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Automate FAQs and order updates so your team can focus on high-impact work/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Convert more with tailored product recommendations and smart discounts based on real-time data/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Train the AI to match your brand voice, policies, and sales strategy/,
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

        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
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

        mockFlags({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
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
})
