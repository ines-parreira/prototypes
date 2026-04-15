import type { Components } from 'rest_api/help_center_api/client.generated'

import { transformArticleListToSkillsView } from './transformArticleListToSkillsView'

type ArticleListDataDto = Components.Schemas.ArticleListDataDto

const makeArticle = (
    overrides: Omit<Partial<ArticleListDataDto>, 'translation'> & {
        translation?: Partial<ArticleListDataDto['translation']>
    },
): ArticleListDataDto =>
    ({
        id: 1,
        unlisted_id: 'abc',
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        category_id: null,
        help_center_id: 123,
        origin: 'skill',
        ingested_resource_id: null,
        available_locales: ['en-US'],
        rating: { positive: 0, negative: 0 },
        ...overrides,
        translation: {
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            title: 'Test Article',
            excerpt: '',
            content: '',
            slug: 'test-article',
            locale: 'en-US',
            article_id: 1,
            category_id: null,
            article_unlisted_id: 'abc',
            seo_meta: { title: null, description: null },
            visibility_status: 'PUBLIC',
            customer_visibility: 'PUBLIC',
            is_current: true,
            draft_version_id: null,
            published_version_id: 100,
            published_datetime: '2024-01-01T00:00:00Z',
            publisher_user_id: null,
            commit_message: null,
            version: 1,
            intents: null,
            rating: { positive: 0, negative: 0 },
            ...overrides.translation,
        },
    }) as ArticleListDataDto

describe('transformArticleListToSkillsView', () => {
    it('should transform articles with intents', () => {
        const articles = [
            makeArticle({
                id: 1,
                translation: {
                    title: 'Order Status',
                    intents: ['order::status' as any],
                    published_version_id: 100,
                    draft_version_id: null,
                },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result).toEqual([
            {
                id: 1,
                title: 'Order Status',
                intents: [
                    { name: 'order::status', formattedName: 'Order / Status' },
                ],
                status: 'enabled',
                publishedVersion: {
                    locale: 'en-US',
                    article_translation_version_id: 100,
                },
            },
        ])
    })

    it('should detect draft version', () => {
        const articles = [
            makeArticle({
                translation: {
                    draft_version_id: 101,
                    published_version_id: 100,
                },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].draftVersion).toEqual({
            locale: 'en-US',
            article_translation_version_id: 101,
        })
        expect(result[0].publishedVersion).toEqual({
            locale: 'en-US',
            article_translation_version_id: 100,
        })
    })

    it('should not set draftVersion when draft and published version IDs are the same', () => {
        const articles = [
            makeArticle({
                translation: {
                    draft_version_id: 100,
                    published_version_id: 100,
                },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].draftVersion).toBeUndefined()
        expect(result[0].publishedVersion).toBeDefined()
    })

    it('should not set draftVersion when draft_version_id is null', () => {
        const articles = [
            makeArticle({
                translation: {
                    draft_version_id: null,
                    published_version_id: 100,
                },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].draftVersion).toBeUndefined()
    })

    it('should map PUBLIC visibility to enabled', () => {
        const articles = [
            makeArticle({
                translation: { visibility_status: 'PUBLIC' as const },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].status).toBe('enabled')
    })

    it('should map UNLISTED visibility to disabled', () => {
        const articles = [
            makeArticle({
                translation: { visibility_status: 'UNLISTED' as const },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].status).toBe('disabled')
    })

    it('should handle articles with no intents', () => {
        const articles = [
            makeArticle({ translation: { intents: null } }),
            makeArticle({ id: 2, translation: { intents: [] as any } }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].intents).toEqual([])
        expect(result[1].intents).toEqual([])
    })

    it('should handle multiple intents per article', () => {
        const articles = [
            makeArticle({
                translation: {
                    intents: ['order::status' as any, 'order::tracking' as any],
                },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].intents).toHaveLength(2)
        expect(result[0].intents).toEqual([
            { name: 'order::status', formattedName: 'Order / Status' },
            { name: 'order::tracking', formattedName: 'Order / Tracking' },
        ])
    })

    it('should format intent names correctly', () => {
        const articles = [
            makeArticle({
                translation: {
                    intents: ['account::password reset' as any],
                },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].intents[0].formattedName).toBe(
            'Account / Password Reset',
        )
    })

    it('should return empty array for empty input', () => {
        expect(transformArticleListToSkillsView([])).toEqual([])
    })

    it('should handle draft-only articles (no published version)', () => {
        const articles = [
            makeArticle({
                translation: {
                    draft_version_id: 101,
                    published_version_id: null,
                },
            }),
        ]

        const result = transformArticleListToSkillsView(articles)

        expect(result[0].draftVersion).toBeDefined()
        expect(result[0].publishedVersion).toBeUndefined()
    })
})
