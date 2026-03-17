import type { UseQueryResult } from '@tanstack/react-query'

import type { Components } from 'rest_api/help_center_api/client.generated'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { ResourceType } from '../../types'
import { enrichOpportunityWithIngestion } from '../enrichOpportunityWithIngestion'

type ArticleWithIngestion = Components.Schemas.ArticleWithLocalTranslation & {
    ingested_resource?: Components.Schemas.IngestedResourceDto
}

const createMockIngestionLog = (
    overrides: Partial<Components.Schemas.ArticleIngestionLogDto> = {},
): Components.Schemas.ArticleIngestionLogDto => ({
    id: 222,
    help_center_id: 789,
    article_ids: [456],
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
    ingestionLog?: Components.Schemas.ArticleIngestionLogDto,
    overrides: Partial<ArticleWithIngestion> = {},
): ArticleWithIngestion => ({
    id: 456,
    help_center_id: 789,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    deleted_datetime: null,
    unlisted_id: 'unlisted_123',
    available_locales: ['en-US'],
    category_id: null,
    ingested_resource_id: ingestionLog ? 111 : null,
    translation: {
        title: 'Article Title',
        content: 'Article content',
        excerpt: '',
        slug: 'article-slug',
        locale: 'en-US',
        article_id: 456,
        category_id: null,
        article_unlisted_id: 'unlisted_123',
        seo_meta: { title: '', description: '' },
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        deleted_datetime: null,
        visibility_status: 'PUBLIC',
    } as Components.Schemas.LocalArticleTranslation,
    ingested_resource: ingestionLog
        ? {
              id: 111,
              article_ingestion_log_id: ingestionLog.id,
              scraping_id: 'scraping_123', // gitleaks:allow
              snippet_id: 'snippet_123',
              execution_id: 'exec_123',
              status: 'enabled',
              web_pages: [],
              title: 'Resource Title',
              article_ingestion_log: ingestionLog,
          }
        : undefined,
    ...overrides,
})

const createMockArticleQuery = (
    data: ArticleWithIngestion | null,
    isLoading = false,
): UseQueryResult<ArticleWithIngestion | null> =>
    ({
        data,
        isLoading,
        isError: false,
        error: null,
    }) as UseQueryResult<ArticleWithIngestion | null>

describe('enrichOpportunityWithIngestion', () => {
    const baseOpportunity: Opportunity = {
        id: '123',
        key: 'ks_123',
        type: OpportunityType.RESOLVE_CONFLICT,
        insight: 'Base opportunity for testing',
        detectionObjectIds: ['ticket_1'],
        resources: [],
    }

    it('should return opportunity unchanged when there are no external_snippet resources', () => {
        const opportunity: Opportunity = {
            ...baseOpportunity,
            resources: [
                {
                    title: 'Article Title',
                    content: 'Article content',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                },
            ],
        }

        const result = enrichOpportunityWithIngestion(opportunity, [])

        expect(result).toEqual(opportunity)
    })

    it('should return opportunity unchanged when external_snippet has no identifiers', () => {
        const opportunity: Opportunity = {
            ...baseOpportunity,
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                },
            ],
        }

        const result = enrichOpportunityWithIngestion(opportunity, [])

        expect(result).toEqual(opportunity)
    })

    it('should enrich external_snippet resource with article ingestion log and execution ID', () => {
        const opportunity: Opportunity = {
            ...baseOpportunity,
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '456',
                        resourceSetId: '789',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        const mockIngestionLog = createMockIngestionLog()
        const articleData = createMockArticleData(mockIngestionLog)
        const articleQueries = [createMockArticleQuery(articleData)]

        const result = enrichOpportunityWithIngestion(
            opportunity,
            articleQueries,
        )

        expect(result.resources[0]).toEqual({
            ...opportunity.resources[0],
            meta: {
                articleIngestionLog: mockIngestionLog,
                executionId: 'exec_123',
            },
        })
    })

    it('should handle multiple external_snippet resources', () => {
        const opportunity: Opportunity = {
            ...baseOpportunity,
            resources: [
                {
                    title: 'Snippet 1',
                    content: 'Content 1',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '456',
                        resourceSetId: '789',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
                {
                    title: 'Article',
                    content: 'Article content',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                },
                {
                    title: 'Snippet 2',
                    content: 'Content 2',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '789',
                        resourceSetId: '789',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        const mockIngestionLog1 = createMockIngestionLog({
            url: 'https://example.com/article1',
            source_name: 'Example Article 1',
        })

        const mockIngestionLog2 = createMockIngestionLog({
            id: 444,
            article_ids: [789],
            dataset_id: 'dataset_456',
            url: null,
            domain: 'example2.com',
            source: 'domain',
            source_name: 'Example Domain',
        })

        const articleData1 = createMockArticleData(mockIngestionLog1)
        const articleData2 = createMockArticleData(mockIngestionLog2, {
            id: 789,
            unlisted_id: 'unlisted_456',
            ingested_resource_id: 333,
            translation: {
                title: 'Article Title 2',
                content: 'Article content 2',
                excerpt: '',
                slug: 'article-slug-2',
                locale: 'en-US',
                article_id: 789,
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

        const articleQueries = [
            createMockArticleQuery(articleData1),
            createMockArticleQuery(articleData2),
        ]

        const result = enrichOpportunityWithIngestion(
            opportunity,
            articleQueries,
        )

        expect(result.resources[0]).toEqual({
            ...opportunity.resources[0],
            meta: {
                articleIngestionLog: mockIngestionLog1,
                executionId: 'exec_123',
            },
        })

        expect(result.resources[1]).toEqual(opportunity.resources[1])

        expect(result.resources[2]).toEqual({
            ...opportunity.resources[2],
            meta: {
                articleIngestionLog: mockIngestionLog2,
                executionId: 'exec_456',
            },
        })
    })

    it('should return resource unchanged when article query has no data', () => {
        const opportunity: Opportunity = {
            ...baseOpportunity,
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '456',
                        resourceSetId: '789',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        const articleQueries = [createMockArticleQuery(null)]

        const result = enrichOpportunityWithIngestion(
            opportunity,
            articleQueries,
        )

        expect(result.resources[0]).toEqual(opportunity.resources[0])
    })

    it('should return resource unchanged when article has no ingested_resource', () => {
        const opportunity: Opportunity = {
            ...baseOpportunity,
            resources: [
                {
                    title: 'Snippet Title',
                    content: 'Snippet content',
                    type: ResourceType.EXTERNAL_SNIPPET,
                    isVisible: true,
                    identifiers: {
                        resourceId: '456',
                        resourceSetId: '789',
                        resourceLocale: 'en-US',
                        resourceVersion: 'v1',
                    },
                },
            ],
        }

        const articleData = createMockArticleData()
        const articleQueries = [createMockArticleQuery(articleData)]

        const result = enrichOpportunityWithIngestion(
            opportunity,
            articleQueries,
        )

        expect(result.resources[0]).toEqual(opportunity.resources[0])
    })
})
