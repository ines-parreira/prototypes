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
import { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'
import { useGetEcommerceItemByExternalId } from 'models/ecommerce/queries'
import { getIngestionLogFixture } from 'pages/aiAgent/fixtures/ingestionLog.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { usePollStoreDomainIngestionLog } from 'pages/aiAgent/hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from 'pages/aiAgent/hooks/useSyncStoreDomain'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import AiAgentScrapedDomainProductsContainer from '../AiAgentScrapedDomainProductsContainer'
import { IngestionLogStatus } from '../constant'
import { usePaginatedProductIntegration } from '../hooks/usePaginatedProductIntegration'

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

jest.mock('../hooks/usePaginatedProductIntegration')
const mockUsePaginatedProductIntegration = assumeMock(
    usePaginatedProductIntegration,
)

jest.mock('models/ecommerce/queries')
const mockUseGetEcommerceItemByExternalId = assumeMock(
    useGetEcommerceItemByExternalId,
)

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const defaultState = {
    billing: toImmutable({
        products: [],
    }),
    integrations: toImmutable({
        integrations: [],
    }),
}

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
    const mockedStoreName = 'test-shop'
    const mockedStoreDomain = `${mockedStoreName}.myshopify.com`
    const mockedStoreUrl = `https://${mockedStoreName}.myshopify.com`
    const mockedStoreDomainIngestionLog = getIngestionLogFixture({
        domain: mockedStoreDomain,
        url: mockedStoreUrl,
    })
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
        mockUsePaginatedProductIntegration.mockReturnValue({
            itemsData: [],
            isLoading: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
            isError: false,
            fetchPrev: jest.fn(),
            items: [],
        })
        mockUseGetEcommerceItemByExternalId.mockReturnValue({
            data: null,
            isLoading: false,
        } as any)
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
                'AI Agent uses product details from your Shopify app and store website.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Product')).toBeInTheDocument()
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

        expect(screen.getByText('No products available')).toBeInTheDocument()
    })

    it('should open side panel on row click (handleOnSelect)', async () => {
        mockUsePaginatedProductIntegration.mockReturnValue({
            itemsData: [
                {
                    id: 1,
                    title: 'Duo Baguette Birthstone Ring',
                    is_used_by_ai_agent: false,
                } as ProductWithAiAgentStatus,
            ],
            isLoading: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
            isError: false,
            fetchPrev: jest.fn(),
            items: [],
        })

        renderComponent()

        const productRow = screen.getByText('Duo Baguette Birthstone Ring')
        fireEvent.click(productRow)

        expect(screen.getByText('Product details')).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        expect(hideIcon).toBeInTheDocument()
        expect(screen.getByText('Not in use by AI Agent')).toBeInTheDocument()
    })

    it('should be used by AI Agent', async () => {
        mockUsePaginatedProductIntegration.mockReturnValue({
            itemsData: [
                {
                    id: 1,
                    title: 'Duo Baguette Birthstone Ring',
                    is_used_by_ai_agent: true,
                } as ProductWithAiAgentStatus,
            ],
            isLoading: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
            isError: false,
            fetchPrev: jest.fn(),
            items: [],
        })

        renderComponent()

        const productRow = screen.getByText('Duo Baguette Birthstone Ring')
        fireEvent.click(productRow)

        expect(screen.getByText('Product details')).toBeInTheDocument()
        expect(screen.getByText('In use by AI Agent')).toBeInTheDocument()
    })
})
