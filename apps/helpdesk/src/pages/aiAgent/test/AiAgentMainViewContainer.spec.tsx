import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { keyBy } from 'lodash'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { defaultUseAiAgentOnboardingNotification } from 'fixtures/onboardingStateNotification'
import useAppDispatch from 'hooks/useAppDispatch'
import type { Wizard } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { IntegrationType } from 'models/integration/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getHasAutomate } from 'state/billing/selectors'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import AiAgentMainViewContainer from '../AiAgentMainViewContainer'
import { useAiAgentOnboardingNotification } from '../hooks/useAiAgentOnboardingNotification'
import { useStoreConfiguration } from '../hooks/useStoreConfiguration'
import { useAiAgentStoreConfigurationContext } from '../providers/AiAgentStoreConfigurationContext'

jest.mock('@gorgias/axiom', () => ({
    LegacyLoadingSpinner: () => (
        <div data-testid="loading-spinner">Loading...</div>
    ),
}))
jest.mock(
    'pages/settings/billing/automate/AutomateSubscriptionModal',
    () => () => <div>Automate Subscription Modal</div>,
)

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
const mockGetHasAutomate = jest.mocked(getHasAutomate)

jest.mock('../hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
const mockUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter,
)

jest.mock('../hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

jest.mock('../hooks/useStoreConfiguration')
const mockUseStoreConfiguration = jest.mocked(useStoreConfiguration)

jest.mock('../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: () => ({
        isLoading: false,
        helpCenters: [],
    }),
}))

jest.mock('pages/automate/common/hooks/useHelpCentersArticleCount', () => ({
    useHelpCentersArticleCount: () => [],
}))

jest.mock('../AIAgentWelcomePageDynamic', () => ({
    AIAgentWelcomePageDynamic: () => <div>AI Agent Welcome Page</div>,
}))

jest.mock('models/storeMapping/queries', () => ({
    useListStoreMappings: () => ({
        data: [],
    }),
}))

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { AiAgentWelcomePageViewed: 'ai-agent-welcome-page-viewed' },
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

const SHOP_TYPE = 'shopify'
const SHOP_NAME = 'test-shop'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const useParamsMock = assumeMock(useParams)

const mockStore = configureMockStore([thunk])

const contactForm = ContactFormFixture

const getState = (accountId?: number) => ({
    currentAccount: fromJS(
        accountId !== undefined ? { ...account, id: accountId } : account,
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
                        order_management: { enabled: false },
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
            { id: 1, name: 'help center 1', type: 'faq' },
            { id: 2, name: 'help center 2', type: 'faq' },
        ],
    }),
    isLoading: false,
} as unknown as ReturnType<typeof useGetHelpCenterList>

const renderComponent = ({
    accountId = undefined,
}: { accountId?: number } = {}) =>
    renderWithRouter(
        <Provider store={mockStore(getState(accountId))}>
            <QueryClientProvider client={mockQueryClient()}>
                <AiAgentMainViewContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent`,
            route: '/shopify/test-shop/ai-agent',
        },
    )

const setupMocks = ({
    isStoreConfigurationLoading = false,
    isHelpCentersLoading = false,
    hasStoreConfiguration = true,
} = {}) => {
    mockFeatureFlags({})

    mockGetHasAutomate.mockReturnValue(false)
    mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
        helpCenter: null,
        isLoading: false,
    })

    mockUseAppDispatch.mockReturnValue(jest.fn())

    mockUseStoreConfiguration.mockReturnValue({
        ...mockedAiAgentStoreConfigurationContext,
        storeConfiguration: hasStoreConfiguration
            ? getStoreConfigurationFixture({
                  wizard: {
                      completedDatetime: '2021-01-01',
                  } as Wizard,
              })
            : undefined,
        isLoading: isStoreConfigurationLoading,
        isFetched: true,
        error: null,
    })

    mockUseAiAgentStoreConfigurationContext.mockReturnValue({
        ...mockedAiAgentStoreConfigurationContext,
        storeConfiguration: hasStoreConfiguration
            ? getStoreConfigurationFixture({
                  wizard: {
                      completedDatetime: '2021-01-01',
                  } as Wizard,
              })
            : undefined,
        isLoading: isStoreConfigurationLoading,
    })

    mockUseAiAgentOnboardingNotification.mockReturnValue(
        defaultUseAiAgentOnboardingNotification,
    )

    mockUseGetHelpCenterList.mockReturnValue({
        ...getHelpCenterListResponse,
        isLoading: isHelpCentersLoading,
    } as unknown as ReturnType<typeof useGetHelpCenterList>)
}

describe('AiAgentMainViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useParamsMock.mockReturnValue({
            shopType: SHOP_TYPE,
            shopName: SHOP_NAME,
        })
    })

    it('renders loader if loading store configuration', () => {
        setupMocks({ isStoreConfigurationLoading: true })
        renderComponent()
        // The LoadingSpinner component should be rendered with a loading div
        const loadingDiv = document.querySelector('[aria-label="loading"]')
        expect(loadingDiv).toBeInTheDocument()
    })

    it('renders welcome page if onboarding wizard is not completed', () => {
        setupMocks({ hasStoreConfiguration: false })
        renderComponent()
        // When there's no store configuration, the component should show the welcome page
        expect(screen.getByText('AI Agent Welcome Page')).toBeInTheDocument()
    })

    it('redirects to overview page if onboarding wizard is done', () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest
            .spyOn(history, 'replace')
            .mockImplementationOnce(jest.fn)

        setupMocks({
            hasStoreConfiguration: true,
        })

        renderWithRouter(
            <Provider store={mockStore(getState())}>
                <QueryClientProvider client={mockQueryClient()}>
                    <AiAgentMainViewContainer />
                </QueryClientProvider>
            </Provider>,
            { history },
        )

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/overview',
        )
    })
})
