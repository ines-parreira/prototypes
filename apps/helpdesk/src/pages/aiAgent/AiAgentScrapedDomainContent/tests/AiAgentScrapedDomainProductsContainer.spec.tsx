// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toImmutable } from 'common/utils'
import type { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'
import { useGetEcommerceItemByExternalId } from 'models/ecommerce/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
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

import AiAgentScrapedDomainProductsContainer from '../AiAgentScrapedDomainProductsContainer'
import { IngestionLogStatus } from '../constant'
import {
    isProductExcludedFromAiAgent,
    usePaginatedProductIntegration,
} from '../hooks/usePaginatedProductIntegration'

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

jest.mock('../hooks/usePaginatedProductIntegration', () => ({
    isProductExcludedFromAiAgent: jest.fn(),
    usePaginatedProductIntegration: jest.fn(),
}))
const mockIsProductExcludedFromAiAgent = assumeMock(
    isProductExcludedFromAiAgent,
)
const mockUsePaginatedProductIntegration = assumeMock(
    usePaginatedProductIntegration,
)

jest.mock('models/ecommerce/queries')
const mockUseGetEcommerceItemByExternalId = assumeMock(
    useGetEcommerceItemByExternalId,
)

jest.mock('models/integration/queries', () => ({
    useGetProductsByIdsFromIntegration: jest.fn(),
}))
const mockUseGetProductsByIdsFromIntegration = assumeMock(
    useGetProductsByIdsFromIntegration,
)

jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)

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

const renderComponent = (id?: string) => {
    const path = `/app/ai-agent/:shopType/:shopName/knowledge/sources/products-content${id ? '/:id' : ''}`
    const route = `/app/ai-agent/shopify/test-shop/knowledge/sources/products-content${id ? `/${id}` : ''}`
    return renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentScrapedDomainProductsContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path,
            route,
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
        mockFeatureFlags({
            [FeatureFlagKey.AiAgentScrapeStoreDomain]: true,
        })
        mockUseFlag.mockImplementation(() => {
            return false
        })
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [],
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)
        mockIsProductExcludedFromAiAgent.mockReturnValue(false)
    })

    it('should render the component as Products tab in Knowledge section', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Products')).toBeInTheDocument()
        })

        expect(screen.getByText('Product')).toBeInTheDocument()
    })

    it('should render the component as a separate Products page', async () => {
        mockUseFlag.mockImplementation(() => {
            return false
        })

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Products')).toBeInTheDocument()
        })

        expect(screen.getByText('Product')).toBeInTheDocument()
    })

    it('should render empty state when storeDomainIngestionLog is undefined', async () => {
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

        await waitFor(() => {
            expect(
                screen.getByText('No products available'),
            ).toBeInTheDocument()
        })
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

        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Duo Baguette Birthstone Ring',
                    is_used_by_ai_agent: false,
                },
            ],
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)

        renderComponent()

        const productRow = screen.getAllByText(
            'Duo Baguette Birthstone Ring',
        )[0]
        fireEvent.click(productRow)

        await waitFor(() => {
            const hideIcon = screen.getByAltText('hide-view-icon')
            expect(hideIcon).toBeInTheDocument()
            expect(screen.getByText('In use by AI Agent')).toBeInTheDocument()
        })
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

        const { rerender } = renderComponent()

        const productRow = screen.getByText('Duo Baguette Birthstone Ring')
        fireEvent.click(productRow)

        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Duo Baguette Birthstone Ring',
                    is_used_by_ai_agent: true,
                },
            ],
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)

        rerender(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <AiAgentScrapedDomainProductsContainer />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getAllByText('Duo Baguette Birthstone Ring').length,
        ).toBeGreaterThan(1)
        expect(screen.getByText('In use by AI Agent')).toBeInTheDocument()
    })

    it('should open side panel and display selected content when selectedId in param is not null', async () => {
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Duo Baguette Birthstone Ring',
                },
            ],
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)

        renderComponent('1')

        await waitFor(() => {
            expect(
                screen.getAllByText('Duo Baguette Birthstone Ring').length,
            ).toBeGreaterThan(0)
        })

        const hideIcon = screen.getByAltText('hide-view-icon')
        expect(hideIcon).toBeInTheDocument()
        expect(screen.getByText('Shopify app')).toBeInTheDocument()
    })

    it('should redirect to products path without id when hide side panel button is clicked', async () => {
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Duo Baguette Birthstone Ring',
                },
            ],
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)

        renderComponent('1')

        await waitFor(() => {
            expect(
                screen.getAllByText('Duo Baguette Birthstone Ring').length,
            ).toBeGreaterThan(0)
        })

        const hideIcon = screen.getByAltText('hide-view-icon')
        fireEvent.click(hideIcon)

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/products',
        )
    })

    it('should redirect to Products page path without id when hide side panel button is clicked', async () => {
        mockUseFlag.mockImplementation(() => {
            return false
        })

        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Duo Baguette Birthstone Ring',
                },
            ],
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)

        renderComponent('1')

        await waitFor(() => {
            expect(
                screen.getAllByText('Duo Baguette Birthstone Ring').length,
            ).toBeGreaterThan(0)
        })

        expect(screen.getByText('Shopify app')).toBeInTheDocument()
        expect(
            screen.getByText(
                'This information syncs automatically from your Shopify product catalog.',
            ),
        ).toBeInTheDocument()
        const hideIcon = screen.getByAltText('hide-view-icon')
        fireEvent.click(hideIcon)

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/products',
        )
    })
})
