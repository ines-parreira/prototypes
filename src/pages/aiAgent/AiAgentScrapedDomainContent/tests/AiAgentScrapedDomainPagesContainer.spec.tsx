import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import AiAgentScrapedDomainPagesContainer from '../AiAgentScrapedDomainPagesContainer'

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
                <AiAgentScrapedDomainPagesContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/knowledge/store-content`,
            route: '/shopify/test-shop/knowledge/store-content',
        },
    )
}

describe('<AiAgentScrapedDomainPagesContainer />', () => {
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

        expect(screen.getByText('Back to Sources')).toBeInTheDocument()
        expect(screen.getByText('Your store domain')).toBeInTheDocument()
        expect(screen.getByText('Sync')).toBeInTheDocument()
        expect(screen.getByText('Pages')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent automatically scrapes all pages from your store’s website to use as knowledge.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Page')).toBeInTheDocument()
        expect(screen.getByText('No pages generated')).toBeInTheDocument()
    })
})
