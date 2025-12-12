import type { KnowledgeHubArticle } from 'models/helpCenter/types'
import { KnowledgeHubArticleSourceType } from 'models/helpCenter/types'

import { KnowledgeType, KnowledgeVisibility } from '../types'
import {
    mapSourceTypeToKnowledgeType,
    transformKnowledgeHubArticlesToKnowledgeItems,
} from './transformKnowledgeHubArticles'

describe('mapSourceTypeToKnowledgeType', () => {
    it('should map guidance-helpcenter to Guidance', () => {
        const result = mapSourceTypeToKnowledgeType(
            KnowledgeHubArticleSourceType.GuidanceHelpCenter,
        )
        expect(result).toBe(KnowledgeType.Guidance)
    })

    it('should map faq-helpcenter to FAQ', () => {
        const result = mapSourceTypeToKnowledgeType(
            KnowledgeHubArticleSourceType.FaqHelpCenter,
        )
        expect(result).toBe(KnowledgeType.FAQ)
    })

    it('should map store-domain to Domain', () => {
        const result = mapSourceTypeToKnowledgeType(
            KnowledgeHubArticleSourceType.StoreDomain,
        )
        expect(result).toBe(KnowledgeType.Domain)
    })

    it('should map url to URL', () => {
        const result = mapSourceTypeToKnowledgeType(
            KnowledgeHubArticleSourceType.Url,
        )
        expect(result).toBe(KnowledgeType.URL)
    })

    it('should map document to Document', () => {
        const result = mapSourceTypeToKnowledgeType(
            KnowledgeHubArticleSourceType.Document,
        )
        expect(result).toBe(KnowledgeType.Document)
    })

    it('should return Guidance for unknown types', () => {
        const result = mapSourceTypeToKnowledgeType('unknown' as any)
        expect(result).toBe(KnowledgeType.Guidance)
    })
})

describe('transformKnowledgeHubArticlesToKnowledgeItems', () => {
    const mockArticle: KnowledgeHubArticle = {
        id: 1,
        title: 'Test Article',
        type: KnowledgeHubArticleSourceType.FaqHelpCenter,
        updatedDatetime: '2024-01-15T10:00:00Z',
        createdDatetime: '2024-01-01T10:00:00Z',
        visibilityStatus: 'PUBLIC',
        source: 'test-source.com',
        localeCode: 'en-US',
        shopName: 'test-shop',
        draftVersionId: null,
        publishedVersionId: null,
    }

    it('should transform single article correctly', () => {
        const result = transformKnowledgeHubArticlesToKnowledgeItems([
            mockArticle,
        ])

        expect(result).toEqual([
            {
                id: '1',
                title: 'Test Article',
                type: KnowledgeType.FAQ,
                lastUpdatedAt: '2024-01-15T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                source: 'test-source.com',
                localeCode: 'en-US',
                publishedVersionId: null,
                draftVersionId: null,
            },
        ])
    })

    it('should transform multiple articles', () => {
        const articles: KnowledgeHubArticle[] = [
            mockArticle,
            {
                ...mockArticle,
                id: 2,
                title: 'Second Article',
                type: KnowledgeHubArticleSourceType.GuidanceHelpCenter,
                visibilityStatus: 'UNLISTED',
                source: 'another-source.com',
            },
            {
                ...mockArticle,
                id: 3,
                title: 'Third Article',
                type: KnowledgeHubArticleSourceType.Document,
                visibilityStatus: 'UNLISTED',
                source: 'doc-source.pdf',
            },
        ]

        const result = transformKnowledgeHubArticlesToKnowledgeItems(articles)

        expect(result).toHaveLength(3)
        expect(result[0].id).toBe('1')
        expect(result[1].id).toBe('2')
        expect(result[2].id).toBe('3')
        expect(result[1].type).toBe(KnowledgeType.Guidance)
        expect(result[2].type).toBe(KnowledgeType.Document)
    })

    it('should handle empty array', () => {
        const result = transformKnowledgeHubArticlesToKnowledgeItems([])

        expect(result).toEqual([])
    })

    it('should convert visibility status to lowercase', () => {
        const articles: KnowledgeHubArticle[] = [
            { ...mockArticle, visibilityStatus: 'PUBLIC' },
            { ...mockArticle, id: 2, visibilityStatus: 'UNLISTED' },
        ]

        const result = transformKnowledgeHubArticlesToKnowledgeItems(articles)

        expect(result[0].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
        expect(result[1].inUseByAI).toBe(KnowledgeVisibility.UNLISTED)
    })

    it('should convert id to string', () => {
        const article: KnowledgeHubArticle = {
            ...mockArticle,
            id: 12345,
        }

        const result = transformKnowledgeHubArticlesToKnowledgeItems([article])

        expect(result[0].id).toBe('12345')
        expect(typeof result[0].id).toBe('string')
    })

    it('should preserve all required fields', () => {
        const article: KnowledgeHubArticle = {
            id: 999,
            title: 'Complete Article',
            type: KnowledgeHubArticleSourceType.Url,
            updatedDatetime: '2024-12-01T15:30:00Z',
            createdDatetime: '2024-11-01T10:00:00Z',
            visibilityStatus: 'PUBLIC',
            source: 'https://example.com/article',
            localeCode: 'en-US',
            shopName: 'my-shop',
            draftVersionId: null,
            publishedVersionId: null,
        }

        const result = transformKnowledgeHubArticlesToKnowledgeItems([article])

        expect(result[0]).toMatchObject({
            id: '999',
            title: 'Complete Article',
            type: KnowledgeType.URL,
            lastUpdatedAt: '2024-12-01T15:30:00Z',
            inUseByAI: KnowledgeVisibility.PUBLIC,
            source: 'https://example.com/article',
        })
    })

    it('should handle all source types correctly', () => {
        const articles: KnowledgeHubArticle[] = [
            {
                ...mockArticle,
                id: 1,
                type: KnowledgeHubArticleSourceType.GuidanceHelpCenter,
            },
            {
                ...mockArticle,
                id: 2,
                type: KnowledgeHubArticleSourceType.FaqHelpCenter,
            },
            {
                ...mockArticle,
                id: 3,
                type: KnowledgeHubArticleSourceType.StoreDomain,
            },
            { ...mockArticle, id: 4, type: KnowledgeHubArticleSourceType.Url },
            {
                ...mockArticle,
                id: 5,
                type: KnowledgeHubArticleSourceType.Document,
            },
        ]

        const result = transformKnowledgeHubArticlesToKnowledgeItems(articles)

        expect(result[0].type).toBe(KnowledgeType.Guidance)
        expect(result[1].type).toBe(KnowledgeType.FAQ)
        expect(result[2].type).toBe(KnowledgeType.Domain)
        expect(result[3].type).toBe(KnowledgeType.URL)
        expect(result[4].type).toBe(KnowledgeType.Document)
    })
})
