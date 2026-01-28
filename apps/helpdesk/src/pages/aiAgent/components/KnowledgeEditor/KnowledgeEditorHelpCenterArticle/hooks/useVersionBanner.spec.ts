import { act, renderHook } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import type { LocaleCode } from 'models/helpCenter/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useVersionBanner } from './useVersionBanner'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/resources', () => ({
    getHelpCenterArticle: jest.fn(),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseNotify = useNotify as jest.Mock
const mockGetHelpCenterArticle = getHelpCenterArticle as jest.Mock
const mockUseHelpCenterApi = useHelpCenterApi as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useVersionBanner', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockClient: { getArticle: jest.Mock }

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
    ): ArticleContextValue => ({
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
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockClient = { getArticle: jest.fn() }

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
        })
        mockUseHelpCenterApi.mockReturnValue({
            client: mockClient,
            isReady: true,
        })
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

        it('should return false when article has no translation is_current set', () => {
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
        const mockArticleResponse = {
            id: 123,
            translation: {
                title: 'Published Title',
                content: '<p>Published content</p>',
                locale: 'en-US',
                is_current: true,
                draft_version_id: 1,
                published_version_id: 2,
            },
        }

        it('should not do anything when article id is missing', async () => {
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

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockGetHelpCenterArticle).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should dispatch SET_UPDATING false at end', async () => {
            mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            const lastCall =
                mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
            expect(lastCall).toEqual([{ type: 'SET_UPDATING', payload: false }])
        })

        it('should call getHelpCenterArticle with "current" version_status when viewing draft', async () => {
            mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockGetHelpCenterArticle).toHaveBeenCalledWith(
                mockClient,
                { help_center_id: 1, id: 123 },
                { locale: 'en-US', version_status: 'current' },
            )
        })

        it('should call getHelpCenterArticle with "latest_draft" version_status when viewing current', async () => {
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
            mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockGetHelpCenterArticle).toHaveBeenCalledWith(
                mockClient,
                { help_center_id: 1, id: 123 },
                { locale: 'en-US', version_status: 'latest_draft' },
            )
        })

        it('should dispatch SWITCH_VERSION with article and version status on success when switching to current', async () => {
            mockGetHelpCenterArticle.mockResolvedValue(mockArticleResponse)

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SWITCH_VERSION',
                payload: {
                    article: mockArticleResponse,
                    versionStatus: 'current',
                },
            })
        })

        it('should dispatch SWITCH_VERSION with latest_draft version status when switching from current', async () => {
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
            mockGetHelpCenterArticle.mockResolvedValue({
                ...mockArticleResponse,
                translation: {
                    ...mockArticleResponse.translation,
                    is_current: false,
                },
            })

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SWITCH_VERSION',
                payload: {
                    article: expect.objectContaining({
                        id: 123,
                    }),
                    versionStatus: 'latest_draft',
                },
            })
        })

        it('should not dispatch SWITCH_VERSION when response is null', async () => {
            mockGetHelpCenterArticle.mockResolvedValue(null)

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SWITCH_VERSION' }),
            )
        })

        it('should show error notification on failure', async () => {
            mockGetHelpCenterArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while switching version.',
            )
        })

        it('should dispatch SET_UPDATING false even on error', async () => {
            mockGetHelpCenterArticle.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            const lastCall =
                mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
            expect(lastCall).toEqual([{ type: 'SET_UPDATING', payload: false }])
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
