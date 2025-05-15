// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toImmutable } from 'common/utils'
import { FeatureFlagKey } from 'config/featureFlags'
import { getIngestedResourcesListResponse } from 'pages/aiAgent/fixtures/ingestedResource.fixture'
import { getIngestionLogFixture } from 'pages/aiAgent/fixtures/ingestionLog.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { usePollStoreDomainIngestionLog } from 'pages/aiAgent/hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from 'pages/aiAgent/hooks/useSyncStoreDomain'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import AiAgentScrapedDomainQuestionsContainer from '../AiAgentScrapedDomainQuestionsContainer'
import { IngestedResourceStatus, IngestionLogStatus } from '../constant'
import { useIngestedResourceMutation } from '../hooks/useIngestedResourceMutation'
import { usePaginatedIngestedResources } from '../hooks/usePaginatedIngestedResources'

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockedUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext,
)

jest.mock('pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter')
const mockedUseGetOrCreateSnippetHelpCenter = assumeMock(
    useGetOrCreateSnippetHelpCenter,
)

jest.mock('pages/aiAgent/hooks/useSyncStoreDomain')
const mockUseSyncStoreDomain = assumeMock(useSyncStoreDomain)

jest.mock('pages/aiAgent/hooks/usePollStoreDomainIngestionLog')
const mockUsePollStoreDomainIngestionLog = assumeMock(
    usePollStoreDomainIngestionLog,
)

jest.mock('../hooks/usePaginatedIngestedResources')
const mockUsePaginatedIngestedResources = assumeMock(
    usePaginatedIngestedResources,
)

jest.mock('../hooks/useIngestedResourceMutation')
const mockUseIngestedResourceMutation = assumeMock(useIngestedResourceMutation)

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

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
    const mockedStoreName = 'test-shop'
    const mockedStoreDomain = `${mockedStoreName}.myshopify.com`
    const mockedStoreUrl = `https://${mockedStoreName}.myshopify.com`
    const mockedStoreDomainIngestionLog = getIngestionLogFixture({
        domain: mockedStoreDomain,
        url: mockedStoreUrl,
    })
    const mockedUpdateIngestedResource = jest.fn().mockResolvedValue(undefined)

    beforeEach(() => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture(),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockedUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {
                ...getSingleHelpCenterResponseFixture,
                type: 'snippet',
            },
        })
        mockUseSyncStoreDomain.mockReturnValue({
            storeDomain: mockedStoreDomain,
            storeUrl: mockedStoreUrl,
            storeDomainIngestionLog: {
                ...mockedStoreDomainIngestionLog,
                status: IngestionLogStatus.Successful,
            },
            isFetchLoading: false,
            syncTriggered: false,
            handleTriggerSync: jest.fn(),
            handleOnSync: jest.fn(),
            handleOnCancel: jest.fn(),
        })
        mockUsePollStoreDomainIngestionLog.mockReturnValue({
            ingestionLogStatus: IngestionLogStatus.Successful,
            syncIsPending: false,
        })
        mockUsePaginatedIngestedResources.mockReturnValue({
            contents: [],
            isLoading: false,
            isError: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            fetchPrev: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
        })
        mockUseIngestedResourceMutation.mockReturnValue({
            isIngestedResourceUpdating: false,
            updateIngestedResource: mockedUpdateIngestedResource,
        })
        mockFlags({
            [FeatureFlagKey.AiAgentScrapeStoreDomain]: true,
        })
    })

    it('should render the component', () => {
        renderComponent()

        expect(screen.getAllByText('Knowledge')[0]).toBeInTheDocument()
        expect(screen.getByText('Back to Sources')).toBeInTheDocument()
        expect(screen.getByText('Store website')).toBeInTheDocument()
        expect(screen.getByText('Sync')).toBeInTheDocument()
        expect(screen.getByText('Questions')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent automatically generates questions and answers from your website content to use as knowledge.',
            ),
        ).toBeInTheDocument()
        expect(screen.getAllByText('Question')[0]).toBeInTheDocument()
    })

    it('should render the component with loading banner when sync is pending', () => {
        mockUsePollStoreDomainIngestionLog.mockReturnValue({
            ingestionLogStatus: IngestionLogStatus.Pending,
            syncIsPending: true,
        })

        renderComponent()
        expect(
            screen.getByText(
                'Your store website is syncing. This may take a while. You will be notified once it is complete. In the meantime, the AI Agent may not have your latest content.',
            ),
        ).toBeInTheDocument()
    })

    it('should close the banner when close button is clicked', () => {
        mockUsePollStoreDomainIngestionLog.mockReturnValue({
            ingestionLogStatus: IngestionLogStatus.Pending,
            syncIsPending: true,
        })

        renderComponent()

        expect(
            screen.getByText(
                'Your store website is syncing. This may take a while. You will be notified once it is complete. In the meantime, the AI Agent may not have your latest content.',
            ),
        ).toBeInTheDocument()

        const closeButton = screen.getByRole('button', { name: /close/i })
        fireEvent.click(closeButton)

        expect(
            screen.queryByText(
                'Your store website is syncing. This may take a while. You will be notified once it is complete. In the meantime, the AI Agent may not have your latest content.',
            ),
        ).not.toBeInTheDocument()
    })

    it('should render empty state when storeDomainIngestionLog is undefined', () => {
        mockUseSyncStoreDomain.mockReturnValue({
            storeDomain: undefined,
            storeUrl: null,
            storeDomainIngestionLog: undefined,
            isFetchLoading: false,
            syncTriggered: false,
            handleTriggerSync: jest.fn(),
            handleOnSync: jest.fn(),
            handleOnCancel: jest.fn(),
        })

        renderComponent()

        expect(screen.getByText('No questions generated')).toBeInTheDocument()
    })

    it('should open side panel on row click (handleOnSelect)', async () => {
        const mockedListIngestedResources = getIngestedResourcesListResponse({
            page: 1,
            itemCount: 5,
        })
        mockUsePaginatedIngestedResources.mockReturnValue({
            contents: mockedListIngestedResources.data,
            isLoading: false,
            isError: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            fetchPrev: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
        })

        renderComponent()

        const questionRow = screen.getByText(
            mockedListIngestedResources.data[0].title,
        )
        fireEvent.click(questionRow)

        expect(screen.getByText('Question details')).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        expect(hideIcon).toBeInTheDocument()
        expect(screen.getByText('Available for AI Agent')).toBeInTheDocument()
        expect(screen.getByText('View source URLs')).toBeInTheDocument()
    })

    it('should call updateIngestedResource when enabled toggle button is clicked', () => {
        const mockedListIngestedResources = getIngestedResourcesListResponse({
            page: 1,
            itemCount: 5,
        })
        mockUsePaginatedIngestedResources.mockReturnValue({
            contents: mockedListIngestedResources.data,
            isLoading: false,
            isError: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            fetchPrev: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
        })

        renderComponent()

        const questionRow = screen.getByText(
            mockedListIngestedResources.data[0].title,
        )
        fireEvent.click(questionRow)

        const toggleButton = screen
            .queryAllByLabelText('Available for AI Agent')
            .find(
                (toggle) =>
                    toggle.getAttribute('name') === `toggle-question-details`,
            )!
        fireEvent.click(toggleButton)

        expect(mockedUpdateIngestedResource).toHaveBeenCalledWith(
            mockedListIngestedResources.data[0].id,
            {
                status: IngestedResourceStatus.Disabled,
            },
        )
    })

    it('should display source URLs when button is clicked', () => {
        const mockedListIngestedResources = getIngestedResourcesListResponse({
            page: 1,
            itemCount: 5,
        })
        mockUsePaginatedIngestedResources.mockReturnValue({
            contents: mockedListIngestedResources.data,
            isLoading: false,
            isError: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            fetchPrev: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
        })

        renderComponent()

        const questionRow = screen.getByText(
            mockedListIngestedResources.data[0].title,
        )
        fireEvent.click(questionRow)

        const viewSourceButton = screen.getByText('View source URLs')
        fireEvent.click(viewSourceButton)

        expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })
})
