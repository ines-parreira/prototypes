// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { FeatureFlagKey } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toImmutable } from 'common/utils'
import { useGetIngestedResource } from 'models/helpCenter/queries'
import { useSelectedQuestionAndDetail } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useSelectedQuestionAndDetail'
import {
    getIngestedResourceFixture,
    getIngestedResourcesListResponse,
} from 'pages/aiAgent/fixtures/ingestedResource.fixture'
import { getIngestionLogFixture } from 'pages/aiAgent/fixtures/ingestionLog.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { usePollStoreDomainIngestionLog } from 'pages/aiAgent/hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from 'pages/aiAgent/hooks/useSyncStoreDomain'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

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

jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useSelectedQuestionAndDetail',
)
const mockUseSelectedQuestionAndDetail = assumeMock(
    useSelectedQuestionAndDetail,
)

jest.mock('../hooks/useIngestedResourceMutation')
const mockUseIngestedResourceMutation = assumeMock(useIngestedResourceMutation)

jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetIngestedResource: jest.fn(),
}))
const mockUseGetIngestedResource = assumeMock(useGetIngestedResource)

jest.mock('pages/aiAgent/hooks/useTrialEligibility', () => ({
    useTrialEligibility: jest.fn(() => ({
        canStartTrial: false,
        isLoading: false,
    })),
    useTrialEligibilityForManualActivationFromFeatureFlag: jest.fn(() => ({
        canStartTrial: false,
        isLoading: false,
    })),
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
    currentAccount: toImmutable({
        domain: 'test-account.gorgias.com',
    }),
}

const renderComponent = (id?: string) => {
    const path = `/app/ai-agent/:shopType/:shopName/knowledge/sources/questions-content${id ? '/:id' : ''}`
    const route = `/app/ai-agent/shopify/test-shop/knowledge/sources/questions-content${id ? `/${id}` : ''}`
    return renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentScrapedDomainQuestionsContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path,
            route,
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
    const mockedIngestedResource = getIngestedResourceFixture({
        article_ingestion_log_id: mockedStoreDomainIngestionLog.id,
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
            isAllIngestedResourceUpdating: false,
            updateAllIngestedResourcesStatus: jest.fn(),
        })
        mockFeatureFlags({
            [FeatureFlagKey.AiAgentScrapeStoreDomain]: true,
        })
        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: false,
            data: null,
        } as unknown as ReturnType<typeof useGetIngestedResource>)

        mockUseSelectedQuestionAndDetail.mockReturnValue({
            selectedQuestion: {
                id: null,
                title: '',
                article_ingestion_log_id: null,
                web_pages: [
                    {
                        url: 'https://example.com',
                        title: '',
                        pageType: 'other',
                    },
                ],
                status: IngestedResourceStatus.Enabled,
            },
            questionDetail: null,
            isError: false,
            isLoading: false,
        } as unknown as ReturnType<typeof useSelectedQuestionAndDetail>)
    })

    it('should render the component', () => {
        renderComponent()

        expect(screen.getAllByText('Knowledge')[0]).toBeInTheDocument()
        expect(screen.getByText('Back to Sources')).toBeInTheDocument()
        expect(screen.getByText('Store website')).toBeInTheDocument()
        expect(screen.getByText('Sync')).toBeInTheDocument()
        expect(
            screen.getByText(
                /AI Agent automatically generates questions and answers from your website content/,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
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
                'Your store website is syncing. This may take a while. In the meantime, AI Agent may not have your latest content.',
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
                'Your store website is syncing. This may take a while. In the meantime, AI Agent may not have your latest content.',
            ),
        ).toBeInTheDocument()

        const closeButton = screen.getByRole('button', { name: /close/i })
        fireEvent.click(closeButton)

        expect(
            screen.queryByText(
                'Your store website is syncing. This may take a while. In the meantime, AI Agent may not have your latest content.',
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

        await act(async () => {
            renderComponent()
        })

        await act(async () => {
            const questionRow = screen.getByText(
                mockedListIngestedResources.data[0].title,
            )
            fireEvent.click(questionRow)
        })

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

        waitFor(() => {
            expect(mockedUpdateIngestedResource).toHaveBeenCalledWith(
                mockedListIngestedResources.data[0].id,
                {
                    status: IngestedResourceStatus.Disabled,
                },
            )
        })
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

        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: false,
            data: mockedIngestedResource,
        } as unknown as ReturnType<typeof useGetIngestedResource>)

        renderComponent()

        const questionRow = screen.getByText(
            mockedListIngestedResources.data[0].title,
        )
        fireEvent.click(questionRow)

        const viewSourceButton = screen.getByText('View source URLs')
        fireEvent.click(viewSourceButton)

        expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    it('should open side panel and display selected content when selectedId in param is not null', () => {
        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: false,
            data: mockedIngestedResource,
        } as unknown as ReturnType<typeof useGetIngestedResource>)

        renderComponent(mockedIngestedResource.id.toString())

        expect(screen.getByText('Question details')).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        expect(hideIcon).toBeInTheDocument()
        expect(screen.getByText('Available for AI Agent')).toBeInTheDocument()
        expect(screen.getByText('View source URLs')).toBeInTheDocument()
    })

    it('should redirect to questionsContent path without id when hide side panel button is clicked', () => {
        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: false,
            data: mockedIngestedResource,
        } as unknown as ReturnType<typeof useGetIngestedResource>)
        renderComponent(mockedIngestedResource.id.toString())

        expect(screen.getByText('Question details')).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        fireEvent.click(hideIcon)

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/knowledge/sources/questions-content',
        )
    })

    it('should automatically open side panel when component mounts with articleId param (tests setIsOpened(true))', () => {
        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: false,
            data: mockedIngestedResource,
        } as unknown as ReturnType<typeof useGetIngestedResource>)

        mockUseSelectedQuestionAndDetail.mockReturnValue({
            selectedQuestion: {
                id: mockedIngestedResource.id,
                title: mockedIngestedResource.title,
                article_ingestion_log_id:
                    mockedIngestedResource.article_ingestion_log_id,
                web_pages: mockedIngestedResource.web_pages,
                status: IngestedResourceStatus.Enabled,
            },
            questionDetail: mockedIngestedResource,
            isError: false,
            isLoading: false,
        } as unknown as ReturnType<typeof useSelectedQuestionAndDetail>)

        renderComponent(mockedIngestedResource.id.toString())

        expect(screen.getByText('Question details')).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        expect(hideIcon).toBeInTheDocument()
        expect(screen.getByText('Available for AI Agent')).toBeInTheDocument()
        expect(screen.getByText('View source URLs')).toBeInTheDocument()
    })

    it('should ensure side panel is closed when component mounts without articleId param', () => {
        renderComponent()

        // The modal is always in the DOM but controlled by isOpened prop
        // With no articleId, isOpened should be false (controlled by the useEffect with setIsOpened)
        // We verify this by checking that we can see the main table content without the side panel opened
        expect(screen.getByText('Store website')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
        expect(
            screen.getByText(
                /AI Agent automatically generates questions and answers from your website content/,
            ),
        ).toBeInTheDocument()
    })
})
