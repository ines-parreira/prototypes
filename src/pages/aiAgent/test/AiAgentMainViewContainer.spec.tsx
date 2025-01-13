import {QueryClientProvider} from '@tanstack/react-query'
import {screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import {keyBy} from 'lodash'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {logEvent, SegmentEvent} from 'common/segment'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import useAppDispatch from 'hooks/useAppDispatch'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {IntegrationType} from 'models/integration/types'
import {getStoreConfigurationFixture} from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {useGetOrCreateSnippetHelpCenter} from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import {useWelcomePageAcknowledged} from 'pages/aiAgent/hooks/useWelcomePageAcknowledged'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {getHasAutomate} from 'state/billing/selectors'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithRouter} from 'utils/testing'

import AiAgentMainViewContainer from '../AiAgentMainViewContainer'
import {useAiAgentOnboardingNotification} from '../hooks/useAiAgentOnboardingNotification'
import {useStoreConfiguration} from '../hooks/useStoreConfiguration'

jest.mock('launchdarkly-react-client-sdk')

jest.mock('../hooks/useWelcomePageAcknowledged')
const mockUseWelcomePageAcknowledged = jest.mocked(useWelcomePageAcknowledged)

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
const mockGetHasAutomate = jest.mocked(getHasAutomate)

jest.mock('../hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
const mockUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter
)

jest.mock('../hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification
)

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('../hooks/useStoreConfiguration')
const mockUseStoreConfiguration = jest.mocked(useStoreConfiguration)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: () => ({
        isLoading: false,
        helpCenters: [],
    }),
}))

jest.mock('pages/automate/common/hooks/useHelpCentersArticleCount', () => ({
    useHelpCentersArticleCount: () => [],
}))

jest.mock('models/storeMapping/queries', () => ({
    useListStoreMappings: () => ({
        data: [],
    }),
}))

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {AiAgentWelcomePageViewed: 'ai-agent-welcome-page-viewed'},
}))

jest.mock('pages/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: () => ({
        sourceItems: [],
        isSourceItemsListLoading: false,
    }),
}))

jest.mock('pages/aiAgent/hooks/useFileIngestion', () => ({
    useFileIngestion: () => ({
        ingestedFiles: [],
    }),
}))

const mockStore = configureMockStore([thunk])

const contactForm = ContactFormFixture

const getState = (accountId?: number) => ({
    currentAccount: fromJS(
        accountId !== undefined ? {...account, id: accountId} : account
    ),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'test-shop',
                meta: {
                    shop_name: 'test-shop',
                    oauth: {
                        scope: ['read_fulfillments'],
                    },
                },
            },
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: 'test@mail.com',
                },
            },
        ],
    }),
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {
                automationSettingsByContactFormId: {
                    [contactForm.id]: {
                        workflows: [],
                        order_management: {enabled: false},
                    },
                },
            },
            contactForms: {
                contactFormById: keyBy([contactForm], 'id'),
            },
        },
    },
})

const mockedAiAgentStoreConfigurationContext = {
    isLoading: false,
    storeConfiguration: undefined,
    updateStoreConfiguration: jest.fn(),
    createStoreConfiguration: jest.fn(),
    isPendingCreateOrUpdate: false,
}

const getHelpCenterListResponse = {
    data: axiosSuccessResponse({
        data: [
            {id: 1, name: 'help center 1', type: 'faq'},
            {id: 2, name: 'help center 2', type: 'faq'},
        ],
    }),
    isLoading: false,
} as unknown as ReturnType<typeof useGetHelpCenterList>

const renderComponent = ({accountId = undefined}: {accountId?: number} = {}) =>
    renderWithRouter(
        <Provider store={mockStore(getState(accountId))}>
            <QueryClientProvider client={mockQueryClient()}>
                <AiAgentMainViewContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent`,
            route: '/shopify/test-shop/ai-agent',
        }
    )

const setupMocks = ({
    trialModeFlag = false,
    welcomePageFlag = 'off',
    onBoardingWizardFlag = false,
    isStoreConfigurationLoading = false,
    isHelpCentersLoading = false,
    isWelcomePageAcknowledgedLoading = false,
    welcomePageAcknowledged = false,
    hasStoreConfiguration = true,
} = {}) => {
    mockFlags({
        [FeatureFlagKey.AiAgentTrialMode]: trialModeFlag,
        [FeatureFlagKey.AIAgentWelcomePage]: welcomePageFlag,
        [FeatureFlagKey.AiAgentOnboardingWizard]: onBoardingWizardFlag,
    })

    mockGetHasAutomate.mockReturnValue(false)
    mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
        helpCenter: null,
        isLoading: false,
    })

    mockUseAppDispatch.mockReturnValue(jest.fn())
    mockUseWelcomePageAcknowledged.mockReturnValue({
        isLoading: isWelcomePageAcknowledgedLoading,
        data: {acknowledged: welcomePageAcknowledged},
    })

    mockUseStoreConfiguration.mockReturnValue({
        ...mockedAiAgentStoreConfigurationContext,
        storeConfiguration: hasStoreConfiguration
            ? getStoreConfigurationFixture()
            : undefined,
        isLoading: isStoreConfigurationLoading,
    })

    mockUseAiAgentOnboardingNotification.mockReturnValue({
        isAdmin: true,
        isLoading: false,
        onboardingNotificationState: undefined,
        handleOnSave: jest.fn(),
        handleOnSendOrCancelNotification: jest.fn(),
        isAiAgentOnboardingNotificationEnabled: true,
    })

    mockUseGetHelpCenterList.mockReturnValue({
        ...getHelpCenterListResponse,
        isLoading: isHelpCentersLoading,
    } as unknown as ReturnType<typeof useGetHelpCenterList>)
}

describe('AiAgentMainViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
        })
    })

    it('renders loader if loading store configuration', () => {
        setupMocks({isStoreConfigurationLoading: true})
        renderComponent()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('hides the toggle if in trial mode', () => {
        setupMocks({trialModeFlag: true})
        renderComponent()
        expect(screen.queryByText('Enable AI Agent')).not.toBeInTheDocument()
    })

    it('renders loader if loading welcome page acknowledged', () => {
        setupMocks({isWelcomePageAcknowledgedLoading: true})
        renderComponent()
        expect(screen.getByText('Loading...')).toBeInTheDocument
    })

    it('renders the dynamic welcome page if account ID is odd and feature flag is set to dynamic_odd_static_even', () => {
        setupMocks({
            welcomePageFlag: 'dynamic_odd_static_even',
            hasStoreConfiguration: false,
        })

        renderComponent()

        expect(
            screen.queryByText(
                'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps'
            )
        ).toBeInTheDocument()

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            {version: 'Dynamic', store: 'test-shop'}
        )
    })

    it('renders the static welcome page if account ID is even and feature flag is set to dynamic_odd_static_even', () => {
        setupMocks({
            welcomePageFlag: 'dynamic_odd_static_even',
            hasStoreConfiguration: false,
        })
        renderComponent({accountId: 2})

        expect(
            screen.queryByText(
                'Introducing AI Agent, your team’s newest member for seamless customer interactions who can:'
            )
        ).toBeInTheDocument()

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            {version: 'Basic', store: 'test-shop'}
        )
    })

    it('renders the static welcome page if account ID is odd and feature flag is set to static_odd_dynamic_even', () => {
        setupMocks({
            welcomePageFlag: 'static_odd_dynamic_even',
            hasStoreConfiguration: false,
        })
        renderComponent()

        expect(
            screen.queryByText(
                'Introducing AI Agent, your team’s newest member for seamless customer interactions who can:'
            )
        ).toBeInTheDocument()

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            {version: 'Basic', store: 'test-shop'}
        )
    })

    it('renders the dynamic welcome page if account ID is even and feature flag is set to static_odd_dynamic_even', () => {
        setupMocks({
            welcomePageFlag: 'static_odd_dynamic_even',
            hasStoreConfiguration: false,
        })
        renderComponent({accountId: 2})

        expect(
            screen.queryByText(
                'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps'
            )
        ).toBeInTheDocument()

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            {version: 'Dynamic', store: 'test-shop'}
        )
    })

    it('renders the dynamic welcome page for onboarding wizard if the the flag is enabled', () => {
        setupMocks({
            onBoardingWizardFlag: true,
            hasStoreConfiguration: false,
        })

        renderComponent()
        expect(
            screen.queryByText(
                'Prepare AI Agent to automate 60% of your email, Chat and Contact Form tickets by completing these steps:'
            )
        ).toBeInTheDocument()
    })

    it('redirects to guidance page if onboarding wizard is done', () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest
            .spyOn(history, 'replace')
            .mockImplementationOnce(jest.fn)

        setupMocks({
            hasStoreConfiguration: false,
        })

        renderWithRouter(
            <Provider store={mockStore(getState())}>
                <QueryClientProvider client={mockQueryClient()}>
                    <AiAgentMainViewContainer />
                </QueryClientProvider>
            </Provider>,
            {history}
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            expect.stringContaining('ai-agent/settings')
        )
    })
})
