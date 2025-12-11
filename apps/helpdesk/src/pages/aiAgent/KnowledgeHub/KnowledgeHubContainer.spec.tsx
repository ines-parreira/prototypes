import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useHistory, useParams } from 'react-router-dom'
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

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useHistory: jest.fn(),
}))

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

// Global variables to capture the onClose callbacks
let capturedGuidanceEditorOnClose: (() => void) | null = null
let capturedFaqEditorOnClose: (() => void) | null = null
let capturedSnippetEditorOnClose: (() => void) | null = null

jest.mock('pages/aiAgent/KnowledgeHub/EditorWrappers', () => ({
    GuidanceEditorWrapper: ({ isOpen, onClose }: any) => {
        if (isOpen && onClose) {
            capturedGuidanceEditorOnClose = onClose
        }
        return isOpen ? (
            <div data-testid="guidance-editor-wrapper">
                <button onClick={onClose} data-testid="guidance-editor-close">
                    Close
                </button>
            </div>
        ) : null
    },
    FaqEditorWrapper: ({ isOpen, onClose }: any) => {
        if (isOpen && onClose) {
            capturedFaqEditorOnClose = onClose
        }
        return isOpen ? (
            <div data-testid="faq-editor-wrapper">
                <button onClick={onClose} data-testid="faq-editor-close">
                    Close
                </button>
            </div>
        ) : null
    },
}))

jest.mock(
    'pages/aiAgent/KnowledgeHub/EditorWrappers/SnippetEditorWrapper',
    () => ({
        SnippetEditorWrapper: ({ isOpen, onClose }: any) => {
            if (isOpen && onClose) {
                capturedSnippetEditorOnClose = onClose
            }
            return isOpen ? (
                <div data-testid="snippet-editor-wrapper">
                    <button
                        onClick={onClose}
                        data-testid="snippet-editor-close"
                    >
                        Close
                    </button>
                </div>
            ) : null
        },
    }),
)
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
    KnowledgeHubTable: ({
        data,
        onRowClick,
        selectedFolder,
        shopName,
    }: any) => (
        <div>
            <span data-testid="table-shop-name">{shopName || 'no-shop'}</span>
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

const mockUseParams = useParams as jest.Mock
const mockUseHistory = useHistory as jest.Mock
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

        mockUseParams.mockReturnValue({
            shopType: 'shopify',
            type: undefined,
            id: undefined,
        })

        // Don't mock useHistory by default - let it use the real implementation from MemoryRouter
        mockUseHistory.mockImplementation(() => {
            const actual = jest.requireActual('react-router-dom')
            const { useHistory: actualUseHistory } = actual
            return actualUseHistory()
        })

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
                return articles.map((article: any) => {
                    const isGroupableType =
                        article.type === KnowledgeType.Domain ||
                        article.type === KnowledgeType.URL ||
                        article.type === KnowledgeType.Document
                    return {
                        id: article.id,
                        title: article.title,
                        type: article.type,
                        lastUpdatedAt: article.lastUpdatedAt,
                        inUseByAI:
                            article.visibilityStatus === 'public'
                                ? KnowledgeVisibility.PUBLIC
                                : KnowledgeVisibility.UNLISTED,
                        source: article.source,
                        isGrouped: isGroupableType,
                    }
                })
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

        it('passes shopName to KnowledgeHubTable when extracted from URL', () => {
            const routeShopName = 'test-shop-url'
            mockExtractShopNameFromUrl.mockReturnValue(routeShopName)

            renderComponent()

            expect(screen.getByTestId('table-shop-name')).toHaveTextContent(
                'test-shop-url',
            )
        })

        it('passes shopName to KnowledgeHubTable when using first integration', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(screen.getByTestId('table-shop-name')).toHaveTextContent(
                'store-alpha',
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
                            source: 'https://example.com',
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
                            source: 'https://example.com',
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

        it('initializes folder from URL parameter with URL as title initially', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [],
                },
                isInitialLoading: true,
                refetch: jest.fn(),
            })

            const folderUrl = 'https://example.com/folder'

            render(
                <MemoryRouter
                    initialEntries={[
                        '/knowledge?folder=' + encodeURIComponent(folderUrl),
                    ]}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(screen.getByTestId('folder-view')).toBeInTheDocument()
            expect(
                screen.getByText(`Viewing folder: ${folderUrl}`),
            ).toBeInTheDocument()
        })

        it('displays folder URL as title when folder not found in tableData', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            const folderUrl = 'https://example.com/unknown-folder'

            render(
                <MemoryRouter
                    initialEntries={[
                        '/knowledge?folder=' + encodeURIComponent(folderUrl),
                    ]}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(screen.getByTestId('folder-view')).toBeInTheDocument()
            expect(
                screen.getByText(`Viewing folder: ${folderUrl}`),
            ).toBeInTheDocument()
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
                            source: 'https://store.example.com',
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
                            source: 'https://store.example.com',
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

    describe('URL parameter decoding', () => {
        it('handles decoding errors gracefully', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            const invalidEncodedUrl = '%E0%A4%A'

            render(
                <MemoryRouter
                    initialEntries={['/knowledge?folder=' + invalidEncodedUrl]}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // reportError logs the error in development
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error extra:',
                expect.objectContaining({
                    original: expect.any(String),
                    error: expect.any(String),
                }),
            )

            consoleErrorSpy.mockRestore()
        })

        it('handles malformed encoding that cannot be decoded further', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            const partiallyEncodedUrl = 'https://example.com/test%20space'

            render(
                <MemoryRouter
                    initialEntries={[
                        '/knowledge?folder=' +
                            encodeURIComponent(partiallyEncodedUrl),
                    ]}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(screen.getByTestId('folder-view')).toBeInTheDocument()
        })

        it('handles properly encoded URLs', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            const normalUrl = 'https://example.com/path'

            render(
                <MemoryRouter
                    initialEntries={[
                        '/knowledge?folder=' + encodeURIComponent(normalUrl),
                    ]}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(screen.getByTestId('folder-view')).toBeInTheDocument()
            expect(
                screen.getByText(`Viewing folder: ${normalUrl}`),
            ).toBeInTheDocument()
        })
    })

    describe('opening editors based on URL parameters', () => {
        let mockGuidanceEditor: any
        let mockFaqEditor: any
        let mockSnippetEditor: any

        beforeEach(() => {
            mockGuidanceEditor = {
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
            }

            mockFaqEditor = {
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
            }

            mockSnippetEditor = {
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
            }

            mockUseKnowledgeHubGuidanceEditor.mockReturnValue(
                mockGuidanceEditor,
            )
            mockUseKnowledgeHubFaqEditor.mockReturnValue(mockFaqEditor)
            mockUseKnowledgeHubSnippetEditor.mockReturnValue(mockSnippetEditor)
        })

        it('opens guidance editor when type is guidance and id is valid', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Guidance,
                id: '123',
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/guidance/123']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockGuidanceEditor.openEditorForEdit).toHaveBeenCalledWith(
                123,
            )
        })

        it('opens FAQ editor when type is faq and id is valid', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.FAQ,
                id: '456',
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/faq/456']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockFaqEditor.openEditorForEdit).toHaveBeenCalledWith(456)
        })

        it('opens snippet editor for document type', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Document,
                id: '789',
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/document/789']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockSnippetEditor.openEditorForEdit).toHaveBeenCalledWith(
                789,
                KnowledgeType.Document,
            )
        })

        it('opens snippet editor for URL type', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.URL,
                id: '111',
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/url/111']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockSnippetEditor.openEditorForEdit).toHaveBeenCalledWith(
                111,
                KnowledgeType.URL,
            )
        })

        it('opens snippet editor for domain type', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Domain,
                id: '222',
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/domain/222']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockSnippetEditor.openEditorForEdit).toHaveBeenCalledWith(
                222,
                KnowledgeType.Domain,
            )
        })

        it('does not open editor when id is NaN', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Guidance,
                id: 'invalid',
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/guidance/invalid']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockGuidanceEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockFaqEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockSnippetEditor.openEditorForEdit).not.toHaveBeenCalled()
        })

        it('does not open editor when type is missing', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: undefined,
                id: '123',
            })

            render(
                <MemoryRouter initialEntries={['/knowledge']} initialIndex={0}>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockGuidanceEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockFaqEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockSnippetEditor.openEditorForEdit).not.toHaveBeenCalled()
        })

        it('does not open editor when id is missing', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Guidance,
                id: undefined,
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/guidance']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockGuidanceEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockFaqEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockSnippetEditor.openEditorForEdit).not.toHaveBeenCalled()
        })

        it('does not open editor for unknown type', () => {
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: 'unknown' as any,
                id: '123',
            })

            render(
                <MemoryRouter
                    initialEntries={['/knowledge/unknown/123']}
                    initialIndex={0}
                >
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockGuidanceEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockFaqEditor.openEditorForEdit).not.toHaveBeenCalled()
            expect(mockSnippetEditor.openEditorForEdit).not.toHaveBeenCalled()
        })
    })

    describe('closing editors', () => {
        it('calls history.push and knowledgeEditorProps.onClose when guidance editor is closed', () => {
            const mockPush = jest.fn()
            const mockOnClose = jest.fn()

            const guidanceEditorMock = {
                isEditorOpen: true,
                currentGuidanceArticleId: 123,
                guidanceMode: 'edit' as const,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: jest.fn(),
                knowledgeEditorProps: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    guidanceArticleId: 123,
                    guidanceTemplate: undefined,
                    guidanceMode: 'edit' as const,
                    isOpen: true,
                    onClose: mockOnClose,
                    onCreate: jest.fn(),
                    onUpdate: jest.fn(),
                    onDelete: jest.fn(),
                    onClickPrevious: undefined,
                    onClickNext: undefined,
                },
            }

            // Reset the captured callback
            capturedGuidanceEditorOnClose = null

            // Override useHistory mock
            mockUseHistory.mockImplementation(() => ({
                push: mockPush,
                replace: jest.fn(),
                goBack: jest.fn(),
                goForward: jest.fn(),
                go: jest.fn(),
                block: jest.fn(),
                listen: jest.fn(),
                createHref: jest.fn(),
                location: {
                    pathname: '/app',
                    search: '',
                    hash: '',
                    state: null,
                },
                action: 'PUSH' as const,
                length: 1,
            }))

            // Override guidance editor mock
            mockUseKnowledgeHubGuidanceEditor.mockReset()
            mockUseKnowledgeHubGuidanceEditor.mockReturnValue(
                guidanceEditorMock,
            )

            render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify the onClose callback was captured
            expect(capturedGuidanceEditorOnClose).not.toBeNull()

            // Call the captured onClose callback directly
            const onClose = capturedGuidanceEditorOnClose
            if (onClose) {
                const onCloseF = onClose as () => void
                onCloseF()
            }

            // Verify both functions were called
            expect(mockPush).toHaveBeenCalledTimes(1)
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringMatching(/\/ai-agent\/.*\/knowledge/),
            )
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('calls history.push and faqEditor.closeEditor when FAQ editor is closed', () => {
            const mockPush = jest.fn()
            const mockCloseEditor = jest.fn()

            const faqEditorMock = {
                isEditorOpen: true,
                currentArticleId: 456,
                faqArticleMode: 'edit' as const,
                initialArticleMode: 'READ' as const,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: mockCloseEditor,
                handleCreate: jest.fn(),
                handleUpdate: jest.fn(),
                handleDelete: jest.fn(),
                handleClickPrevious: jest.fn(),
                handleClickNext: jest.fn(),
            }

            // Reset the captured callback
            capturedFaqEditorOnClose = null

            // Override useHistory mock
            mockUseHistory.mockImplementation(() => ({
                push: mockPush,
                replace: jest.fn(),
                goBack: jest.fn(),
                goForward: jest.fn(),
                go: jest.fn(),
                block: jest.fn(),
                listen: jest.fn(),
                createHref: jest.fn(),
                location: {
                    pathname: '/app',
                    search: '',
                    hash: '',
                    state: null,
                },
                action: 'PUSH' as const,
                length: 1,
            }))

            // Override FAQ editor mock
            mockUseKnowledgeHubFaqEditor.mockReset()
            mockUseKnowledgeHubFaqEditor.mockReturnValue(faqEditorMock)

            render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify the onClose callback was captured
            expect(capturedFaqEditorOnClose).not.toBeNull()

            // Call the captured onClose callback directly
            const onClose = capturedFaqEditorOnClose
            if (onClose) {
                const onCloseF = onClose as () => void
                onCloseF()
            }

            // Verify both functions were called
            expect(mockPush).toHaveBeenCalledTimes(1)
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringMatching(/\/ai-agent\/.*\/knowledge/),
            )
            expect(mockCloseEditor).toHaveBeenCalledTimes(1)
        })

        it('calls history.push and snippetEditor.closeEditor when snippet editor is closed', () => {
            const mockPush = jest.fn()
            const mockCloseEditor = jest.fn()

            const snippetEditorMock = {
                isEditorOpen: true,
                currentArticleId: 123,
                currentSnippetType: KnowledgeType.Document,
                openEditorForEdit: jest.fn(),
                closeEditor: mockCloseEditor,
                handleUpdate: jest.fn(),
                hasPrevious: false,
                hasNext: false,
                handleClickPrevious: jest.fn(),
                handleClickNext: jest.fn(),
            }

            // Reset the captured callback
            capturedSnippetEditorOnClose = null

            // Override useHistory mock
            mockUseHistory.mockImplementation(() => ({
                push: mockPush,
                replace: jest.fn(),
                goBack: jest.fn(),
                goForward: jest.fn(),
                go: jest.fn(),
                block: jest.fn(),
                listen: jest.fn(),
                createHref: jest.fn(),
                location: {
                    pathname: '/app',
                    search: '',
                    hash: '',
                    state: null,
                },
                action: 'PUSH' as const,
                length: 1,
            }))

            // Override snippet editor mock
            mockUseKnowledgeHubSnippetEditor.mockReset()
            mockUseKnowledgeHubSnippetEditor.mockReturnValue(snippetEditorMock)

            render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify the onClose callback was captured
            expect(capturedSnippetEditorOnClose).not.toBeNull()

            // Call the captured onClose callback directly
            const onClose = capturedSnippetEditorOnClose
            if (onClose) {
                const onCloseF = onClose as () => void
                onCloseF()
            }

            // Verify both functions were called
            expect(mockPush).toHaveBeenCalledTimes(1)
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringMatching(/\/ai-agent\/.*\/knowledge/),
            )
            expect(mockCloseEditor).toHaveBeenCalledTimes(1)
        })
    })
})
