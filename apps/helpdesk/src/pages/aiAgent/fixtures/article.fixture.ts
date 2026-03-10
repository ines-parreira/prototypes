import type {
    Article,
    CreateArticleDto,
    LocaleCode,
} from 'models/helpCenter/types'

export const getCreateArticleDtoFixture = (
    overrides: Partial<CreateArticleDto> = {},
): CreateArticleDto => ({
    translation: {
        locale: 'en-US' as LocaleCode,
        title: 'Test Article Title',
        content: '<p>Test article content</p>',
        excerpt: 'Test excerpt',
        slug: 'test-article-title',
        seo_meta: {
            title: null,
            description: null,
        },
        visibility_status: 'PUBLIC',
        customer_visibility: 'PUBLIC',
        is_current: false,
        category_id: null,
    },
    template_key: null,
    origin: undefined,
    ingested_resource_id: null,
    ...overrides,
})

export const getArticleFixture = (
    id: number,
    overrides: Partial<Omit<Article, 'id'>> = {},
): Article => ({
    id,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    unlisted_id: `unlisted-${id}`,
    available_locales: ['en-US'],
    category_id: null,
    help_center_id: 1,
    template_key: null,
    origin: undefined,
    ingested_resource_id: null,
    position: 0,
    rating: { up: 0, down: 0 },
    translation: {
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        locale: 'en-US' as LocaleCode,
        title: `Test Article ${id}`,
        content: `<p>Test article content ${id}</p>`,
        excerpt: `Test excerpt ${id}`,
        slug: `test-article-${id}`,
        seo_meta: {
            title: null,
            description: null,
        },
        visibility_status: 'PUBLIC',
        customer_visibility: 'PUBLIC',
        is_current: true,
        category_id: null,
        article_id: id,
        article_unlisted_id: `unlisted-${id}`,
        rating: { up: 0, down: 0 },
        draft_version_id: null,
        published_version_id: null,
        published_datetime: null,
        publisher_user_id: null,
        commit_message: null,
        version: null,
    },
    ...overrides,
})
