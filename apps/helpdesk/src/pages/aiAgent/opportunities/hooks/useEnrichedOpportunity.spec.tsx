import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import type { Components } from 'rest_api/help_center_api/client.generated'

import { OpportunityType } from '../enums'
import type { Opportunity } from '../types'
import { ResourceType } from '../types'
import * as useCheckOpportunityRelevanceModule from './useCheckOpportunityRelevance'
import { useEnrichedOpportunity } from './useEnrichedOpportunity'
import * as useFindOneOpportunityModule from './useFindOneOpportunity'

jest.mock('./useFindOneOpportunity')
jest.mock('./useCheckOpportunityRelevance')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')

const mockUseFindOneOpportunity =
    useFindOneOpportunityModule.useFindOneOpportunity as jest.MockedFunction<
        typeof useFindOneOpportunityModule.useFindOneOpportunity
    >

const mockUseCheckOpportunityRelevance =
    useCheckOpportunityRelevanceModule.useCheckOpportunityRelevance as jest.MockedFunction<
        typeof useCheckOpportunityRelevanceModule.useCheckOpportunityRelevance
    >

const mockUseHelpCenterApi =
    require('pages/settings/helpCenter/hooks/useHelpCenterApi')
        .useHelpCenterApi as jest.MockedFunction<any>

type ArticleWithIngestion = Components.Schemas.ArticleWithLocalTranslation & {
    ingested_resource?: Components.Schemas.IngestedResourceDto
}

const createMockIngestionLog = (
    overrides: Partial<Components.Schemas.ArticleIngestionLogDto> = {},
): Components.Schemas.ArticleIngestionLogDto => ({
    id: 222,
    help_center_id: 456,
    article_ids: [789],
    dataset_id: 'dataset_123',
    created_datetime: '2024-01-01T00:00:00Z',
    url: 'https://example.com/article',
    domain: null,
    source: 'url',
    source_name: 'Example Article',
    status: 'SUCCESSFUL',
    raw_text: null,
    scraping_id: null,
    latest_sync: null,
    meta: null,
    ...overrides,
})

const createMockArticleData = (
    ingestionLog: Components.Schemas.ArticleIngestionLogDto,
    overrides: Partial<ArticleWithIngestion> = {},
): ArticleWithIngestion => ({
    id: 789,
    help_center_id: 456,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    deleted_datetime: null,
    unlisted_id: 'unlisted_123',
    available_locales: ['en-US'],
    category_id: null,
    ingested_resource_id: 111,
    translation: {
        title: 'Article Title',
        content: 'Article content',
        excerpt: '',
        slug: 'article-slug',
        locale: 'en-US',
        article_id: 789,
        category_id: null,
        article_unlisted_id: 'unlisted_123',
        seo_meta: { title: '', description: '' },
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        deleted_datetime: null,
        visibility_status: 'PUBLIC',
    } as Components.Schemas.LocalArticleTranslation,
    ingested_resource: {
        id: 111,
        article_ingestion_log_id: ingestionLog.id,
        scraping_id: 'scraping_123', // gitleaks:allow
        snippet_id: 'snippet_123',
        execution_id: 'exec_123',
        status: 'enabled',
        web_pages: [],
        title: 'Resource Title',
        article_ingestion_log: ingestionLog,
    },
    ...overrides,
})

describe('useEnrichedOpportunity', () => {
    let queryClient: QueryClient
    let mockClient: Partial<HelpCenterClient>

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        mockClient = {
            getArticle: jest.fn(),
        }

        mockUseHelpCenterApi.mockReturnValue({ client: mockClient })

        mockUseCheckOpportunityRelevance.mockReturnValue({
            isRelevant: true,
            isLoading: false,
        })
    })

    afterEach(() => {
        queryClient.clear()
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should return opportunity data without enrichment when no external_snippet resources', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'Article Title',
            resources: [
                {
                    title: 'Article Title',
                    content: 'Article content',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                },
            ],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toEqual({
            ...mockOpportunity,
            isRelevant: true,
        })
        expect(mockClient.getArticle).not.toHaveBeenCalled()
    })

    it('should return loading state while opportunity is being fetched', () => {
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should return loading state while checking opportunity relevance', () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Resolve conflict opportunity',
            resources: [],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        mockUseCheckOpportunityRelevance.mockReturnValue({
            isRelevant: true,
            isLoading: true,
        })

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should fetch and enrich external_snippet resources', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Snippet Title',
            detectionObjectIds: ['ticket_1'],
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '789',
                        resourceSetId: '456',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const mockIngestionLog = createMockIngestionLog()
        const mockArticleData = createMockArticleData(mockIngestionLog)

        ;(mockClient.getArticle as jest.Mock).mockResolvedValue({
            data: mockArticleData,
        })

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockClient.getArticle).toHaveBeenCalledWith({
            help_center_id: 456,
            id: 789,
            locale: 'en-US',
            with_ingestion: true,
        })

        expect(result.current.data?.resources[0]).toEqual({
            ...mockOpportunity.resources[0],
            meta: {
                articleIngestionLog: mockIngestionLog,
                executionId: 'exec_123',
            },
        })

        expect(result.current.data?.isRelevant).toBe(true)
    })

    it('should handle multiple external_snippet resources in parallel', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Multiple snippets',
            detectionObjectIds: ['ticket_1'],
            resources: [
                {
                    title: 'Snippet 1',
                    content: 'Content 1',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '789',
                        resourceSetId: '456',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
                {
                    title: 'Snippet 2',
                    content: 'Content 2',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '999',
                        resourceSetId: '456',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const mockIngestionLog1 = createMockIngestionLog({
            url: 'https://example.com/article1',
            source_name: 'Article 1',
        })

        const mockIngestionLog2 = createMockIngestionLog({
            id: 444,
            article_ids: [999],
            dataset_id: 'dataset_456',
            url: null,
            domain: 'example.com',
            source: 'domain',
            source_name: 'Example Domain',
        })

        const mockArticleData1 = createMockArticleData(mockIngestionLog1)
        const mockArticleData2 = createMockArticleData(mockIngestionLog2, {
            id: 999,
            unlisted_id: 'unlisted_456',
            ingested_resource_id: 333,
            translation: {
                title: 'Article Title 2',
                content: 'Article content 2',
                excerpt: '',
                slug: 'article-slug-2',
                locale: 'en-US',
                article_id: 999,
                category_id: null,
                article_unlisted_id: 'unlisted_456',
                seo_meta: { title: '', description: '' },
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                deleted_datetime: null,
                visibility_status: 'PUBLIC',
            } as Components.Schemas.LocalArticleTranslation,
            ingested_resource: {
                id: 333,
                article_ingestion_log_id: 444,
                scraping_id: 'scraping_456', // gitleaks:allow
                snippet_id: 'snippet_456',
                execution_id: 'exec_456',
                status: 'enabled',
                web_pages: [],
                title: 'Resource Title 2',
                article_ingestion_log: mockIngestionLog2,
            },
        })

        ;(mockClient.getArticle as jest.Mock)
            .mockResolvedValueOnce({ data: mockArticleData1 })
            .mockResolvedValueOnce({ data: mockArticleData2 })

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockClient.getArticle).toHaveBeenCalledTimes(2)

        expect(result.current.data?.resources[0]).toEqual({
            ...mockOpportunity.resources[0],
            meta: {
                articleIngestionLog: mockIngestionLog1,
                executionId: 'exec_123',
            },
        })

        expect(result.current.data?.resources[1]).toEqual({
            ...mockOpportunity.resources[1],
            meta: {
                articleIngestionLog: mockIngestionLog2,
                executionId: 'exec_456',
            },
        })
    })

    it('should handle mixed resource types', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Mixed resource types',
            resources: [
                {
                    title: 'Article Title',
                    content: 'Article content',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                },
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '789',
                        resourceSetId: '456',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const mockIngestionLog = createMockIngestionLog()
        const mockArticleData = createMockArticleData(mockIngestionLog)

        ;(mockClient.getArticle as jest.Mock).mockResolvedValue({
            data: mockArticleData,
        })

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockClient.getArticle).toHaveBeenCalledTimes(1)

        expect(result.current.data?.resources[0]).toEqual(
            mockOpportunity.resources[0],
        )

        expect(result.current.data?.resources[1]).toEqual({
            ...mockOpportunity.resources[1],
            meta: {
                articleIngestionLog: mockIngestionLog,
                executionId: 'exec_123',
            },
        })
    })

    it('should not fetch articles when opportunity query is disabled', async () => {
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        renderHook(
            () =>
                useEnrichedOpportunity(123, 456, {
                    query: { enabled: false },
                }),
            { wrapper },
        )

        expect(mockClient.getArticle).not.toHaveBeenCalled()
    })

    it('should handle article fetch errors gracefully', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Snippet Title',
            detectionObjectIds: ['ticket_1'],
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '789',
                        resourceSetId: '456',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        ;(mockClient.getArticle as jest.Mock).mockRejectedValue(
            new Error('API Error'),
        )

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data?.resources[0]).toEqual(
            mockOpportunity.resources[0],
        )
    })

    it('should skip enrichment when resource has no identifiers', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Snippet Title',
            detectionObjectIds: ['ticket_1'],
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                },
            ],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toEqual({
            ...mockOpportunity,
            isRelevant: true,
        })
        expect(mockClient.getArticle).not.toHaveBeenCalled()
    })

    it('should skip enrichment when resource locale is null', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Snippet Title',
            detectionObjectIds: ['ticket_1'],
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '789',
                        resourceSetId: '456',
                        resourceLocale: null,
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        mockUseCheckOpportunityRelevance.mockReturnValue({
            isRelevant: false,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toEqual({
            ...mockOpportunity,
            isRelevant: false,
        })
        expect(mockClient.getArticle).not.toHaveBeenCalled()
    })

    it('should include isRelevant field in enriched data', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Test opportunity',
            resources: [],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        mockUseCheckOpportunityRelevance.mockReturnValue({
            isRelevant: false,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toEqual({
            ...mockOpportunity,
            isRelevant: false,
        })
    })

    it('should include isRelevant as true when loading or not yet determined', async () => {
        const mockOpportunity: Opportunity = {
            id: '123',
            key: 'ks_123',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Test opportunity',
            resources: [],
        }

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunity,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        mockUseCheckOpportunityRelevance.mockReturnValue({
            isRelevant: true,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toEqual({
            ...mockOpportunity,
            isRelevant: true,
        })
    })

    it('should return undefined data when opportunity is undefined', async () => {
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(
            () => useEnrichedOpportunity(123, 456, {}),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toBeUndefined()
    })
})
