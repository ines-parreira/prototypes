import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import type { Store } from 'redux'

import { appQueryClient } from 'api/queryClient'
import useAppSelector from 'hooks/useAppSelector'
import {
    useGetHelpCenterList,
    useGetHelpCenterListMulti,
    useGetKnowledgeHubArticles,
} from 'models/helpCenter/queries'
import {
    OPEN_SYNC_URL_MODAL,
    OPEN_SYNC_WEBSITE_MODAL,
    REFETCH_KNOWLEDGE_HUB_TABLE,
} from 'pages/aiAgent/KnowledgeHub/constants'
import { dispatchDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { useKnowledgeHubFaqEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubFaqEditor'
import { useKnowledgeHubGuidanceEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubGuidanceEditor'
import { useKnowledgeHubSnippetEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubSnippetEditor'
import { KnowledgeHubContainer } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubContainer'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import { transformKnowledgeHubArticlesToKnowledgeItems } from 'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import {
    getCurrentAccountId,
    getCurrentAccountState,
} from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('models/helpCenter/queries', () => ({
    useGetKnowledgeHubArticles: jest.fn(),
    useGetHelpCenterList: jest.fn(),
    useGetHelpCenterListMulti: jest.fn(),
    useGetHelpCenterCategoryTree: jest.fn(),
    useStartIngestion: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isPending: false,
    })),
    useStartArticleIngestion: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isPending: false,
    })),
    useDeleteArticleIngestionLog: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isPending: false,
    })),
    useDeleteFileIngestion: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isPending: false,
    })),
    useGetIngestionLogs: jest.fn(() => ({
        data: [],
        error: null,
        isLoading: false,
    })),
    useGetFileIngestion: jest.fn(() => ({
        data: { data: [] },
        error: null,
        isLoading: false,
    })),
    useCreateFileIngestion: jest.fn(() => ({
        mutateAsync: jest.fn(),
    })),
    helpCenterKeys: {
        ingestionLogs: jest.fn(),
        articleIngestionLogs: jest.fn(),
        articleIngestionLogsListRoot: jest.fn(),
        fileIngestions: jest.fn(),
        knowledgeStatus: jest.fn(),
    },
}))
jest.mock('pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles')
jest.mock('pages/aiAgent/hooks/useGetStoreDomainIngestionLog', () => ({
    useGetStoreDomainIngestionLog: jest.fn(() => ({
        status: null,
        storeDomainIngestionLog: undefined,
        isGetIngestionLogsLoading: false,
    })),
}))
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubGuidanceEditor')
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubFaqEditor')
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubSnippetEditor')
jest.mock('pages/aiAgent/KnowledgeHub/EditorWrappers', () => ({
    GuidanceEditorWrapper: ({ isOpen }: any) =>
        isOpen ? <div data-testid="guidance-editor-wrapper" /> : null,
    FaqEditorWrapper: ({ isOpen }: any) =>
        isOpen ? <div data-testid="faq-editor-wrapper" /> : null,
    SnippetEditorWrapper: ({ isOpen }: any) =>
        isOpen ? <div data-testid="snippet-editor-wrapper" /> : null,
}))
jest.mock(
    'pages/aiAgent/KnowledgeHub/EmptyState/AddGuidanceTemplateModal',
    () => ({
        AddGuidanceTemplateModal: ({ onTemplateSelect }: any) => (
            <div data-testid="add-guidance-modal">
                <button
                    onClick={() =>
                        onTemplateSelect({ id: 1, name: 'Test Template' })
                    }
                >
                    Select Template
                </button>
                <button onClick={() => onTemplateSelect(undefined)}>
                    Custom Guidance
                </button>
            </div>
        ),
    }),
)
jest.mock('@gorgias/knowledge-service-queries', () => ({
    useStartIngestion: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isPending: false,
    })),
}))
jest.mock('pages/aiAgent/KnowledgeHub/DocumentFilters/DocumentFilters', () => ({
    DocumentFilters: ({ selectedFilter, onFilterChange }: any) => (
        <div>
            <button onClick={() => onFilterChange('document')}>
                Document Filter
            </button>
            <button onClick={() => onFilterChange('guidance')}>
                Guidance Filter
            </button>
            <span>Selected: {selectedFilter || 'none'}</span>
        </div>
    ),
}))
jest.mock(
    'pages/aiAgent/KnowledgeHub/EmptyState/HelpCenterSelectModal',
    () => ({
        HelpCenterSelectModal: () => (
            <div data-testid="help-center-select-modal" />
        ),
    }),
)
jest.mock(
    'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/KnowledgeHubHeader',
    () => ({
        KnowledgeHubHeader: ({
            onAddKnowledge,
            onBack,
            onSync,
            onDelete,
            data,
        }: any) => (
            <div>
                <button onClick={onAddKnowledge}>Add Knowledge</button>
                {data && <button onClick={onBack}>Back</button>}
                {data && <button onClick={onSync}>Sync</button>}
                {data && <button onClick={onDelete}>Delete</button>}
            </div>
        ),
    }),
)
jest.mock('pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable', () => ({
    KnowledgeHubTable: ({ data, onRowClick, selectedFolder }: any) => (
        <div>
            {!selectedFolder &&
                data.length > 0 &&
                data.map((item: any) => (
                    <div
                        key={item.id}
                        onClick={() => onRowClick(item)}
                        data-testid={`row-${item.id}`}
                    >
                        {item.title}
                    </div>
                ))}
            {!selectedFolder && data.length === 0 && (
                <div data-testid="empty-state">Empty State</div>
            )}
            {selectedFolder && (
                <div data-testid="folder-view">
                    Viewing folder: {selectedFolder.title}
                </div>
            )}
        </div>
    ),
}))

const mockUseAppSelector = useAppSelector as jest.Mock
const mockExtractShopNameFromUrl = extractShopNameFromUrl as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetKnowledgeHubArticles = useGetKnowledgeHubArticles as jest.Mock
const mockUseGetHelpCenterList = useGetHelpCenterList as jest.Mock
const mockUseGetHelpCenterListMulti = useGetHelpCenterListMulti as jest.Mock
const mockUseKnowledgeHubGuidanceEditor =
    useKnowledgeHubGuidanceEditor as jest.Mock
const mockUseKnowledgeHubFaqEditor = useKnowledgeHubFaqEditor as jest.Mock
const mockUseKnowledgeHubSnippetEditor =
    useKnowledgeHubSnippetEditor as jest.Mock
const mockTransformKnowledgeHubArticlesToKnowledgeItems =
    transformKnowledgeHubArticlesToKnowledgeItems as jest.Mock

describe('KnowledgeHubContainer', () => {
    const mockShopifyIntegrations = [
        {
            id: 1,
            name: 'Store Alpha',
            type: 'shopify',
            meta: { shop_name: 'store-alpha' },
        },
        {
            id: 2,
            name: 'Store Beta',
            type: 'shopify',
            meta: { shop_name: 'store-beta' },
        },
    ]

    const originalLocation = window.location

    const mocksStore = {
        getState: () => ({}),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
        replaceReducer: jest.fn(),
    } as unknown as Store

    beforeEach(() => {
        jest.clearAllMocks()
        delete (window as any).location
        window.location = {
            href: 'http://localhost/app',
            pathname: '/app',
        } as Location

        mockExtractShopNameFromUrl.mockReturnValue(undefined)

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return 123
            if (selector === getShopifyIntegrationsSortedByName)
                return mockShopifyIntegrations
            if (selector === getCurrentAccountState)
                return {
                    get: (key: string) => {
                        if (key === 'domain') return 'test-domain.com'
                        return undefined
                    },
                }
            return fromJS({
                id: 1,
                name: 'Store Alpha',
                type: 'shopify',
                meta: {
                    shop_name: 'store-alpha',
                    shop_domain: 'store-alpha.myshopify.com',
                },
            })
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 1,
                snippetHelpCenterId: 2,
                helpCenterId: 3,
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockUseGetKnowledgeHubArticles.mockReturnValue({
            data: { articles: [] },
            isInitialLoading: false,
            refetch: jest.fn(),
        })

        mockUseGetHelpCenterList.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
        })

        mockUseGetHelpCenterListMulti.mockReturnValue({
            data: [],
            isLoading: false,
        })

        mockTransformKnowledgeHubArticlesToKnowledgeItems.mockImplementation(
            (articles) => {
                return articles.map((article: any) => ({
                    id: article.id,
                    title: article.title,
                    type: article.type,
                    lastUpdatedAt: article.lastUpdatedAt,
                    inUseByAI:
                        article.visibilityStatus === 'public'
                            ? KnowledgeVisibility.PUBLIC
                            : KnowledgeVisibility.UNLISTED,
                    source: article.source,
                }))
            },
        )

        mockUseKnowledgeHubGuidanceEditor.mockReturnValue({
            isEditorOpen: false,
            currentGuidanceArticleId: undefined,
            guidanceMode: 'create',
            openEditorForCreate: jest.fn(),
            openEditorForEdit: jest.fn(),
            closeEditor: jest.fn(),
            knowledgeEditorProps: {
                shopName: 'store-alpha',
                shopType: 'shopify',
                guidanceArticleId: undefined,
                guidanceTemplate: undefined,
                guidanceMode: 'create',
                isOpen: false,
                onClose: jest.fn(),
                onCreate: jest.fn(),
                onUpdate: jest.fn(),
                onDelete: jest.fn(),
                onClickPrevious: undefined,
                onClickNext: undefined,
            },
        })

        mockUseKnowledgeHubFaqEditor.mockReturnValue({
            isEditorOpen: false,
            currentArticleId: undefined,
            faqArticleMode: 'new',
            initialArticleMode: 'READ',
            openEditorForCreate: jest.fn(),
            openEditorForEdit: jest.fn(),
            closeEditor: jest.fn(),
            handleCreate: jest.fn(),
            handleUpdate: jest.fn(),
            handleDelete: jest.fn(),
            handleClickPrevious: jest.fn(),
            handleClickNext: jest.fn(),
        })

        mockUseKnowledgeHubSnippetEditor.mockReturnValue({
            isEditorOpen: false,
            currentArticleId: undefined,
            currentSnippetType: undefined,
            openEditorForEdit: jest.fn(),
            closeEditor: jest.fn(),
            handleUpdate: jest.fn(),
            hasPrevious: false,
            hasNext: false,
            handleClickPrevious: jest.fn(),
            handleClickNext: jest.fn(),
        })
    })

    afterEach(() => {
        window.location = originalLocation
    })

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Provider store={mocksStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <KnowledgeHubContainer />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )
    }

    describe('rendering', () => {
        it('renders the container with all main components', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(screen.getByText('Document Filter')).toBeInTheDocument()
            expect(screen.getByText('Selected: none')).toBeInTheDocument()
        })

        it('renders empty state when no data', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(screen.getByTestId('empty-state')).toBeInTheDocument()
        })

        it('renders table with data when articles are present', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Article',
                            type: 'guidance',
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            expect(screen.getByText('Test Article')).toBeInTheDocument()
        })
    })

    describe('shop name resolution', () => {
        it('extracts shop name from URL when available', () => {
            const routeShopName = 'my-shop-from-url'
            mockExtractShopNameFromUrl.mockReturnValue(routeShopName)

            renderComponent()

            expect(mockExtractShopNameFromUrl).toHaveBeenCalledWith(
                window.location.href,
            )
        })

        it('uses first Shopify integration shop name when URL extraction returns undefined', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(mockUseAppSelector).toHaveBeenCalled()
        })

        it('prefers URL shop name over first integration when both exist', () => {
            const routeShopName = 'url-shop'
            mockExtractShopNameFromUrl.mockReturnValue(routeShopName)

            renderComponent()

            expect(mockExtractShopNameFromUrl).toHaveBeenCalledWith(
                window.location.href,
            )
        })
    })

    describe('filtering', () => {
        it('updates filter when filter button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(screen.getByText('Selected: none')).toBeInTheDocument()

            await act(() => user.click(screen.getByText('Document Filter')))

            await waitFor(() => {
                expect(
                    screen.getByText('Selected: document'),
                ).toBeInTheDocument()
            })
        })

        it('can switch between different filters', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByText('Document Filter')))
            await waitFor(() => {
                expect(
                    screen.getByText('Selected: document'),
                ).toBeInTheDocument()
            })

            await act(() => user.click(screen.getByText('Guidance Filter')))
            await waitFor(() => {
                expect(
                    screen.getByText('Selected: guidance'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('loading state', () => {
        it('passes loading state to table component', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: undefined,
                isInitialLoading: true,
                refetch: jest.fn(),
            })

            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Create new content' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('data fetching', () => {
        it('fetches articles with correct parameters', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                {
                    account_id: 123,
                    guidance_help_center_id: 1,
                    snippet_help_center_id: 2,
                    faq_help_center_id: 3,
                },
                {
                    enabled: true,
                },
            )
        })

        it('waits for store configuration before fetching articles', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: null,
                isLoading: true,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })
    })

    describe('modal behavior', () => {
        it('opens Add Knowledge modal when Add Knowledge button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Add knowledge' }),
            ).not.toBeInTheDocument()

            await act(() => user.click(screen.getByText('Add Knowledge')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Add knowledge' }),
                ).toBeInTheDocument()
            })
        })

        it('closes Add Knowledge modal when OPEN_SYNC_WEBSITE_MODAL event is dispatched', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByText('Add Knowledge')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Add knowledge' }),
                ).toBeInTheDocument()
            })

            dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Add knowledge' }),
                ).not.toBeInTheDocument()
            })
        })

        it('keeps modal closed when OPEN_SYNC_WEBSITE_MODAL is dispatched and modal was not open', () => {
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Add knowledge' }),
            ).not.toBeInTheDocument()

            dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)

            expect(
                screen.queryByRole('heading', { name: 'Add knowledge' }),
            ).not.toBeInTheDocument()
        })

        it('closes Add Knowledge modal when modal open state changes to false', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByText('Add Knowledge')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Add knowledge' }),
                ).toBeInTheDocument()
            })

            await act(() => user.keyboard('{Escape}'))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Add knowledge' }),
                ).not.toBeInTheDocument()
            })
        })

        it('closes Add Knowledge modal when OPEN_SYNC_URL_MODAL event is dispatched', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByText('Add Knowledge')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Add knowledge' }),
                ).toBeInTheDocument()
            })

            dispatchDocumentEvent(OPEN_SYNC_URL_MODAL)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Add knowledge' }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('event handling', () => {
        it('refetches data when REFETCH_KNOWLEDGE_HUB_TABLE event is dispatched', () => {
            const mockRefetch = jest.fn()
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: { articles: [] },
                isInitialLoading: false,
                refetch: mockRefetch,
            })

            renderComponent()

            dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)

            expect(mockRefetch).toHaveBeenCalled()
        })
    })

    describe('folder navigation', () => {
        it('selects folder when clicking on a table row', async () => {
            const user = userEvent.setup()
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Folder',
                            type: KnowledgeType.Domain,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            expect(screen.queryByTestId('folder-view')).not.toBeInTheDocument()

            await act(() => user.click(screen.getByText('Test Folder')))

            await waitFor(() => {
                expect(screen.getByTestId('folder-view')).toBeInTheDocument()
            })
        })

        it('clears selected folder when back button is clicked', async () => {
            const user = userEvent.setup()
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Folder',
                            type: KnowledgeType.Domain,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            await act(() => user.click(screen.getByText('Test Folder')))

            await waitFor(() => {
                expect(screen.getByTestId('folder-view')).toBeInTheDocument()
            })

            await act(() => user.click(screen.getByText('Back')))

            await waitFor(() => {
                expect(
                    screen.queryByTestId('folder-view'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('sync functionality', () => {
        it('opens sync store website modal when sync is clicked for Domain folder', async () => {
            const user = userEvent.setup()
            const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent')

            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Store Website',
                            type: KnowledgeType.Domain,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            await act(() => user.click(screen.getByText('Store Website')))

            await waitFor(() => {
                expect(screen.getByText('Sync')).toBeInTheDocument()
            })

            await act(() => user.click(screen.getByText('Sync')))

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OPEN_SYNC_WEBSITE_MODAL,
                }),
            )

            mockDispatchEvent.mockRestore()
        })

        it('opens URL modal when sync is clicked for URL folder', async () => {
            const user = userEvent.setup()
            const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent')

            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test URL',
                            type: KnowledgeType.URL,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                            source: 'https://example.com',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            await act(() => user.click(screen.getByText('Test URL')))

            await waitFor(() => {
                expect(screen.getByText('Sync')).toBeInTheDocument()
            })

            await act(() => user.click(screen.getByText('Sync')))

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OPEN_SYNC_URL_MODAL,
                }),
            )

            mockDispatchEvent.mockRestore()
        })
    })

    describe('delete functionality', () => {
        it('opens delete URL modal when delete is clicked for URL folder', async () => {
            const user = userEvent.setup()
            const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent')

            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test URL',
                            type: KnowledgeType.URL,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                            source: 'https://example.com',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            await act(() => user.click(screen.getByText('Test URL')))

            await waitFor(() => {
                expect(screen.getByText('Delete')).toBeInTheDocument()
            })

            await act(() => user.click(screen.getByText('Delete')))

            expect(mockDispatchEvent).toHaveBeenCalled()

            mockDispatchEvent.mockRestore()
        })

        it('does not open delete modal when folder is not URL type', async () => {
            const user = userEvent.setup()
            const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent')

            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Store Website',
                            type: KnowledgeType.Domain,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            await act(() => user.click(screen.getByText('Store Website')))

            await waitFor(() => {
                expect(screen.getByText('Delete')).toBeInTheDocument()
            })

            const deleteCallsBefore = mockDispatchEvent.mock.calls.length

            await act(() => user.click(screen.getByText('Delete')))

            const deleteCallsAfter = mockDispatchEvent.mock.calls.length
            expect(deleteCallsAfter).toBe(deleteCallsBefore)

            mockDispatchEvent.mockRestore()
        })
    })
})
