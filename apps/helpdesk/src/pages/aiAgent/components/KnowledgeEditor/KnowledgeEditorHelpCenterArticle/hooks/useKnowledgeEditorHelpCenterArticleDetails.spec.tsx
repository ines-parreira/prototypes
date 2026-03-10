import { renderHook } from '@testing-library/react'

import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context'
import type { ArticleContextValue } from '../context'
import { useArticleDetailsFromContext } from './useKnowledgeEditorHelpCenterArticleDetails'

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseArticleContext = useArticleContext as jest.Mock

describe('useArticleDetailsFromContext', () => {
    const mockTranslation = {
        locale: 'en-US' as const,
        title: 'Test Article Title',
        content: '<p>Test content</p>',
        slug: 'test-article-slug',
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
        draft_version_id: 100,
        published_version_id: 100,
        published_datetime: null,
        publisher_user_id: null,
        commit_message: null,
        version: null,
    }

    const mockArticle = {
        id: 123,
        unlisted_id: 'test-unlisted-id',
        help_center_id: 1,
        available_locales: ['en-US'] as LocaleCode[],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        rating: { up: 0, down: 0 },
        category_id: 1,
        ingested_resource_id: null,
        translation: mockTranslation,
    }

    const mockHelpCenter: any = {
        id: 1,
        name: 'Test Help Center',
        subdomain: 'acme',
        domain_type: 'SUBDOMAIN' as const,
        custom_domain: null,
        default_locale: 'en-US' as const,
        locales: ['en-US'] as LocaleCode[],
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
    }

    const createMockContext = (
        overrides: Partial<{
            state: Partial<ArticleContextValue['state']>
            config: Partial<ArticleContextValue['config']>
        }> = {},
    ): Partial<ArticleContextValue> => ({
        state: {
            articleMode: 'edit',
            isFullscreen: false,
            isDetailsView: true,
            title: 'Test Article Title',
            content: '<p>Test content</p>',
            savedSnapshot: {
                title: 'Test Article Title',
                content: '<p>Test content</p>',
            },
            isAutoSaving: false,
            article: mockArticle,
            translationMode: 'existing',
            currentLocale: 'en-US',
            pendingSettingsChanges: {},
            versionStatus: 'latest_draft',
            activeModal: null,
            isUpdating: false,
            templateKey: undefined,
            ...overrides.state,
        } as ArticleContextValue['state'],
        config: {
            helpCenter: mockHelpCenter,
            supportedLocales: [],
            categories: [],
            initialMode: 'edit',
            onClose: jest.fn(),
            ...overrides.config,
        } as ArticleContextValue['config'],
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('article data', () => {
        it('should return article details with version IDs and isCurrent', () => {
            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.article).toEqual({
                id: 123,
                title: 'Test Article Title',
                draftVersionId: 100,
                publishedVersionId: 100,
                isCurrent: true,
            })
        })

        it('should return undefined article when state.article is undefined', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.article).toBeUndefined()
        })

        it('should return isCurrent as false when translation is not current', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                is_current: false,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.article?.isCurrent).toBe(false)
        })
    })

    describe('datetime fields', () => {
        it('should return createdDatetime as Date object', () => {
            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.createdDatetime).toEqual(
                new Date('2024-01-01T00:00:00Z'),
            )
        })

        it('should return lastUpdatedDatetime as Date object', () => {
            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.lastUpdatedDatetime).toEqual(
                new Date('2024-01-02T00:00:00Z'),
            )
        })

        it('should return undefined dates when article is undefined', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.createdDatetime).toBeUndefined()
            expect(result.current.lastUpdatedDatetime).toBeUndefined()
        })
    })

    describe('articleUrl', () => {
        it('should return articleUrl when article has slug', () => {
            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.articleUrl).toContain('test-article-slug')
            expect(result.current.articleUrl).toContain('123')
        })

        it('should return undefined articleUrl when translationMode is new', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { translationMode: 'new' },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.articleUrl).toBeUndefined()
        })

        it('should return undefined articleUrl when article is undefined', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.articleUrl).toBeUndefined()
        })

        it('should return undefined articleUrl when slug is empty', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                slug: '',
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.articleUrl).toBeUndefined()
        })
    })

    describe('UNLISTED visibility', () => {
        it('should include unlisted_id in URL for UNLISTED articles', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                visibility_status: 'UNLISTED',
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.articleUrl).toContain('test-unlisted-id')
        })
    })

    describe('helpCenter', () => {
        it('should return helpCenter with label and id', () => {
            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.helpCenter).toEqual({
                label: 'Test Help Center',
                id: 1,
            })
        })

        it('should return helpCenter data from config', () => {
            const customHelpCenter: any = {
                id: 999,
                name: 'Custom Help Center',
                subdomain: 'custom',
                domain_type: 'SUBDOMAIN' as const,
                custom_domain: null,
                default_locale: 'en-US' as const,
                locales: ['en-US'] as LocaleCode[],
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-02T00:00:00Z',
            }

            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    config: { helpCenter: customHelpCenter },
                }),
            )

            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current.helpCenter).toEqual({
                label: 'Custom Help Center',
                id: 999,
            })
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useArticleDetailsFromContext())

            expect(result.current).toHaveProperty('article')
            expect(result.current).toHaveProperty('createdDatetime')
            expect(result.current).toHaveProperty('lastUpdatedDatetime')
            expect(result.current).toHaveProperty('articleUrl')
            expect(result.current).toHaveProperty('helpCenter')
        })
    })
})
