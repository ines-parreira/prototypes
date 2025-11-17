import type {
    ArticleTranslationWithRating,
    LocaleCode,
} from 'models/helpCenter/types'

export const getArticleTranslationWithRatingFixture = (
    articleId: number,
    locale: LocaleCode = 'en-US',
    overrides: Partial<ArticleTranslationWithRating> = {},
): ArticleTranslationWithRating => ({
    locale,
    title: 'Test Article Title',
    content: '<p>Test article content</p>',
    excerpt: 'Test article excerpt',
    slug: 'test-article-title',
    seo_meta: {
        title: null,
        description: null,
    },
    visibility_status: 'PUBLIC',
    is_current: true,
    category_id: 1,
    article_id: articleId,
    article_unlisted_id: `unlisted-${articleId}`,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    rating: {
        up: 5,
        down: 1,
    },
    ...overrides,
})
