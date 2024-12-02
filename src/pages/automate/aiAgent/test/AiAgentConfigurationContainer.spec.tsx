import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import {keyBy} from 'lodash'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {account} from 'fixtures/account'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import useAppDispatch from 'hooks/useAppDispatch'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {IntegrationType} from 'models/integration/types'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {getHasAutomate} from 'state/billing/selectors'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithRouter} from 'utils/testing'

import AiAgentConfigurationContainer from '../AiAgentConfigurationContainer'
import {getStoreConfigurationFixture} from '../fixtures/storeConfiguration.fixtures'
import {useGetOrCreateSnippetHelpCenter} from '../hooks/useGetOrCreateSnippetHelpCenter'
import {useAiAgentStoreConfigurationContext} from '../providers/AiAgentStoreConfigurationContext'

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
    SegmentEvent: {AiAgentEnabled: 'ai-agent-enabled'},
}))

jest.mock('pages/automate/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: () => ({
        sourceItems: [],
        isSourceItemsListLoading: false,
    }),
}))

jest.mock('pages/automate/aiAgent/hooks/useFileIngestion', () => ({
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
                <AiAgentConfigurationContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/settings`,
            route: '/shopify/test-shop/ai-agent/settings',
        }
    )

const setupMocks = ({
    isStoreConfigurationLoading = false,
    isHelpCentersLoading = false,
    hasStoreConfiguration = true,
} = {}) => {
    mockFlags({})

    mockGetHasAutomate.mockReturnValue(false)
    mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
        helpCenter: null,
        isLoading: false,
    })

    mockUseAppDispatch.mockReturnValue(jest.fn())

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

describe('AiAgentConfigurationContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('renders loader if loading store configuration', () => {
        setupMocks({isStoreConfigurationLoading: true})
        renderComponent()
        expect(screen.getByLabelText('loading')).toBeInTheDocument()
    })

    it('renders loader if loading help centers', () => {
        setupMocks({isHelpCentersLoading: true})
        renderComponent()
        expect(screen.getByLabelText('loading')).toBeInTheDocument()
    })

    it('renders configuration', () => {
        setupMocks()
        renderComponent()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getAllByText('Enable AI Agent')[0]).toBeInTheDocument()
    })

    it('enables and disables configuration from the main toggle', () => {
        setupMocks()
        const storeConfiguration = getStoreConfigurationFixture()
        const {rerender} = renderComponent()

        act(() => {
            fireEvent.click(screen.getAllByText('Enable AI Agent')[0])
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
                    <AiAgentConfigurationContainer />
                </QueryClientProvider>
            </Provider>
        )

        act(() => {
            fireEvent.click(screen.getAllByText('Enable AI Agent')[0])
        })

        expect(
            mockedAiAgentStoreConfigurationContext.updateStoreConfiguration
        ).toHaveBeenCalledWith({
            ...storeConfiguration,
            deactivatedDatetime: null,
        })
    })

    it('renders the configuration page if the merchant already has interacted with the AI Agent', () => {
        setupMocks({
            hasStoreConfiguration: true,
        })

        renderComponent()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getAllByText('Enable AI Agent')[0]).toBeInTheDocument()
    })
})
