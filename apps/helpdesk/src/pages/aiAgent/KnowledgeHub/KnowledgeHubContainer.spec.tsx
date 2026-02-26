import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useHistory, useParams } from 'react-router-dom'
import type { Store } from 'redux'

import { appQueryClient } from 'api/queryClient'
import {
    getLast28DaysDateRange,
    useAllResourcesMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
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
import { useGetLastWebsiteSync } from 'pages/aiAgent/KnowledgeHub/hooks/useGetLastWebsiteSync'
import { useKnowledgeHubFaqEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubFaqEditor'
import { useKnowledgeHubGuidanceEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubGuidanceEditor'
import { useKnowledgeHubSnippetEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubSnippetEditor'
import { useUrlSyncStatus } from 'pages/aiAgent/KnowledgeHub/hooks/useUrlSyncStatus'
import { KnowledgeHubContainer } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubContainer'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import { transformKnowledgeHubArticlesToKnowledgeItems } from 'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import {
    getCurrentAccountId,
    getCurrentAccountState,
} from 'state/currentAccount/selectors'
import { getTimezone } from 'state/currentUser/selectors'
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
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useDomainSyncStatus', () => ({
    useDomainSyncStatus: jest.fn(() => ({
        syncStatus: null,
        storeDomainIngestionLog: undefined,
    })),
}))
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useUrlSyncStatus', () => ({
    useUrlSyncStatus: jest.fn(() => ({
        syncStatus: null,
        syncingUrls: [],
        urlIngestionLogs: [],
        totalCount: 0,
        completedCount: 0,
        successCount: 0,
        pendingCount: 0,
    })),
}))
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useFileIngestionStatus', () => ({
    useFileIngestionStatus: jest.fn(() => ({
        fileIngestionStatus: null,
        fileIngestionLogs: [],
        totalCount: 0,
        completedCount: 0,
        successCount: 0,
        pendingCount: 0,
    })),
}))
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useGetLastWebsiteSync', () => ({
    useGetLastWebsiteSync: jest.fn(() => ({
        isSyncLessThan24h: false,
        nextSyncDate: null,
    })),
}))
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubGuidanceEditor')
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubFaqEditor')
jest.mock('pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubSnippetEditor')
jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useAllResourcesMetrics: jest.fn(),
        getLast28DaysDateRange: jest.fn(),
    }),
)
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock('@repo/feature-flags')

// Global variables to capture the onClose and onDelete callbacks
let capturedGuidanceEditorOnClose: (() => void) | null = null
let capturedFaqEditorOnClose: (() => void) | null = null
let capturedSnippetEditorOnClose: (() => void) | null = null
let capturedGuidanceEditorOnDelete: (() => void) | null = null
let capturedFaqEditorOnDelete: (() => void) | null = null

jest.mock('pages/aiAgent/KnowledgeHub/EditorWrappers', () => ({
    GuidanceEditorWrapper: ({ isOpen, onClose, onDelete }: any) => {
        if (isOpen && onClose) {
            capturedGuidanceEditorOnClose = onClose
        }
        if (isOpen && onDelete) {
            capturedGuidanceEditorOnDelete = onDelete
        }
        return isOpen ? (
            <div data-testid="guidance-editor-wrapper">
                <button onClick={onClose} data-testid="guidance-editor-close">
                    Close
                </button>
            </div>
        ) : null
    },
    FaqEditorWrapper: ({ isOpen, onClose, onDelete }: any) => {
        if (isOpen && onClose) {
            capturedFaqEditorOnClose = onClose
        }
        if (isOpen && onDelete) {
            capturedFaqEditorOnDelete = onDelete
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
jest.mock('pages/aiAgent/KnowledgeHub/SyncStoreDomainBanner', () => ({
    SyncStoreDomainBanner: ({
        syncStatus,
        shopName,
        type,
        failedUrls,
        successfulUrls,
    }: any) => (
        <div data-testid={`sync-banner-${type}`}>
            <span data-testid="sync-status">{syncStatus}</span>
            <span data-testid="shop-name">{shopName}</span>
            {failedUrls && failedUrls.length > 0 && (
                <span data-testid="failed-urls">{failedUrls.join(',')}</span>
            )}
            {successfulUrls && successfulUrls.length > 0 && (
                <span data-testid="successful-urls">
                    {successfulUrls.join(',')}
                </span>
            )}
        </div>
    ),
}))
jest.mock(
    'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/KnowledgeHubHeader',
    () => ({
        KnowledgeHubHeader: ({
            onAddKnowledge,
            onBack,
            onSync,
            onDelete,
            data,
            isSyncButtonDisabled,
            isDeleteButtonDisabled,
            syncTooltipMessage,
        }: any) => (
            <div>
                <button onClick={onAddKnowledge}>Create content</button>
                {data && <button onClick={onBack}>Back</button>}
                {data && (
                    <button
                        onClick={onSync}
                        disabled={isSyncButtonDisabled}
                        title={syncTooltipMessage}
                        data-testid="sync-button"
                    >
                        Sync
                    </button>
                )}
                {data && (
                    <button
                        onClick={onDelete}
                        disabled={isDeleteButtonDisabled}
                        data-testid="delete-button"
                    >
                        Delete
                    </button>
                )}
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
const mockUseAllResourcesMetrics = useAllResourcesMetrics as jest.Mock
const mockUseStoreIntegrationByShopName =
    useStoreIntegrationByShopName as jest.Mock
const mockUseUrlSyncStatus = useUrlSyncStatus as jest.Mock
const mockUseGetLastWebsiteSync = useGetLastWebsiteSync as jest.Mock
const mockGetLast28DaysDateRange =
    getLast28DaysDateRange as jest.MockedFunction<typeof getLast28DaysDateRange>

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
        Object.defineProperty(window, 'location', {
            value: {
                href: 'http://localhost/app',
                pathname: '/app',
            },
            writable: true,
            configurable: true,
        })

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
            if (selector === getTimezone) return 'America/New_York'
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

        mockUseStoreIntegrationByShopName.mockReturnValue({
            id: 1,
            name: 'Store Alpha',
            type: 'shopify',
            meta: { shop_name: 'store-alpha' },
        })

        mockUseAllResourcesMetrics.mockReturnValue({
            isLoading: false,
            isError: false,
            data: [],
        })

        mockUseGetLastWebsiteSync.mockReturnValue({
            isSyncLessThan24h: false,
            nextSyncDate: null,
        })

        mockUseUrlSyncStatus.mockReturnValue({
            syncStatus: null,
            syncingUrls: [],
            urlIngestionLogs: [],
            totalCount: 0,
            completedCount: 0,
            successCount: 0,
            pendingCount: 0,
        })

        mockGetLast28DaysDateRange.mockReturnValue({
            start_datetime: new Date(
                Date.now() - 28 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            end_datetime: new Date().toISOString(),
        })
    })

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
            configurable: true,
        })
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
                screen.queryByRole('heading', { name: 'Create something new' }),
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
        it('opens Create content modal when Create content button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Create content' }),
            ).not.toBeInTheDocument()

            await act(() => user.click(screen.getByText('Create content')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Create content' }),
                ).toBeInTheDocument()
            })
        })

        it('closes Create content modal when OPEN_SYNC_WEBSITE_MODAL event is dispatched', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByText('Create content')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Create content' }),
                ).toBeInTheDocument()
            })

            act(() => {
                dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Create content' }),
                ).not.toBeInTheDocument()
            })
        })

        it('keeps modal closed when OPEN_SYNC_WEBSITE_MODAL is dispatched and modal was not open', () => {
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Create content' }),
            ).not.toBeInTheDocument()

            act(() => {
                dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)
            })

            expect(
                screen.queryByRole('heading', { name: 'Create content' }),
            ).not.toBeInTheDocument()
        })

        it('closes Create content modal when modal open state changes to false', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByText('Create content')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Create content' }),
                ).toBeInTheDocument()
            })

            await act(() => user.keyboard('{Escape}'))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Create content' }),
                ).not.toBeInTheDocument()
            })
        })

        it('closes Create content modal when OPEN_SYNC_URL_MODAL event is dispatched', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(() => user.click(screen.getByText('Create content')))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Create content' }),
                ).toBeInTheDocument()
            })

            act(() => {
                dispatchDocumentEvent(OPEN_SYNC_URL_MODAL)
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Create content' }),
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

            act(() => {
                dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
            })

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

        it('disables sync button when URL is currently syncing', async () => {
            const user = userEvent.setup()

            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'PENDING',
                syncingUrls: ['https://example.com'],
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: 'PENDING',
                        latest_sync: '2024-01-15T10:00:00Z',
                    },
                ],
                totalCount: 1,
                completedCount: 0,
                successCount: 0,
                pendingCount: 1,
            })

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
                const syncButton = screen.getByTestId('sync-button')
                expect(syncButton).toBeDisabled()
                expect(syncButton).toHaveAttribute(
                    'title',
                    'This URL is currently syncing.',
                )
            })
        })

        it('disables sync button when URL was synced less than 24 hours ago', async () => {
            const user = userEvent.setup()
            const now = new Date()
            const recentSync = new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 hours ago

            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'SUCCESSFUL',
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: 'SUCCESSFUL',
                        latest_sync: recentSync.toISOString(),
                    },
                ],
                totalCount: 1,
                completedCount: 1,
                successCount: 1,
                pendingCount: 0,
            })

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
                const syncButton = screen.getByTestId('sync-button')
                expect(syncButton).toBeDisabled()
                expect(syncButton.getAttribute('title')).toContain(
                    'This URL was synced less than 24h ago',
                )
            })
        })

        it('enables sync button when URL was synced more than 24 hours ago', async () => {
            const user = userEvent.setup()
            const now = new Date()
            const oldSync = new Date(now.getTime() - 25 * 60 * 60 * 1000) // 25 hours ago

            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'SUCCESSFUL',
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: 'SUCCESSFUL',
                        latest_sync: oldSync.toISOString(),
                    },
                ],
                totalCount: 1,
                completedCount: 1,
                successCount: 1,
                pendingCount: 0,
            })

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
                const syncButton = screen.getByTestId('sync-button')
                expect(syncButton).not.toBeDisabled()
            })
        })

        it('disables sync button for Domain folder when synced less than 24 hours ago', async () => {
            const user = userEvent.setup()
            const nextSync = 'Jan 16, 2024 10:00 AM'

            mockUseGetLastWebsiteSync.mockReturnValue({
                isSyncLessThan24h: true,
                nextSyncDate: nextSync,
            })

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
                const syncButton = screen.getByTestId('sync-button')
                expect(syncButton).toBeDisabled()
                expect(syncButton).toHaveAttribute(
                    'title',
                    `Your store website was synced less than 24h ago. You can sync again on ${nextSync}.`,
                )
            })
        })

        it('shows fallback tooltip message when domain synced recently but non-Domain/URL folder selected', async () => {
            const user = userEvent.setup()
            const nextSync = 'Jan 16, 2024 10:00 AM'

            mockUseGetLastWebsiteSync.mockReturnValue({
                isSyncLessThan24h: true,
                nextSyncDate: nextSync,
            })

            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Document',
                            type: KnowledgeType.Document,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                            source: 'document.pdf',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            await act(() => user.click(screen.getByText('Test Document')))

            await waitFor(() => {
                const syncButton = screen.getByTestId('sync-button')
                expect(syncButton).toBeDisabled()
                expect(syncButton).toHaveAttribute(
                    'title',
                    `Your store website was synced less than 24h ago. You can sync again on ${nextSync}.`,
                )
            })
        })

        it('disables sync button and shows tooltip when URL is from store domain', async () => {
            const user = userEvent.setup()

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
                if (selector === getTimezone) return 'America/New_York'
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

            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'SUCCESSFUL',
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://store-alpha.myshopify.com/faq',
                        status: 'SUCCESSFUL',
                        latest_sync: null,
                    },
                ],
                totalCount: 1,
                completedCount: 1,
                successCount: 1,
                pendingCount: 0,
            })

            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Store FAQ',
                            type: KnowledgeType.URL,
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                            source: 'https://store-alpha.myshopify.com/faq',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            await act(() => user.click(screen.getByText('Store FAQ')))

            await waitFor(() => {
                const syncButton = screen.getByTestId('sync-button')
                expect(syncButton).toBeDisabled()
                expect(syncButton).toHaveAttribute(
                    'title',
                    'URL cannot be from your store website',
                )
            })
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

        it('disables delete button when URL is currently syncing', async () => {
            const user = userEvent.setup()

            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'PENDING',
                syncingUrls: ['https://example.com'],
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: 'PENDING',
                        latest_sync: '2024-01-15T10:00:00Z',
                    },
                ],
                totalCount: 1,
                completedCount: 0,
                successCount: 0,
                pendingCount: 1,
            })

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
                const deleteButton = screen.getByTestId('delete-button')
                expect(deleteButton).toBeDisabled()
            })
        })

        it('enables delete button when URL is not syncing', async () => {
            const user = userEvent.setup()

            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'SUCCESSFUL',
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: 'SUCCESSFUL',
                        latest_sync: '2024-01-15T10:00:00Z',
                    },
                ],
                totalCount: 1,
                completedCount: 1,
                successCount: 1,
                pendingCount: 0,
            })

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
                const deleteButton = screen.getByTestId('delete-button')
                expect(deleteButton).not.toBeDisabled()
            })
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

    describe('back button navigation closing editors', () => {
        it('closes guidance editor when URL params are cleared (back button)', () => {
            // Setup mock close function
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

            // First render with params present - opens editor
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Guidance,
                id: '123',
            })

            mockUseKnowledgeHubGuidanceEditor.mockReset()
            mockUseKnowledgeHubGuidanceEditor.mockReturnValue(
                guidanceEditorMock,
            )

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor opened
            expect(guidanceEditorMock.openEditorForEdit).toHaveBeenCalledWith(
                123,
            )

            // Simulate back button - params become undefined
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: undefined,
                id: undefined,
            })

            // Re-render to trigger useEffect with new params
            rerender(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor close function was called
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('closes FAQ editor when URL params are cleared (back button)', () => {
            // Setup mock close function
            const mockCloseEditor = jest.fn()
            const faqEditorMock = {
                isEditorOpen: true,
                currentArticleId: 456,
                faqArticleMode: 'edit' as const,
                initialArticleMode: 'READ' as const,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: mockCloseEditor,
                handleDelete: jest.fn(),
                faqEditorProps: {
                    isOpen: true,
                    onClose: jest.fn(),
                    articleId: 456,
                    onCreate: jest.fn(),
                    onUpdate: jest.fn(),
                    onDelete: jest.fn(),
                },
            }

            // First render with params present - opens editor
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.FAQ,
                id: '456',
            })

            mockUseKnowledgeHubFaqEditor.mockReset()
            mockUseKnowledgeHubFaqEditor.mockReturnValue(faqEditorMock)

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor opened
            expect(faqEditorMock.openEditorForEdit).toHaveBeenCalledWith(456)

            // Simulate back button - params become undefined
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: undefined,
                id: undefined,
            })

            // Re-render to trigger useEffect with new params
            rerender(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor close function was called
            expect(mockCloseEditor).toHaveBeenCalledTimes(1)
        })

        it('closes snippet editor (Document) when URL params are cleared (back button)', () => {
            // Setup mock close function
            const mockCloseEditor = jest.fn()
            const snippetEditorMock = {
                isEditorOpen: true,
                currentArticleId: 789,
                currentArticleType: KnowledgeType.Document,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: mockCloseEditor,
                snippetEditorProps: {
                    isOpen: true,
                    onClose: jest.fn(),
                    articleId: 789,
                    type: KnowledgeType.Document,
                    onCreate: jest.fn(),
                    onUpdate: jest.fn(),
                    onDelete: jest.fn(),
                },
            }

            // First render with params present - opens editor
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Document,
                id: '789',
            })

            mockUseKnowledgeHubSnippetEditor.mockReset()
            mockUseKnowledgeHubSnippetEditor.mockReturnValue(snippetEditorMock)

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor opened
            expect(snippetEditorMock.openEditorForEdit).toHaveBeenCalledWith(
                789,
                KnowledgeType.Document,
            )

            // Simulate back button - params become undefined
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: undefined,
                id: undefined,
            })

            // Re-render to trigger useEffect with new params
            rerender(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor close function was called
            expect(mockCloseEditor).toHaveBeenCalledTimes(1)
        })

        it('closes snippet editor (URL) when URL params are cleared (back button)', () => {
            // Setup mock close function
            const mockCloseEditor = jest.fn()
            const snippetEditorMock = {
                isEditorOpen: true,
                currentArticleId: 101,
                currentArticleType: KnowledgeType.URL,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: mockCloseEditor,
                snippetEditorProps: {
                    isOpen: true,
                    onClose: jest.fn(),
                    articleId: 101,
                    type: KnowledgeType.URL,
                    onCreate: jest.fn(),
                    onUpdate: jest.fn(),
                    onDelete: jest.fn(),
                },
            }

            // First render with params present - opens editor
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.URL,
                id: '101',
            })

            mockUseKnowledgeHubSnippetEditor.mockReset()
            mockUseKnowledgeHubSnippetEditor.mockReturnValue(snippetEditorMock)

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor opened
            expect(snippetEditorMock.openEditorForEdit).toHaveBeenCalledWith(
                101,
                KnowledgeType.URL,
            )

            // Simulate back button - params become undefined
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: undefined,
                id: undefined,
            })

            // Re-render to trigger useEffect with new params
            rerender(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor close function was called
            expect(mockCloseEditor).toHaveBeenCalledTimes(1)
        })

        it('closes snippet editor (Domain) when URL params are cleared (back button)', () => {
            // Setup mock close function
            const mockCloseEditor = jest.fn()
            const snippetEditorMock = {
                isEditorOpen: true,
                currentArticleId: 202,
                currentArticleType: KnowledgeType.Domain,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: mockCloseEditor,
                snippetEditorProps: {
                    isOpen: true,
                    onClose: jest.fn(),
                    articleId: 202,
                    type: KnowledgeType.Domain,
                    onCreate: jest.fn(),
                    onUpdate: jest.fn(),
                    onDelete: jest.fn(),
                },
            }

            // First render with params present - opens editor
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Domain,
                id: '202',
            })

            mockUseKnowledgeHubSnippetEditor.mockReset()
            mockUseKnowledgeHubSnippetEditor.mockReturnValue(snippetEditorMock)

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor opened
            expect(snippetEditorMock.openEditorForEdit).toHaveBeenCalledWith(
                202,
                KnowledgeType.Domain,
            )

            // Simulate back button - params become undefined
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: undefined,
                id: undefined,
            })

            // Re-render to trigger useEffect with new params
            rerender(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify editor close function was called
            expect(mockCloseEditor).toHaveBeenCalledTimes(1)
        })

        it('does not close editor when params remain undefined (no previous state)', () => {
            const mockOnClose = jest.fn()
            const guidanceEditorMock = {
                isEditorOpen: false,
                currentGuidanceArticleId: undefined,
                guidanceMode: 'edit' as const,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: jest.fn(),
                knowledgeEditorProps: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    guidanceArticleId: undefined,
                    guidanceTemplate: undefined,
                    guidanceMode: 'edit' as const,
                    isOpen: false,
                    onClose: mockOnClose,
                    onCreate: jest.fn(),
                    onUpdate: jest.fn(),
                    onDelete: jest.fn(),
                    onClickPrevious: undefined,
                    onClickNext: undefined,
                },
            }

            // Render with undefined params (initial state, no editor open)
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: undefined,
                id: undefined,
            })

            mockUseKnowledgeHubGuidanceEditor.mockReset()
            mockUseKnowledgeHubGuidanceEditor.mockReturnValue(
                guidanceEditorMock,
            )

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Re-render with same undefined params
            rerender(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify close was NOT called (no transition from defined to undefined)
            expect(mockOnClose).not.toHaveBeenCalled()
        })

        it('handles transition from one article to another without closing', () => {
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

            // First render with article 123
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Guidance,
                id: '123',
            })

            mockUseKnowledgeHubGuidanceEditor.mockReset()
            mockUseKnowledgeHubGuidanceEditor.mockReturnValue(
                guidanceEditorMock,
            )

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify first article opened
            expect(guidanceEditorMock.openEditorForEdit).toHaveBeenCalledWith(
                123,
            )

            // Navigate to article 456 (not a back button, just changing articles)
            mockUseParams.mockReturnValue({
                shopType: 'shopify',
                type: KnowledgeType.Guidance,
                id: '456',
            })

            // Re-render to navigate to new article
            rerender(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <KnowledgeHubContainer />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Verify second article opened (opening logic, not closing)
            expect(guidanceEditorMock.openEditorForEdit).toHaveBeenCalledWith(
                456,
            )

            // Verify close was NOT called (direct navigation between articles)
            expect(mockOnClose).not.toHaveBeenCalled()
        })
    })

    describe('deleting editors', () => {
        it('calls history.push and knowledgeEditorProps.onDelete when guidance editor is deleted', () => {
            const mockPush = jest.fn()
            const mockOnDelete = jest.fn()

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
                    onClose: jest.fn(),
                    onCreate: jest.fn(),
                    onUpdate: jest.fn(),
                    onDelete: mockOnDelete,
                    onClickPrevious: undefined,
                    onClickNext: undefined,
                },
            }

            // Reset the captured callback
            capturedGuidanceEditorOnDelete = null

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

            // Verify the onDelete callback was captured
            expect(capturedGuidanceEditorOnDelete).not.toBeNull()

            // Call the captured onDelete callback directly
            const onDelete = capturedGuidanceEditorOnDelete
            if (onDelete) {
                const onDeleteF = onDelete as () => void
                onDeleteF()
            }

            // Verify both functions were called
            expect(mockPush).toHaveBeenCalledTimes(1)
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringMatching(/\/ai-agent\/.*\/knowledge/),
            )
            expect(mockOnDelete).toHaveBeenCalledTimes(1)
        })

        it('calls history.push and faqEditor.handleDelete when FAQ editor is deleted', () => {
            const mockPush = jest.fn()
            const mockHandleDelete = jest.fn()

            const faqEditorMock = {
                isEditorOpen: true,
                currentArticleId: 456,
                faqArticleMode: 'edit' as const,
                initialArticleMode: 'READ' as const,
                openEditorForCreate: jest.fn(),
                openEditorForEdit: jest.fn(),
                closeEditor: jest.fn(),
                handleCreate: jest.fn(),
                handleUpdate: jest.fn(),
                handleDelete: mockHandleDelete,
                handleClickPrevious: jest.fn(),
                handleClickNext: jest.fn(),
            }

            // Reset the captured callback
            capturedFaqEditorOnDelete = null

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

            // Verify the onDelete callback was captured
            expect(capturedFaqEditorOnDelete).not.toBeNull()

            // Call the captured onDelete callback directly
            const onDelete = capturedFaqEditorOnDelete
            if (onDelete) {
                const onDeleteF = onDelete as () => void
                onDeleteF()
            }

            // Verify both functions were called
            expect(mockPush).toHaveBeenCalledTimes(1)
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringMatching(/\/ai-agent\/.*\/knowledge/),
            )
            expect(mockHandleDelete).toHaveBeenCalledTimes(1)
        })
    })

    describe('resource metrics fetching', () => {
        it('should fetch metrics data with correct parameters', () => {
            renderComponent()

            expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith({
                shopIntegrationId: 1,
                timezone: 'America/New_York',
                enabled: true,
                loadIntents: false,
                dateRange: expect.objectContaining({
                    start_datetime: expect.any(String),
                    end_datetime: expect.any(String),
                }),
            })
        })

        it('should not fetch metrics when shopIntegrationId is not available', () => {
            mockUseStoreIntegrationByShopName.mockReturnValue(undefined)

            renderComponent()

            expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith({
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: false,
                loadIntents: false,
                dateRange: expect.objectContaining({
                    start_datetime: expect.any(String),
                    end_datetime: expect.any(String),
                }),
            })
        })
    })

    describe('metrics data enrichment logic', () => {
        it('should correctly map metrics by resourceSourceId', () => {
            const tableData = [
                {
                    id: '100',
                    type: KnowledgeType.Guidance,
                    title: 'Article 1',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                },
                {
                    id: '200',
                    type: KnowledgeType.FAQ,
                    title: 'Article 2',
                    lastUpdatedAt: '2025-01-02T00:00:00Z',
                },
            ]

            const metricsData = [
                {
                    resourceSourceId: 100,
                    resourceSourceSetId: 1,
                    tickets: 50,
                    handoverTickets: 5,
                    csat: 4.5,
                    intents: null,
                },
                {
                    resourceSourceId: 200,
                    resourceSourceSetId: 1,
                    tickets: 30,
                    handoverTickets: 3,
                    csat: 4.2,
                    intents: null,
                },
            ]

            // Create metrics map (simulating the logic in KnowledgeHubContainer)
            const metricsMap = new Map()
            metricsData.forEach((metric) => {
                metricsMap.set(String(metric.resourceSourceId), {
                    tickets: metric.tickets,
                    handoverTickets: metric.handoverTickets,
                    csat: metric.csat,
                    resourceSourceSetId: metric.resourceSourceSetId,
                })
            })

            // Enrich table data
            const enrichedData = tableData.map((item) => ({
                ...item,
                metrics: metricsMap.get(item.id),
            }))

            // Verify enrichment
            expect(enrichedData[0].metrics).toEqual({
                tickets: 50,
                handoverTickets: 5,
                csat: 4.5,
                resourceSourceSetId: 1,
            })
            expect(enrichedData[1].metrics).toEqual({
                tickets: 30,
                handoverTickets: 3,
                csat: 4.2,
                resourceSourceSetId: 1,
            })
        })

        it('should handle items without metrics', () => {
            const tableData = [
                {
                    id: '100',
                    type: KnowledgeType.Guidance,
                    title: 'Article 1',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                },
                {
                    id: '999',
                    type: KnowledgeType.FAQ,
                    title: 'Article without metrics',
                    lastUpdatedAt: '2025-01-02T00:00:00Z',
                },
            ]

            const metricsData = [
                {
                    resourceSourceId: 100,
                    resourceSourceSetId: 1,
                    tickets: 50,
                    handoverTickets: 5,
                    csat: 4.5,
                    intents: null,
                },
            ]

            // Create metrics map
            const metricsMap = new Map()
            metricsData.forEach((metric) => {
                metricsMap.set(String(metric.resourceSourceId), {
                    tickets: metric.tickets,
                    handoverTickets: metric.handoverTickets,
                    csat: metric.csat,
                    resourceSourceSetId: metric.resourceSourceSetId,
                })
            })

            // Enrich table data
            const enrichedData = tableData.map((item) => ({
                ...item,
                metrics: metricsMap.get(item.id),
            }))

            // Verify enrichment
            expect(enrichedData[0].metrics).toBeDefined()
            expect(enrichedData[1].metrics).toBeUndefined()
        })

        it('should handle null metric values', () => {
            const tableData = [
                {
                    id: '100',
                    type: KnowledgeType.Guidance,
                    title: 'Article 1',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                },
            ]

            const metricsData = [
                {
                    resourceSourceId: 100,
                    resourceSourceSetId: 1,
                    tickets: null,
                    handoverTickets: null,
                    csat: null,
                    intents: null,
                },
            ]

            // Create metrics map
            const metricsMap = new Map()
            metricsData.forEach((metric) => {
                metricsMap.set(String(metric.resourceSourceId), {
                    tickets: metric.tickets,
                    handoverTickets: metric.handoverTickets,
                    csat: metric.csat,
                    resourceSourceSetId: metric.resourceSourceSetId,
                })
            })

            // Enrich table data
            const enrichedData = tableData.map((item) => ({
                ...item,
                metrics: metricsMap.get(item.id),
            }))

            // Verify that null values are preserved
            expect(enrichedData[0].metrics).toEqual({
                tickets: null,
                handoverTickets: null,
                csat: null,
                resourceSourceSetId: 1,
            })
        })
    })

    describe('failedUrls and successfulUrls logic', () => {
        it('should return empty array when urlIngestionLogs is undefined', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: null,
                syncingUrls: [],
                urlIngestionLogs: undefined,
                totalCount: 0,
                completedCount: 0,
                successCount: 0,
                pendingCount: 0,
            })

            renderComponent()

            const failedUrls = screen.queryByTestId('failed-urls')
            const successfulUrls = screen.queryByTestId('successful-urls')

            expect(failedUrls).not.toBeInTheDocument()
            expect(successfulUrls).not.toBeInTheDocument()
        })

        it('should filter and map failed URLs correctly', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: null,
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        url: 'https://example.com/failed1',
                        status: 'FAILED',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/successful',
                        status: 'SUCCESSFUL',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/failed2',
                        status: 'FAILED',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                ],
                totalCount: 3,
                completedCount: 3,
                successCount: 1,
                pendingCount: 0,
            })

            renderComponent()

            const failedUrls = screen.getByTestId('failed-urls')
            expect(failedUrls).toHaveTextContent(
                'https://example.com/failed1,https://example.com/failed2',
            )
        })

        it('should filter and map successful URLs correctly', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: null,
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        url: 'https://example.com/failed',
                        status: 'FAILED',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/successful1',
                        status: 'SUCCESSFUL',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/successful2',
                        status: 'SUCCESSFUL',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                ],
                totalCount: 3,
                completedCount: 3,
                successCount: 2,
                pendingCount: 0,
            })

            renderComponent()

            const successfulUrls = screen.getByTestId('successful-urls')
            expect(successfulUrls).toHaveTextContent(
                'https://example.com/successful1,https://example.com/successful2',
            )
        })

        it('should filter out logs with null or undefined URLs', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: null,
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        url: null,
                        status: 'FAILED',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/failed',
                        status: 'FAILED',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: undefined,
                        status: 'SUCCESSFUL',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/successful',
                        status: 'SUCCESSFUL',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                ],
                totalCount: 4,
                completedCount: 4,
                successCount: 2,
                pendingCount: 0,
            })

            renderComponent()

            const failedUrls = screen.getByTestId('failed-urls')
            const successfulUrls = screen.getByTestId('successful-urls')

            expect(failedUrls).toHaveTextContent('https://example.com/failed')
            expect(successfulUrls).toHaveTextContent(
                'https://example.com/successful',
            )
        })

        it('should handle logs with only pending status', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'PENDING',
                syncingUrls: ['https://example.com/pending'],
                urlIngestionLogs: [
                    {
                        url: 'https://example.com/pending',
                        status: 'PENDING',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                ],
                totalCount: 1,
                completedCount: 0,
                successCount: 0,
                pendingCount: 1,
            })

            renderComponent()

            const failedUrls = screen.queryByTestId('failed-urls')
            const successfulUrls = screen.queryByTestId('successful-urls')

            expect(failedUrls).not.toBeInTheDocument()
            expect(successfulUrls).not.toBeInTheDocument()
        })

        it('should handle empty urlIngestionLogs array', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: null,
                syncingUrls: [],
                urlIngestionLogs: [],
                totalCount: 0,
                completedCount: 0,
                successCount: 0,
                pendingCount: 0,
            })

            renderComponent()

            const failedUrls = screen.queryByTestId('failed-urls')
            const successfulUrls = screen.queryByTestId('successful-urls')

            expect(failedUrls).not.toBeInTheDocument()
            expect(successfulUrls).not.toBeInTheDocument()
        })

        it('should handle logs with empty string URLs', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: null,
                syncingUrls: [],
                urlIngestionLogs: [
                    {
                        url: '',
                        status: 'FAILED',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/failed',
                        status: 'FAILED',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: '',
                        status: 'SUCCESSFUL',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                    {
                        url: 'https://example.com/successful',
                        status: 'SUCCESSFUL',
                        latest_sync: '2025-01-01T00:00:00Z',
                    },
                ],
                totalCount: 4,
                completedCount: 4,
                successCount: 2,
                pendingCount: 0,
            })

            renderComponent()

            const failedUrls = screen.getByTestId('failed-urls')
            const successfulUrls = screen.getByTestId('successful-urls')

            expect(failedUrls).toHaveTextContent('https://example.com/failed')
            expect(successfulUrls).toHaveTextContent(
                'https://example.com/successful',
            )
        })
    })
})
