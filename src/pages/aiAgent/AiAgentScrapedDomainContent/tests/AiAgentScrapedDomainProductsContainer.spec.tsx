// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import AiAgentScrapedDomainProductsContainer from '../AiAgentScrapedDomainProductsContainer'

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockedUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext,
)

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const defaultState = {}

const renderComponent = () => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentScrapedDomainProductsContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/knowledge/store-content`,
            route: '/shopify/test-shop/knowledge/store-content',
        },
    )
}

describe('<AiAgentScrapedDomainProductsContainer />', () => {
    beforeEach(() => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture(),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockFlags({
            [FeatureFlagKey.AiAgentScrapeStoreDomain]: true,
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
        })
    })

    it('should render the component', () => {
        renderComponent()

        expect(screen.getAllByText('Knowledge')[0]).toBeInTheDocument()
        expect(screen.getByText('Back to Sources')).toBeInTheDocument()
        expect(screen.getByText('Your store domain')).toBeInTheDocument()
        expect(screen.getByText('Sync')).toBeInTheDocument()
        expect(screen.getByText('Questions')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent uses product details from your store’s website content and your Shopify integration.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Product')).toBeInTheDocument()
    })

    it('should render correct header title for the page based on feature flag', () => {
        mockFlags({
            [FeatureFlagKey.ConvAiStandaloneMenu]: false,
        })

        renderComponent()
        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })

    it('should open side panel on row click (handleOnSelect)', async () => {
        renderComponent()
        const questionRow = screen.getByText(
            // to be replaced by actual mock data in the next iteration
            // https://linear.app/gorgias/issue/AIKNL-89/implement-functionality-for-product-content-tab
            'Duo Baguette Birthstone Ring',
        )
        fireEvent.click(questionRow)

        expect(screen.getByText('Product details')).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        expect(hideIcon).toBeInTheDocument()
    })
})
