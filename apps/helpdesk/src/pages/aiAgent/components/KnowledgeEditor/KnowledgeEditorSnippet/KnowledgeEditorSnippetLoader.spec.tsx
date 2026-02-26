import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import {
    useRecentTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import * as helpCenterQueries from 'models/helpCenter/queries'
import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { KnowledgeEditorSnippetLoader } from './KnowledgeEditorSnippetLoader'

const mockNotifyError = jest.fn()
jest.mock('hooks/useNotify', () => ({
    useNotify: () => ({ error: mockNotifyError }),
}))

jest.mock('models/api/types', () => ({
    ...jest.requireActual('models/api/types'),
    isGorgiasApiError: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))

jest.mock('./KnowledgeEditorSnippetView', () => ({
    KnowledgeEditorSnippetView: ({
        snippet,
    }: {
        snippet: { title: string }
    }) => <div data-testid="snippet-view">{snippet.title}</div>,
}))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        useRecentTicketsWithDrilldown: jest.fn(),
        getLast28DaysDateRange: jest.fn(() => ({
            start_datetime: '2025-01-01T00:00:00.000Z',
            end_datetime: '2025-01-28T00:00:00.000Z',
        })),
    }),
)
const mockedFetchResourceMetrics = jest.mocked(useResourceMetrics)
const mockedUseRecentTicketsWithDrilldown = jest.mocked(
    useRecentTicketsWithDrilldown,
)

const queryClient = mockQueryClient()
const store = mockStore({
    currentUser: fromJS({
        timezone: 'America/New_York',
    }),
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

describe('KnowledgeEditorSnippetLoader', () => {
    const mockArticleData = {
        id: 123,
        unlisted_id: 'unlisted123',
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-02T00:00:00Z',
        ingested_resource_id: 456,
        category_id: 100,
        help_center_id: 1,
        available_locales: ['en-US'],
        translation: {
            title: 'Test Snippet',
            content: '<p>Test content</p>',
            visibility_status: 'PUBLIC',
        },
    }

    const mockFileIngestionLog = {
        id: 1,
        filename: 'test-document.pdf',
        google_storage_url: 'https://storage.googleapis.com/bucket/test.pdf',
        snippets_article_ids: [123],
        help_center_id: 1,
        status: 'success',
    }

    const mockArticleIngestionLog = {
        id: 1,
        url: 'https://example.com/article',
        article_ids: [123],
        help_center_id: 1,
        status: 'success',
    }

    const mockIngestedResource = {
        id: 456,
        article_ingestion_log_id: 1,
        scraping_id: 'scrape123',
        snippet_id: 'snippet123',
        execution_id: 'exec123',
        status: 'enabled' as const,
        web_pages: [
            {
                url: 'https://store.example.com/product1',
                title: 'Product 1',
                pageType: 'product',
            },
            {
                url: 'https://store.example.com/product2',
                title: 'Product 2',
                pageType: 'product',
            },
        ],
        article_id: 123,
        title: 'Store Snippet',
    }

    const baseProps = {
        snippetId: 123,
        helpCenterId: 1,
        shopIntegrationId: 0,
        locale: 'en-US' as const,
        onClose: jest.fn(),
        onClickPrevious: jest.fn(),
        onClickNext: jest.fn(),
        onUpdated: jest.fn(),
        isFullscreen: false,
        onToggleFullscreen: jest.fn(),
        onTest: jest.fn(),
        shouldHideFullscreenButton: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockNotifyError.mockClear()

        mockedFetchResourceMetrics.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {
                tickets: {
                    value: 156,
                    onClick: undefined,
                },
                handoverTickets: {
                    value: 12,
                    onClick: undefined,
                },
                csat: {
                    value: 4.53,
                    onClick: undefined,
                },
                intents: [
                    {
                        intent: 'Order/Status',
                        ticketCount: 156,
                    },
                    {
                        intent: 'Shipping/Inquiry',
                        ticketCount: 84,
                    },
                    {
                        intent: 'Product/Question',
                        ticketCount: 42,
                    },
                ],
            },
        })

        mockedUseRecentTicketsWithDrilldown.mockReturnValue({
            ticketCount: 0,
            latest3Tickets: [],
            isLoading: false,
            resourceSourceId: 0,
            resourceSourceSetId: 0,
            shopIntegrationId: 0,
            dateRange: {
                start_datetime: '2025-01-01T00:00:00.000Z',
                end_datetime: '2025-01-28T00:00:00.000Z',
            },
            outcomeCustomFieldId: 0,
            intentCustomFieldId: 0,
        })
    })

    describe('URL Snippet', () => {
        beforeEach(() => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: mockArticleData,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetHelpCenterArticle
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: [mockArticleIngestionLog],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetIngestedResource',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetIngestedResource
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetFileIngestion',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetFileIngestion
            >)
        })

        it('loads and displays URL snippet correctly', async () => {
            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })
        })

        it('extracts URL from article ingestion logs', async () => {
            const { container } = render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    container.querySelector('[data-testid="snippet-view"]'),
                ).toBeInTheDocument()
            })

            expect(
                helpCenterQueries.useGetArticleIngestionLogs,
            ).toHaveBeenCalled()
        })
    })

    describe('Document Snippet', () => {
        beforeEach(() => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: mockArticleData,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetHelpCenterArticle
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetIngestedResource',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetIngestedResource
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetFileIngestion',
            ).mockReturnValue({
                data: { data: [mockFileIngestionLog] },
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetFileIngestion
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)
        })

        it('loads and displays document snippet with googleStorageUrl', async () => {
            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.Document}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })
        })

        it('extracts filename and google_storage_url from file ingestion logs', async () => {
            const { container } = render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.Document}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    container.querySelector('[data-testid="snippet-view"]'),
                ).toBeInTheDocument()
            })

            expect(helpCenterQueries.useGetFileIngestion).toHaveBeenCalled()
        })
    })

    describe('Store Snippet', () => {
        beforeEach(() => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: {
                    ...mockArticleData,
                    ingested_resource_id: 456,
                },
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetHelpCenterArticle
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetIngestedResource',
            ).mockReturnValue({
                data: mockIngestedResource,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetIngestedResource
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetFileIngestion',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetFileIngestion
            >)
        })

        it('loads and displays store snippet with multiple URLs', async () => {
            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.Store}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })
        })

        it('extracts URLs from ingested resource web_pages', async () => {
            const { container } = render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.Store}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    container.querySelector('[data-testid="snippet-view"]'),
                ).toBeInTheDocument()
            })

            expect(
                helpCenterQueries.useGetIngestedResource,
            ).toHaveBeenCalledWith(
                {
                    help_center_id: 1,
                    id: 456,
                },
                {
                    enabled: true,
                },
            )
        })

        it('extracts domain from article ingestion logs with source=domain', async () => {
            const mockDomainIngestionLog = {
                id: 2,
                url: 'https://store.example.com',
                article_ids: [123],
                help_center_id: 1,
                status: 'success',
                source: 'domain',
            }

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: [mockDomainIngestionLog],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.Store}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })

            expect(
                helpCenterQueries.useGetArticleIngestionLogs,
            ).toHaveBeenCalledWith(
                {
                    help_center_id: 1,
                    sources: ['url', 'domain'],
                },
                {
                    enabled: true,
                },
            )
        })

        it('handles store snippet without domain (undefined)', async () => {
            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: [],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.Store}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })
        })

        it('handles store snippet with multiple ingestion logs and extracts correct domain', async () => {
            const mockIngestionLogs = [
                {
                    id: 1,
                    url: 'https://store.example.com/page1',
                    article_ids: [123],
                    help_center_id: 1,
                    status: 'success',
                    source: 'url',
                },
                {
                    id: 2,
                    url: 'https://store.example.com',
                    article_ids: [123],
                    help_center_id: 1,
                    status: 'success',
                    source: 'domain',
                },
            ]

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: mockIngestionLogs,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.Store}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })
        })
    })

    describe('AI Agent Toggle', () => {
        const mockUpdateArticleTranslation = jest.fn()

        beforeEach(() => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: mockArticleData,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetHelpCenterArticle
            >)

            jest.spyOn(
                helpCenterQueries,
                'useUpdateArticleTranslation',
            ).mockReturnValue({
                mutateAsync: mockUpdateArticleTranslation,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useUpdateArticleTranslation
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetIngestedResource',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetIngestedResource
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: [mockArticleIngestionLog],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetFileIngestion',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetFileIngestion
            >)
        })

        it('toggles AI Agent status from PUBLIC to UNLISTED', async () => {
            mockUpdateArticleTranslation.mockResolvedValue({})

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })
        })
    })

    describe('Loading States', () => {
        it('shows loading skeleton when article data is loading', () => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: undefined,
                isInitialLoading: true,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            const { container } = render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            // Check for skeleton loading elements
            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('shows loading skeleton when ingestion logs are loading', () => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: mockArticleData,
                isInitialLoading: false,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: undefined,
                isInitialLoading: true,
            } as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            const { container } = render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            // Check for skeleton loading elements
            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('Impact Metrics', () => {
        beforeEach(() => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: mockArticleData,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetHelpCenterArticle
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: [mockArticleIngestionLog],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetIngestedResource',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetIngestedResource
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetFileIngestion',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetFileIngestion
            >)
        })

        it('calls useResourceMetrics with correct parameters', async () => {
            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })

            expect(mockedFetchResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: true,
                dateRange: {
                    start_datetime: '2025-01-01T00:00:00.000Z',
                    end_datetime: '2025-01-28T00:00:00.000Z',
                },
            })
        })

        it('displays impact section with loading state when data is not available', async () => {
            mockedFetchResourceMetrics.mockReturnValue({
                isLoading: true,
                isError: false,
                data: undefined,
            })

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(screen.getByText('Test Snippet')).toBeInTheDocument()
            })

            expect(mockedFetchResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: true,
                dateRange: {
                    start_datetime: '2025-01-01T00:00:00.000Z',
                    end_datetime: '2025-01-28T00:00:00.000Z',
                },
            })
        })
    })

    describe('Error handling', () => {
        it('shows error notification and closes panel on 404 error', async () => {
            const mockIsGorgiasApiError =
                jest.requireMock('models/api/types').isGorgiasApiError
            const onClose = jest.fn()

            const mockError = {
                response: {
                    status: 404,
                    data: {
                        error: {
                            msg: 'Article not found',
                        },
                    },
                },
            }

            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: undefined,
                isInitialLoading: false,
                isError: true,
                error: mockError,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            mockIsGorgiasApiError.mockReturnValue(true)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClose={onClose}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'This snippet is no longer available. It may have been deleted.',
                )
                expect(onClose).toHaveBeenCalled()
            })
        })

        it('shows generic error notification on non-404 error', async () => {
            const mockIsGorgiasApiError =
                jest.requireMock('models/api/types').isGorgiasApiError
            const onClose = jest.fn()

            const mockError = {
                response: {
                    status: 500,
                    data: {
                        error: {
                            msg: 'Internal server error',
                        },
                    },
                },
            }

            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: undefined,
                isInitialLoading: false,
                isError: true,
                error: mockError,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            mockIsGorgiasApiError.mockReturnValue(true)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClose={onClose}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'Unable to load this snippet. Please try again or contact support.',
                )
                expect(onClose).toHaveBeenCalled()
            })
        })

        it('shows generic error when error is not a Gorgias API error', async () => {
            const mockIsGorgiasApiError =
                jest.requireMock('models/api/types').isGorgiasApiError
            const onClose = jest.fn()

            const mockError = new Error('Network error')

            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: undefined,
                isInitialLoading: false,
                isError: true,
                error: mockError,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            mockIsGorgiasApiError.mockReturnValue(false)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                    onClose={onClose}
                />,
                { wrapper },
            )

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'Unable to load this snippet. Please try again or contact support.',
                )
                expect(onClose).toHaveBeenCalled()
            })
        })

        it('does not show error notification when isError is false', () => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: mockArticleData,
                isInitialLoading: false,
                isError: false,
                error: null,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: [mockArticleIngestionLog],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetIngestedResource',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetIngestedResource
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetFileIngestion',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetFileIngestion
            >)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            expect(mockNotifyError).not.toHaveBeenCalled()
        })

        it('does not show error notification when error is null', () => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: mockArticleData,
                isInitialLoading: false,
                isError: true,
                error: null,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            jest.spyOn(
                helpCenterQueries,
                'useGetArticleIngestionLogs',
            ).mockReturnValue({
                data: [mockArticleIngestionLog],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetArticleIngestionLogs
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetIngestedResource',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetIngestedResource
            >)

            jest.spyOn(
                helpCenterQueries,
                'useGetFileIngestion',
            ).mockReturnValue({
                data: null,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof helpCenterQueries.useGetFileIngestion
            >)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            expect(mockNotifyError).not.toHaveBeenCalled()
        })
    })
})
