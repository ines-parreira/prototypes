import type { AILibraryArticleItem } from 'models/helpCenter/types'

import { OpportunityType } from '../enums'
import { ResourceType } from '../types'
import { mapAiArticlesToOpportunities } from './mapAiArticlesToOpportunities'

describe('mapAiArticlesToOpportunities', () => {
    const mockAiArticle: AILibraryArticleItem = {
        key: 'test-article-1',
        title: 'Test Article Title',
        html_content: '<p>Test article content</p>',
        isNew: true,
        batch_datetime: '2023-01-01T00:00:00Z',
        excerpt: 'Test article excerpt',
        category: 'Test article category',
        score: 0.5,
        review_action: undefined,
    }

    it('should map a single AI article to opportunity correctly', () => {
        const aiArticles = [mockAiArticle]
        const result = mapAiArticlesToOpportunities(aiArticles)

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
            id: 'test-article-1',
            key: 'test-article-1',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'Test Article Title',
            resources: [
                {
                    title: 'Test Article Title',
                    content: '<p>Test article content</p>',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                    insight: 'Test article content',
                },
            ],
        })
    })

    it('should map multiple AI articles to opportunities correctly', () => {
        const aiArticles: AILibraryArticleItem[] = [
            mockAiArticle,
            {
                ...mockAiArticle,
                key: 'test-article-2',
                title: 'Second Article',
                html_content: '<p>Second article content</p>',
            },
            {
                ...mockAiArticle,
                key: 'test-article-3',
                title: 'Third Article',
                html_content: '<p>Third article content</p>',
                isNew: false,
            },
        ]

        const result = mapAiArticlesToOpportunities(aiArticles)

        expect(result).toHaveLength(3)
        expect(result[0]).toEqual({
            id: 'test-article-1',
            key: 'test-article-1',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'Test Article Title',
            resources: [
                {
                    title: 'Test Article Title',
                    content: '<p>Test article content</p>',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                    insight: 'Test article content',
                },
            ],
        })
        expect(result[1]).toEqual({
            id: 'test-article-2',
            key: 'test-article-2',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'Second Article',
            resources: [
                {
                    title: 'Second Article',
                    content: '<p>Second article content</p>',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                    insight: 'Second article content',
                },
            ],
        })
        expect(result[2]).toEqual({
            id: 'test-article-3',
            key: 'test-article-3',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'Third Article',
            resources: [
                {
                    title: 'Third Article',
                    content: '<p>Third article content</p>',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                    insight: 'Third article content',
                },
            ],
        })
    })

    it('should handle empty array input', () => {
        const result = mapAiArticlesToOpportunities([])
        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should handle articles with empty or null content', () => {
        const aiArticles: AILibraryArticleItem[] = [
            {
                ...mockAiArticle,
                html_content: '',
            },
            {
                ...mockAiArticle,
                key: 'test-article-2',
                title: 'Null Content Article',
                html_content: null as any,
            },
        ]

        const result = mapAiArticlesToOpportunities(aiArticles)

        expect(result).toHaveLength(2)
        expect(result[0].resources[0].content).toBe('')
        expect(result[0].resources[0].insight).toBe('')
        expect(result[1].resources[0].content).toBe(null)
        expect(result[1].resources[0].insight).toBe('')
    })

    it('should always map to FILL_KNOWLEDGE_GAP type', () => {
        const aiArticles = [
            mockAiArticle,
            { ...mockAiArticle, key: 'test-2' },
            { ...mockAiArticle, key: 'test-3' },
        ]

        const result = mapAiArticlesToOpportunities(aiArticles)

        result.forEach((opportunity) => {
            expect(opportunity.type).toBe(OpportunityType.FILL_KNOWLEDGE_GAP)
        })
    })

    it('should preserve article key as opportunity id', () => {
        const uniqueKeys = ['unique-key-1', 'special-key-2', 'article-xyz']
        const aiArticles = uniqueKeys.map((key) => ({
            ...mockAiArticle,
            key,
        }))

        const result = mapAiArticlesToOpportunities(aiArticles)

        result.forEach((opportunity, index) => {
            expect(opportunity.id).toBe(uniqueKeys[index])
        })
    })

    it('should preserve article title exactly', () => {
        const titles = ['Simple Title', 'Title with special chars: @#$%', '']
        const aiArticles = titles.map((title, index) => ({
            ...mockAiArticle,
            key: `article-${index}`,
            title,
        }))

        const result = mapAiArticlesToOpportunities(aiArticles)

        result.forEach((opportunity, index) => {
            expect(opportunity.resources[0].title).toBe(titles[index])
            expect(opportunity.insight).toBe(titles[index])
        })
    })

    it('should not modify the input array', () => {
        const aiArticles = [mockAiArticle]
        const originalLength = aiArticles.length
        const originalFirstItem = { ...aiArticles[0] }

        mapAiArticlesToOpportunities(aiArticles)

        expect(aiArticles).toHaveLength(originalLength)
        expect(aiArticles[0]).toEqual(originalFirstItem)
    })

    it('should return a new array instance', () => {
        const aiArticles = [mockAiArticle]
        const result = mapAiArticlesToOpportunities(aiArticles)

        expect(result).not.toBe(aiArticles)
        expect(Array.isArray(result)).toBe(true)
    })
})
