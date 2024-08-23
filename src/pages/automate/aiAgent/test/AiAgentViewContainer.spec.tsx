import React from 'react'
import {act, fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {mockFlags} from 'jest-launchdarkly-mock'
import {QueryClientProvider} from '@tanstack/react-query'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {account} from 'fixtures/account'
import {IntegrationType} from 'models/integration/types'

import {FeatureFlagKey} from 'config/featureFlags'
import {getHasAutomate} from 'state/billing/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import AiAgentViewContainer from '../AiAgentViewContainer'
import {getStoreConfigurationFixture} from '../fixtures/storeConfiguration.fixtures'
import {useGetOrCreateSnippetHelpCenter} from '../hooks/useGetOrCreateSnippetHelpCenter'
import {useAiAgentStoreConfigurationContext} from '../providers/AiAgentStoreConfigurationContext'

jest.mock('launchdarkly-react-client-sdk')

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

const mockStore = configureMockStore([thunk])

const defaultState = {
    currentAccount: fromJS(account),
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
}

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

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={mockQueryClient()}>
                <AiAgentViewContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent`,
            route: '/shopify/test-shop/ai-agent',
        }
    )

describe('AiAgentViewContainer', () => {
    const mockDispatch = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
        })
        mockGetHasAutomate.mockReturnValue(false)
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue(null)
        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    it('renders loader if loading store configuration', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            isLoading: true,
        })
        mockUseGetHelpCenterList.mockReturnValue(getHelpCenterListResponse)

        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
    })

    it('renders loader if loading help centers', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture(),
        })

        mockUseGetHelpCenterList.mockReturnValue({
            isLoading: true,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)

        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
    })

    it('renders configuration', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture(),
        })
        mockUseGetHelpCenterList.mockReturnValue(getHelpCenterListResponse)

        renderComponent()

        expect(screen.getByText('Save Changes')).toBeInTheDocument
        expect(screen.getByText('Enable AI Agent')).toBeInTheDocument
    })

    it('enables and disables configuration from the main toggle', () => {
        const storeConfiguration = getStoreConfigurationFixture()
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration,
        })
        mockUseGetHelpCenterList.mockReturnValue(getHelpCenterListResponse)

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
            <Provider store={mockStore(defaultState)}>
                <AiAgentViewContainer />
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
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture(),
        })
        mockUseGetHelpCenterList.mockReturnValue(getHelpCenterListResponse)

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
})
