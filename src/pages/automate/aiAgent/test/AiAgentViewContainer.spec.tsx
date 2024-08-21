import React from 'react'
import {screen} from '@testing-library/react'
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
import {useStoreConfiguration} from '../hooks/useStoreConfiguration'

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

jest.mock('../hooks/useStoreConfiguration')
const mockUseStoreConfiguration = assumeMock(useStoreConfiguration)

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = assumeMock(useGetHelpCenterList)

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
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: true,
        })
        mockUseGetHelpCenterList.mockReturnValue(getHelpCenterListResponse)

        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
    })

    it('renders loader if loading help centers', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture(),
            isLoading: false,
        })
        mockUseGetHelpCenterList.mockReturnValue({
            isLoading: true,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)

        renderComponent()
        expect(screen.getByTestId('loader')).toBeInTheDocument
    })

    it('renders configuration', () => {
        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture(),
            isLoading: false,
        })
        mockUseGetHelpCenterList.mockReturnValue(getHelpCenterListResponse)

        renderComponent()
        expect(screen.getByText('Save Changes')).toBeInTheDocument
    })
})
