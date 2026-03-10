import type {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
    LocaleCode,
} from 'models/helpCenter/types'

import {
    computeCanEdit,
    computeHasDraft,
    createEmptyTranslation,
    getEditModeFromVisibility,
    mergeContentAndTitle,
    mergeTranslationResponse,
} from './utils'

describe('utils', () => {
    const mockTranslation = {
        locale: 'en-US' as const,
        title: 'Test Article',
        content: '<p>Test content</p>',
        slug: 'test-article',
        excerpt: 'Test excerpt',
        category_id: 1,
        visibility_status: 'PUBLIC' as const,
        customer_visibility: 'PUBLIC' as const,
        article_id: 123,
        article_unlisted_id: 'test-unlisted-id',
        seo_meta: { title: 'SEO Title', description: 'SEO Description' },
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        is_current: true,
        draft_version_id: null,
        published_version_id: null,
        published_datetime: null,
        publisher_user_id: null,
        commit_message: null,
        version: null,
    }

    const mockArticle: ArticleWithLocalTranslation = {
        id: 123,
        unlisted_id: 'test-unlisted-id',
        help_center_id: 1,
        available_locales: ['en-US'] as LocaleCode[],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        category_id: 1,
        ingested_resource_id: null,
        translation: mockTranslation,
    }

    describe('createEmptyTranslation', () => {
        it('should create an empty translation with correct article references', () => {
            const { translation: __translation, ...articleWithoutTranslation } =
                mockArticle
            const locale: LocaleCode = 'fr-FR'

            const result = createEmptyTranslation(
                articleWithoutTranslation,
                locale,
            )

            expect(result.article_id).toBe(123)
            expect(result.article_unlisted_id).toBe('test-unlisted-id')
            expect(result.locale).toBe('fr-FR')
        })

        it('should create an empty translation with default values', () => {
            const { translation: __translation, ...articleWithoutTranslation } =
                mockArticle

            const result = createEmptyTranslation(
                articleWithoutTranslation,
                'en-US',
            )

            expect(result.title).toBe('')
            expect(result.content).toBe('')
            expect(result.excerpt).toBe('')
            expect(result.slug).toBe('')
            expect(result.category_id).toBeNull()
            expect(result.visibility_status).toBe('PUBLIC')
            expect(result.is_current).toBe(true)
            expect(result.draft_version_id).toBeNull()
            expect(result.published_version_id).toBeNull()
        })

        it('should create an empty translation with seo_meta nulls', () => {
            const { translation: __translation, ...articleWithoutTranslation } =
                mockArticle

            const result = createEmptyTranslation(
                articleWithoutTranslation,
                'en-US',
            )

            expect(result.seo_meta).toEqual({
                title: null,
                description: null,
            })
        })

        it('should set created_datetime and updated_datetime', () => {
            const { translation: __translation, ...articleWithoutTranslation } =
                mockArticle
            const beforeCall = new Date().toISOString()

            const result = createEmptyTranslation(
                articleWithoutTranslation,
                'en-US',
            )

            const afterCall = new Date().toISOString()
            expect(result.created_datetime >= beforeCall).toBe(true)
            expect(result.created_datetime <= afterCall).toBe(true)
            expect(result.updated_datetime >= beforeCall).toBe(true)
            expect(result.updated_datetime <= afterCall).toBe(true)
        })
    })

    describe('mergeTranslationResponse', () => {
        it('should merge response into article translation', () => {
            const response: ArticleTranslationResponseDto = {
                title: 'Updated Title',
                content: '<p>Updated content</p>',
                slug: 'updated-slug',
                excerpt: 'Updated excerpt',
                category_id: 2,
                visibility_status: 'UNLISTED',
                customer_visibility: 'UNLISTED',
                locale: 'en-US',
                article_id: 123,
                article_unlisted_id: 'test-unlisted-id',
                seo_meta: {
                    title: 'New SEO',
                    description: 'New SEO Desc',
                },
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-03T00:00:00Z',
                is_current: true,
                draft_version_id: 456,
                published_version_id: 789,
                published_datetime: null,
                publisher_user_id: null,
                commit_message: null,
                version: null,
            }

            const result = mergeTranslationResponse(mockArticle, response)

            expect(result.translation.title).toBe('Updated Title')
            expect(result.translation.content).toBe('<p>Updated content</p>')
            expect(result.translation.slug).toBe('updated-slug')
            expect(result.translation.draft_version_id).toBe(456)
            expect(result.translation.published_version_id).toBe(789)
        })

        it('should preserve article properties outside of translation', () => {
            const response: ArticleTranslationResponseDto = {
                title: 'Updated Title',
                content: '<p>Updated content</p>',
                slug: 'updated-slug',
                excerpt: 'Updated excerpt',
                category_id: 2,
                visibility_status: 'UNLISTED',
                customer_visibility: 'UNLISTED',
                locale: 'en-US',
                article_id: 123,
                article_unlisted_id: 'test-unlisted-id',
                seo_meta: { title: null, description: null },
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-03T00:00:00Z',
                is_current: true,
                draft_version_id: null,
                published_version_id: null,
                published_datetime: null,
                publisher_user_id: null,
                commit_message: null,
                version: null,
            }

            const result = mergeTranslationResponse(mockArticle, response)

            expect(result.id).toBe(mockArticle.id)
            expect(result.unlisted_id).toBe(mockArticle.unlisted_id)
            expect(result.help_center_id).toBe(mockArticle.help_center_id)
            expect(result.available_locales).toBe(mockArticle.available_locales)
        })

        it('should override translation fields with response fields', () => {
            const response: ArticleTranslationResponseDto = {
                title: 'New Title',
                content: 'New Content',
                slug: 'new-slug',
                excerpt: 'New Excerpt',
                category_id: 999,
                visibility_status: 'UNLISTED',
                customer_visibility: 'UNLISTED',
                locale: 'en-US',
                article_id: 123,
                article_unlisted_id: 'test-unlisted-id',
                seo_meta: { title: 'SEO', description: 'Desc' },
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-03T00:00:00Z',
                is_current: false,
                draft_version_id: null,
                published_version_id: null,
                published_datetime: null,
                publisher_user_id: null,
                commit_message: null,
                version: null,
            }

            const result = mergeTranslationResponse(mockArticle, response)

            expect(result.translation.category_id).toBe(999)
            expect(result.translation.visibility_status).toBe('UNLISTED')
            expect(result.translation.is_current).toBe(false)
        })
    })

    describe('mergeContentAndTitle', () => {
        it('should merge content and title into article translation', () => {
            const result = mergeContentAndTitle(
                mockArticle,
                '<p>New content</p>',
                'New Title',
            )

            expect(result.translation.content).toBe('<p>New content</p>')
            expect(result.translation.title).toBe('New Title')
        })

        it('should preserve other translation properties', () => {
            const result = mergeContentAndTitle(
                mockArticle,
                '<p>New content</p>',
                'New Title',
            )

            expect(result.translation.slug).toBe(mockArticle.translation.slug)
            expect(result.translation.excerpt).toBe(
                mockArticle.translation.excerpt,
            )
            expect(result.translation.category_id).toBe(
                mockArticle.translation.category_id,
            )
            expect(result.translation.visibility_status).toBe(
                mockArticle.translation.visibility_status,
            )
        })

        it('should preserve article properties outside of translation', () => {
            const result = mergeContentAndTitle(
                mockArticle,
                '<p>New content</p>',
                'New Title',
            )

            expect(result.id).toBe(mockArticle.id)
            expect(result.unlisted_id).toBe(mockArticle.unlisted_id)
            expect(result.help_center_id).toBe(mockArticle.help_center_id)
        })
    })

    describe('getEditModeFromVisibility', () => {
        it('should return "edit" for PUBLIC visibility', () => {
            expect(getEditModeFromVisibility('PUBLIC')).toBe('edit')
        })

        it('should return "edit" for UNLISTED visibility', () => {
            expect(getEditModeFromVisibility('UNLISTED')).toBe('edit')
        })
    })

    describe('computeHasDraft', () => {
        it('should return false when article is undefined', () => {
            expect(computeHasDraft(undefined)).toBe(false)
        })

        it('should return true when published_version_id is null', () => {
            const article: ArticleWithLocalTranslation = {
                ...mockArticle,
                translation: {
                    ...mockTranslation,
                    draft_version_id: 123,
                    published_version_id: null,
                },
            }

            expect(computeHasDraft(article)).toBe(true)
        })

        it('should return true when draft_version_id differs from published_version_id', () => {
            const article: ArticleWithLocalTranslation = {
                ...mockArticle,
                translation: {
                    ...mockTranslation,
                    draft_version_id: 456,
                    published_version_id: 123,
                },
            }

            expect(computeHasDraft(article)).toBe(true)
        })

        it('should return false when draft_version_id equals published_version_id', () => {
            const article: ArticleWithLocalTranslation = {
                ...mockArticle,
                translation: {
                    ...mockTranslation,
                    draft_version_id: 123,
                    published_version_id: 123,
                },
            }

            expect(computeHasDraft(article)).toBe(false)
        })

        it('should return true when both version IDs are null', () => {
            const article: ArticleWithLocalTranslation = {
                ...mockArticle,
                translation: {
                    ...mockTranslation,
                    draft_version_id: null,
                    published_version_id: null,
                },
            }

            expect(computeHasDraft(article)).toBe(true)
        })
    })

    describe('computeCanEdit', () => {
        it('should return true when article is undefined', () => {
            expect(computeCanEdit(undefined, false)).toBe(true)
            expect(computeCanEdit(undefined, true)).toBe(true)
        })

        it('should return false when viewing current version and has draft', () => {
            const article: ArticleWithLocalTranslation = {
                ...mockArticle,
                translation: {
                    ...mockTranslation,
                    is_current: true,
                },
            }

            expect(computeCanEdit(article, true)).toBe(false)
        })

        it('should return true when viewing current version and no draft', () => {
            const article: ArticleWithLocalTranslation = {
                ...mockArticle,
                translation: {
                    ...mockTranslation,
                    is_current: true,
                },
            }

            expect(computeCanEdit(article, false)).toBe(true)
        })

        it('should return true when viewing draft version', () => {
            const article: ArticleWithLocalTranslation = {
                ...mockArticle,
                translation: {
                    ...mockTranslation,
                    is_current: false,
                },
            }

            expect(computeCanEdit(article, true)).toBe(true)
            expect(computeCanEdit(article, false)).toBe(true)
        })
    })
})
