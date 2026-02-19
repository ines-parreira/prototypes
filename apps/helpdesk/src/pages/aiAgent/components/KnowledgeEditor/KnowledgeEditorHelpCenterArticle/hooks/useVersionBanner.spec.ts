import { act, renderHook } from '@testing-library/react'

import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useVersionBanner } from './useVersionBanner'

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockSwitchToVersion = jest.fn()
jest.mock('./useSwitchVersion', () => ({
    useSwitchVersion: () => ({ switchToVersion: mockSwitchToVersion }),
}))

const mockUseArticleContext = useArticleContext as jest.Mock

describe('useVersionBanner', () => {
    let mockDispatch: jest.Mock

    const mockTranslation = {
        locale: 'en-US' as const,
        title: 'Test Article',
        content: '<p>Test content</p>',
        slug: 'test-article',
        excerpt: 'Test excerpt',
        category_id: 1,
        visibility_status: 'PUBLIC' as const,
        article_id: 123,
        article_unlisted_id: 'test-unlisted-id',
        seo_meta: { title: 'SEO Title', description: 'SEO Description' },
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        deleted_datetime: null,
        is_current: false,
        rating: { up: 0, down: 0 },
        draft_version_id: 1,
        published_version_id: 2,
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

    const createMockContext = (
        overrides: Partial<{
            state: Partial<ArticleContextValue['state']>
            config: Partial<ArticleContextValue['config']>
            hasDraft: boolean
        }> = {},
    ): ArticleContextValue =>
        ({
            state: {
                articleMode: 'edit',
                isFullscreen: false,
                isDetailsView: true,
                title: 'Test Article',
                content: '<p>Test content</p>',
                savedSnapshot: {
                    title: 'Test Article',
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
            dispatch: mockDispatch,
            config: {
                helpCenter: { id: 1 },
                supportedLocales: [],
                categories: [],
                initialMode: 'edit',
                onClose: jest.fn(),
                ...overrides.config,
            } as ArticleContextValue['config'],
            hasPendingContentChanges: false,
            isFormValid: true,
            hasDraft: overrides.hasDraft ?? true,
            canEdit: true,
            playground: {
                isOpen: false,
                onTest: jest.fn(),
                onClose: jest.fn(),
                sidePanelWidth: '60vw',
                shouldHideFullscreenButton: false,
            },
        }) as ArticleContextValue

    beforeEach(() => {
        jest.clearAllMocks()

        mockDispatch = jest.fn()

        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('isViewingDraft', () => {
        it('should return true when is_current is false', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(true)
        })

        it('should return false when is_current is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                is_current: true,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })

        it('should return false when article is undefined', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                    hasDraft: false,
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })

        it('should return false when viewing a historical version even if article is a draft', () => {
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
                        historicalVersion: {
                            versionId: 10,
                            version: 5,
                            title: 'Historical Title',
                            content: 'Historical Content',
                            publishedDatetime: '2024-01-01T00:00:00Z',
                            impactDateRange: {
                                start_datetime: '2024-01-01T00:00:00Z',
                                end_datetime: '2024-02-01T00:00:00Z',
                            },
                        },
                    },
                    hasDraft: true,
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })
    })

    describe('hasDraftVersion', () => {
        it('should return true when hasDraft is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ hasDraft: true }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasDraftVersion).toBe(true)
        })

        it('should return false when hasDraft is false', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ hasDraft: false }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasDraftVersion).toBe(false)
        })
    })

    describe('hasPublishedVersion', () => {
        it('should return true when published_version_id exists', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(true)
        })

        it('should return false when published_version_id is null', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                published_version_id: null,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(false)
        })

        it('should return false when article is undefined', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                    hasDraft: false,
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(false)
        })
    })

    describe('isDisabled', () => {
        it('should return false when not updating and not auto-saving', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: true },
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when isAutoSaving is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isAutoSaving: true },
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when both isUpdating and isAutoSaving are true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: true, isAutoSaving: true },
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })
    })

    describe('switchVersion', () => {
        it('should call switchToVersion with "current" when viewing draft', async () => {
            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('current')
        })

        it('should call switchToVersion with "latest_draft" when viewing current', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                is_current: true,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('latest_draft')
        })

        it('should call switchToVersion with "current" when article is undefined', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                    hasDraft: false,
                }),
            )

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('current')
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current).toHaveProperty('isViewingDraft')
            expect(result.current).toHaveProperty('hasDraftVersion')
            expect(result.current).toHaveProperty('hasPublishedVersion')
            expect(result.current).toHaveProperty('isDisabled')
            expect(result.current).toHaveProperty('switchVersion')
            expect(typeof result.current.switchVersion).toBe('function')
        })
    })
})
