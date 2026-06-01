/**
 * V3 entry tests focus on the V3-specific behavior — the JtbdPicker that
 * intercepts every paywall→wizard CTA (setup and trial). V2-identical
 * cohort/CTA shape is covered by
 * ../AIAgentWelcomePageView/paywallCohortParity.spec.tsx.
 */

import { useFlag } from '@repo/feature-flags'
import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { shopifyIntegration } from 'fixtures/integrations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import type { TrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { JTBD_QUERY_KEY } from 'pages/aiAgent/utils/jtbd'
import type { RootState } from 'state/types'

import { AIAgentWelcomePageViewV3 } from './AIAgentWelcomePageViewV3'

jest.mock('@repo/feature-flags')

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(() => ({
        isAdmin: true,
        isLoading: false,
        onboardingNotificationState: undefined,
        handleOnSave: jest.fn(),
        handleOnSendOrCancelNotification: jest.fn(),
        handleOnEnablementPostReceivedNotification: jest.fn(),
        handleOnPerformActionPostReceivedNotification: jest.fn(),
        isAiAgentOnboardingNotificationEnabled: false,
    })),
}))
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const mockUseTrialAccess = jest.mocked(useTrialAccess)
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState', () => ({
    ...jest.requireActual('pages/aiAgent/hooks/useAiAgentOnboardingState'),
    useAiAgentOnboardingState: jest.fn(),
}))
const mockUseAiAgentOnboardingState = jest.mocked(useAiAgentOnboardingState)
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations', () => ({
    useStoreActivations: jest.fn(() => ({
        storeActivations: [],
        allStoreActivations: {},
    })),
}))
jest.mock('pages/aiAgent/trial/hooks/useTrialModalProps', () => ({
    useTrialModalProps: jest.fn(() => ({
        newTrialUpgradePlanModal: { isOpen: false },
        trialRequestModal: { isOpen: false },
        trialFinishSetupModal: {},
        upgradePlanModal: { isOpen: false },
    })),
    EXTERNAL_URLS: {
        AI_AGENT_TRIAL_LEARN_MORE_PAYWALL: 'https://learn-ai-agent.test',
        SHOPPING_ASSISTANT_TRIAL_LEARN_MORE_PAYWALL: 'https://learn-sa.test',
        BOOK_DEMO_AIAGENT: 'https://demo-ai.test',
        BOOK_DEMO_SHOPPING_ASSISTANT: 'https://demo-sa.test',
    },
}))
jest.mock(
    'pages/aiAgent/components/ShoppingAssistant/utils/eventLogger',
    () => ({
        logInTrialEventFromPaywall: jest.fn(),
    }),
)
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
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl', () => ({
    extractShopNameFromUrl: jest.fn(() => SHOP_NAME),
}))
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
const mockUseShoppingAssistantTrialFlow = jest.mocked(
    useShoppingAssistantTrialFlow,
)

const SHOP_NAME = 'my-store'
const SHOP_TYPE = 'shopify'

const CAN_START_ONBOARDING_TRIAL_ACCESS = {
    hasAnyTrialStarted: false,
    hasAnyTrialActive: false,
    hasAnyTrialExpired: false,
    hasAnyTrialOptedIn: false,
    hasAnyTrialOptedOut: false,
    canSeeTrialCTA: false,
    canSeeSubscribeNowCTA: false,
    canSeeSystemBanner: false,
    isAdminUser: true,
    canBookDemo: false,
    canNotifyAdmin: false,
    hasCurrentStoreTrialStarted: false,
    hasCurrentStoreTrialOptedOut: false,
    hasCurrentStoreTrialExpired: false,
    hasCurrentStoreTrialActive: false,
    isTrialingSubscription: false,
    currentAutomatePlan: { generation: 6 },
    trialType: TrialType.AiAgent,
    isOnboarded: false,
    isInAiAgentTrial: false,
    trials: undefined,
} as unknown as TrialAccess

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const defaultProps = {
    accountDomain: 'my-account-domain',
    shopType: SHOP_TYPE,
    shopName: SHOP_NAME,
}

const LocationPath = () => {
    const location = useLocation()
    return (
        <div data-testlocation>{`${location.pathname}${location.search}`}</div>
    )
}

type RenderOverrides = Partial<typeof defaultProps> & {
    storeConfiguration?: Record<string, unknown>
}

const renderV3 = (propOverrides: RenderOverrides = {}) => {
    const props = {
        ...defaultProps,
        ...propOverrides,
    } as React.ComponentProps<typeof AIAgentWelcomePageViewV3>
    return render(
        <>
            <AIAgentWelcomePageViewV3 {...props} />
            <LocationPath />
        </>,
        { storeState: defaultState },
    )
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(useFlag as jest.MockedFunction<typeof useFlag>).mockReturnValue(false)
    mockUseTrialAccess.mockReturnValue(CAN_START_ONBOARDING_TRIAL_ACCESS)
    mockUseAiAgentOnboardingState.mockReturnValue(OnboardingState.Onboarded)
    mockUseShoppingAssistantTrialFlow.mockReturnValue(
        getUseShoppingAssistantTrialFlowFixture(),
    )
})

describe('<AIAgentWelcomePageViewV3 />', () => {
    it('renders the canStartOnboarding "Set Up AI Agent" CTA', () => {
        renderV3()

        expect(
            screen.getByRole('button', { name: /Set Up AI Agent/i }),
        ).toBeInTheDocument()
    })

    it('relabels the CTA to "Continue Setup" when the wizard has not yet been completed', () => {
        renderV3({
            storeConfiguration: getStoreConfigurationFixture({
                wizard: { completedDatetime: null } as never,
            }),
        })

        expect(
            screen.getByRole('button', { name: /Continue Setup/i }),
        ).toBeInTheDocument()
    })

    it('shows the JtbdPicker after clicking "Set Up AI Agent" instead of navigating', async () => {
        const user = userEvent.setup()
        renderV3()

        await user.click(
            screen.getByRole('button', { name: /Set Up AI Agent/i }),
        )

        expect(
            screen.getByRole('heading', {
                name: /What do you want AI Agent to handle first/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Set Up AI Agent/i }),
        ).not.toBeInTheDocument()
    })

    it.each([
        {
            label: 'support',
            optionName: /Resolve support questions automatically/i,
        },
        {
            label: 'sales',
            optionName: /Turn shopper conversations into sales/i,
        },
    ])(
        'navigates to the wizard with ?jtbd=$label after picking $label',
        async ({ label, optionName }) => {
            const user = userEvent.setup()
            renderV3()

            await user.click(
                screen.getByRole('button', { name: /Set Up AI Agent/i }),
            )
            await user.click(screen.getByText(optionName))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/tone of voice?${JTBD_QUERY_KEY}=${label}`,
                    ),
                ).toBeInTheDocument()
            })
        },
    )

    it('shows the JtbdPicker after clicking "Try for free" instead of navigating directly', async () => {
        const user = userEvent.setup()
        mockUseTrialAccess.mockReturnValue({
            ...CAN_START_ONBOARDING_TRIAL_ACCESS,
            currentAutomatePlan: undefined,
            canSeeTrialCTA: true,
            isOnboarded: false,
        } as unknown as TrialAccess)
        renderV3()

        await user.click(screen.getByRole('button', { name: /Try for free/i }))

        expect(
            screen.getByRole('heading', {
                name: /What do you want AI Agent to handle first/i,
            }),
        ).toBeInTheDocument()

        await user.click(
            screen.getByText(/Resolve support questions automatically/i),
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/tone of voice?${JTBD_QUERY_KEY}=support`,
                ),
            ).toBeInTheDocument()
        })
    })

    it('appends the wizard-update query param when continuing setup', async () => {
        const user = userEvent.setup()
        renderV3({
            storeConfiguration: getStoreConfigurationFixture({
                wizard: { completedDatetime: null } as never,
            }),
        })

        await user.click(
            screen.getByRole('button', { name: /Continue Setup/i }),
        )
        await user.click(
            screen.getByText(/Resolve support questions automatically/i),
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding/tone of voice?${JTBD_QUERY_KEY}=support&${WIZARD_UPDATE_QUERY_KEY}=true`,
                ),
            ).toBeInTheDocument()
        })
    })
})
