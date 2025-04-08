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

import AiAgentScrapedDomainQuestionsContainer from '../AiAgentScrapedDomainQuestionsContainer'

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
                <AiAgentScrapedDomainQuestionsContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/knowledge/store-content`,
            route: '/shopify/test-shop/knowledge/store-content',
        },
    )
}

describe('<AiAgentScrapedDomainQuestionsContainer />', () => {
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
                'AI Agent automatically generates questions and answers from your store’s website content to use as knowledge.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Question')).toBeInTheDocument()
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
            // https://linear.app/gorgias/issue/AIKNL-88/implement-functionality-for-pages-content-tab
            'What should I do if I received a defective item?',
        )
        fireEvent.click(questionRow)

        expect(screen.getByText('Question details')).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        expect(hideIcon).toBeInTheDocument()
    })
})
