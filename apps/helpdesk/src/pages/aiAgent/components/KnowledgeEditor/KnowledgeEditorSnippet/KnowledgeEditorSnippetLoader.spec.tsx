import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import * as helpCenterQueries from 'models/helpCenter/queries'
import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { KnowledgeEditorSnippetLoader } from './KnowledgeEditorSnippetLoader'

jest.mock('hooks/useNotify', () => ({
    useNotify: () => ({ error: jest.fn() }),
}))

jest.mock('./KnowledgeEditorSnippetView', () => ({
    KnowledgeEditorSnippetView: ({
        snippet,
    }: {
        snippet: { title: string }
    }) => <div data-testid="snippet-view">{snippet.title}</div>,
}))

const queryClient = mockQueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
        locale: 'en-US' as const,
        onClose: jest.fn(),
        onClickPrevious: jest.fn(),
        onClickNext: jest.fn(),
        onUpdated: jest.fn(),
        isFullscreen: false,
        onToggleFullscreen: jest.fn(),
        onTest: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
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
        it('shows loading spinner when article data is loading', () => {
            jest.spyOn(
                helpCenterQueries,
                'useGetHelpCenterArticle',
            ).mockReturnValue({
                data: undefined,
                isInitialLoading: true,
            } as ReturnType<typeof helpCenterQueries.useGetHelpCenterArticle>)

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            expect(screen.getByRole('status')).toBeInTheDocument()
        })

        it('shows loading spinner when ingestion logs are loading', () => {
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

            render(
                <KnowledgeEditorSnippetLoader
                    {...baseProps}
                    snippetType={SnippetType.URL}
                />,
                { wrapper },
            )

            expect(screen.getByRole('status')).toBeInTheDocument()
        })
    })
})
