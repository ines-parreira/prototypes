import React from 'react'
import {act, fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {mockFlags} from 'jest-launchdarkly-mock'
import {QueryClientProvider} from '@tanstack/react-query'
import {keyBy} from 'lodash'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {account} from 'fixtures/account'
import {IntegrationType} from 'models/integration/types'
import {logEvent, SegmentEvent} from 'common/segment'

import {FeatureFlagKey} from 'config/featureFlags'
import {getHasAutomate} from 'state/billing/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'

import AiAgentViewContainer from '../AiAgentViewContainer'
import {getStoreConfigurationFixture} from '../fixtures/storeConfiguration.fixtures'
import {useGetOrCreateSnippetHelpCenter} from '../hooks/useGetOrCreateSnippetHelpCenter'
import {useAiAgentStoreConfigurationContext} from '../providers/AiAgentStoreConfigurationContext'
import {useWelcomePageAcknowledged} from '../hooks/useWelcomePageAcknowledged'

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

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('../providers/AiAgentStoreConfigurationContext')
const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext
)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: () => ({
        isLoading: false,
        helpCenters: [],
    }),
}))

jest.mock('../../common/hooks/useHelpCentersArticleCount', () => ({
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
                <AiAgentViewContainer />
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
    isStoreConfigurationLoading = false,
    isHelpCentersLoading = false,
    isWelcomePageAcknowledgedLoading = false,
    welcomePageAcknowledged = false,
    hasStoreConfiguration = true,
} = {}) => {
    mockFlags({
        [FeatureFlagKey.AiAgentTrialMode]: trialModeFlag,
        [FeatureFlagKey.AIAgentWelcomePage]: welcomePageFlag,
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

    mockUseAiAgentStoreConfigurationContext.mockReturnValue({
        ...mockedAiAgentStoreConfigurationContext,
        storeConfiguration: hasStoreConfiguration
            ? getStoreConfigurationFixture()
            : undefined,
        isLoading: isStoreConfigurationLoading,
    })

    mockUseGetHelpCenterList.mockReturnValue({
        ...getHelpCenterListResponse,
        isLoading: isHelpCentersLoading,
    } as unknown as ReturnType<typeof useGetHelpCenterList>)
}

describe('AiAgentViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
        })
    })

    it('renders loader if loading store configuration', () => {
        setupMocks({isStoreConfigurationLoading: true})
        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
    })

    it('renders loader if loading help centers', () => {
        setupMocks({isHelpCentersLoading: true})
        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
    })

    it('renders configuration', () => {
        setupMocks()
        renderComponent()
        expect(screen.getByText('Save Changes')).toBeInTheDocument
        expect(screen.getByText('Enable AI Agent')).toBeInTheDocument
    })

    it('enables and disables configuration from the main toggle', () => {
        setupMocks()
        const storeConfiguration = getStoreConfigurationFixture()
        const {rerender} = renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Enable AI Agent'))
        })

        expect(
            mockedAiAgentStoreConfigurationContext.updateStoreConfiguration
        ).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: expect.any(String),
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: {
                ...storeConfiguration,
                deactivatedDatetime: new Date().toISOString(),
            },
        })

        rerender(
            <Provider store={mockStore(getState())}>
                <QueryClientProvider client={mockQueryClient()}>
                    <AiAgentViewContainer />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            fireEvent.click(screen.getByText('Enable AI Agent'))
        })

        expect(
            mockedAiAgentStoreConfigurationContext.updateStoreConfiguration
        ).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: null,
        })
    })

    it('hides the toggle if in trial mode', () => {
        setupMocks({trialModeFlag: true})
        renderComponent()
        expect(screen.queryByText('Enable AI Agent')).not.toBeInTheDocument()

        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
        })
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture({
                trialModeActivatedDatetime: new Date().toISOString(),
            }),
        })
        renderComponent()
        expect(screen.queryByText('Enable AI Agent')).not.toBeInTheDocument()
    })

    it('renders loader if loading welcome page acknowledged', () => {
        setupMocks({isWelcomePageAcknowledgedLoading: true})
        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
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

    it('renders the configuration page if the merchant already has interacted with the AI Agent', () => {
        setupMocks({
            welcomePageFlag: 'dynamic_odd_static_even',
            hasStoreConfiguration: true,
        })

        renderComponent()
        expect(screen.getByText('Save Changes')).toBeInTheDocument
        expect(screen.getByText('Enable AI Agent')).toBeInTheDocument
    })

    it('renders the configuration page if the welcome page is acknowledged', () => {
        setupMocks({
            welcomePageFlag: 'dynamic_odd_static_even',
            hasStoreConfiguration: false,
            welcomePageAcknowledged: true,
        })

        renderComponent()
        expect(screen.getByText('Save Changes')).toBeInTheDocument
    })
})
