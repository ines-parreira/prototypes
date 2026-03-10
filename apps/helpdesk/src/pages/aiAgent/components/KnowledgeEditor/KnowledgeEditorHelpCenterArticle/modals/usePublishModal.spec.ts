import { act, renderHook, waitFor } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { usePublishModal } from './usePublishModal'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/mutations', () => ({
    useUpdateArticleTranslation: jest.fn(),
}))

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseNotify = useNotify as jest.Mock
const mockUseUpdateArticleTranslation = useUpdateArticleTranslation as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('usePublishModal', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockNotifySuccess: jest.Mock
    let mockMutateAsync: jest.Mock
    let mockOnUpdatedFn: jest.Mock

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
        deleted_datetime: null,
        is_current: true,
        rating: { up: 0, down: 0 },
        draft_version_id: null,
        published_version_id: null,
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
            activeModal: 'publish',
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
            onUpdatedFn: mockOnUpdatedFn,
            ...overrides.config,
        } as ArticleContextValue['config'],
        hasPendingContentChanges: false,
        isFormValid: true,
        hasDraft: false,
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
        mockNotifySuccess = jest.fn()
        mockMutateAsync = jest.fn()
        mockOnUpdatedFn = jest.fn()

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        })
        mockUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('isOpen', () => {
        it('should return true when activeModal is "publish" and not first publish', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                published_version_id: 123,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is "publish" but is first publish', () => {
            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is null', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: null },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is a different modal', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'unsaved' },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is "delete-article"', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'delete-article' },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is "discard-draft"', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'discard-draft' },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('first publish', () => {
        it('should auto-publish with empty commit message on first publish', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            renderHook(() => usePublishModal())

            await act(async () => {
                await Promise.resolve()
            })
            expect(mockMutateAsync).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 123,
                    locale: 'en-US',
                },
                {
                    is_current: true,
                    commit_message: undefined,
                },
            ])
        })

        it('should not re-trigger auto-publish when hook re-renders', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { rerender } = renderHook(() => usePublishModal())

            await act(async () => {
                await Promise.resolve()
            })

            mockUseUpdateArticleTranslation.mockReturnValue({
                mutateAsync: mockMutateAsync,
            })
            rerender()

            await act(async () => {
                await Promise.resolve()
            })

            expect(mockMutateAsync).toHaveBeenCalledTimes(1)
        })

        it('should not auto-publish when not first publish', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                published_version_id: 123,
                            },
                        },
                    },
                }),
            )

            renderHook(() => usePublishModal())

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should not auto-publish when activeModal is not publish', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        activeModal: null,
                    },
                }),
            )

            renderHook(() => usePublishModal())

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })
    })

    describe('isPublishing', () => {
        it('should return false when isUpdating is false', () => {
            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isPublishing).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: true },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            expect(result.current.isPublishing).toBe(true)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => usePublishModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onPublish', () => {
        it('should not do anything when article is undefined', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should not do anything when article.id is undefined', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            id: undefined as unknown as number,
                        },
                    },
                }),
            )

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call mutateAsync with correct params', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockMutateAsync).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 123,
                    locale: 'en-US',
                },
                {
                    is_current: true,
                    commit_message: 'Test commit message',
                },
            ])
        })

        it('should pass undefined commit_message when empty string provided', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('')
            })

            expect(mockMutateAsync).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 123,
                    locale: 'en-US',
                },
                {
                    is_current: true,
                    commit_message: undefined,
                },
            ])
        })

        it('should dispatch MARK_CONTENT_AS_SAVED on success', async () => {
            const responseData = {
                title: 'Updated Title',
                content: 'Updated Content',
            }
            mockMutateAsync.mockResolvedValue({ data: responseData })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_CONTENT_AS_SAVED',
                payload: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                    article: {
                        ...mockArticle,
                        translation: {
                            ...mockTranslation,
                            ...responseData,
                        },
                    },
                },
            })
        })

        it('should dispatch SET_MODE to read on success', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'read',
            })
        })

        it('should show success notification on success', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockNotifySuccess).toHaveBeenCalledWith(
                'Article published successfully.',
            )
        })

        it('should call onUpdatedFn callback on success', async () => {
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockOnUpdatedFn).toHaveBeenCalled()
        })

        it('should not throw when onUpdatedFn is undefined', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    config: { onUpdatedFn: undefined },
                }),
            )
            mockMutateAsync.mockResolvedValue({
                data: {
                    title: 'Updated Title',
                    content: 'Updated Content',
                },
            })

            const { result } = renderHook(() => usePublishModal())

            await expect(
                act(async () => {
                    await result.current.onPublish('Test commit message')
                }),
            ).resolves.not.toThrow()
        })

        it('should show error notification on failure', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while publishing the article.',
            )
        })

        it('should not call onUpdatedFn on failure', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockOnUpdatedFn).not.toHaveBeenCalled()
        })

        it('should not dispatch MARK_CONTENT_AS_SAVED on failure', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'MARK_CONTENT_AS_SAVED' }),
            )
        })

        it('should not dispatch SET_MODE on failure', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SET_MODE' }),
            )
        })

        it('should not dispatch success actions when response.data is falsy', async () => {
            mockMutateAsync.mockResolvedValue({ data: null })

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'MARK_CONTENT_AS_SAVED' }),
            )
            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SET_MODE' }),
            )
            expect(mockNotifySuccess).not.toHaveBeenCalled()
            expect(mockOnUpdatedFn).not.toHaveBeenCalled()
        })

        it('should not dispatch success actions when response is falsy', async () => {
            mockMutateAsync.mockResolvedValue(null)

            const { result } = renderHook(() => usePublishModal())

            await act(async () => {
                await result.current.onPublish('Test commit message')
            })

            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'MARK_CONTENT_AS_SAVED' }),
            )
            expect(mockDispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: 'SET_MODE' }),
            )
            expect(mockNotifySuccess).not.toHaveBeenCalled()
            expect(mockOnUpdatedFn).not.toHaveBeenCalled()
        })

        describe('finally block', () => {
            it('should dispatch SET_UPDATING false after success', async () => {
                mockMutateAsync.mockResolvedValue({
                    data: {
                        title: 'Updated Title',
                        content: 'Updated Content',
                    },
                })

                const { result } = renderHook(() => usePublishModal())

                await act(async () => {
                    await result.current.onPublish('Test commit message')
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'SET_UPDATING',
                        payload: false,
                    })
                })
            })

            it('should dispatch SET_UPDATING false after error', async () => {
                mockMutateAsync.mockRejectedValue(new Error('API Error'))

                const { result } = renderHook(() => usePublishModal())

                await act(async () => {
                    await result.current.onPublish('Test commit message')
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'SET_UPDATING',
                        payload: false,
                    })
                })
            })

            it('should dispatch CLOSE_MODAL after success', async () => {
                mockMutateAsync.mockResolvedValue({
                    data: {
                        title: 'Updated Title',
                        content: 'Updated Content',
                    },
                })

                const { result } = renderHook(() => usePublishModal())

                await act(async () => {
                    await result.current.onPublish('Test commit message')
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'CLOSE_MODAL',
                    })
                })
            })

            it('should dispatch CLOSE_MODAL after error', async () => {
                mockMutateAsync.mockRejectedValue(new Error('API Error'))

                const { result } = renderHook(() => usePublishModal())

                await act(async () => {
                    await result.current.onPublish('Test commit message')
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'CLOSE_MODAL',
                    })
                })
            })
        })
    })

    describe('useUpdateArticleTranslation initialization', () => {
        it('should pass helpCenter.id to useUpdateArticleTranslation', () => {
            renderHook(() => usePublishModal())

            expect(mockUseUpdateArticleTranslation).toHaveBeenCalledWith(1)
        })

        it('should pass different helpCenter.id when config changes', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    config: {
                        helpCenter: {
                            id: 42,
                        } as ArticleContextValue['config']['helpCenter'],
                    },
                }),
            )

            renderHook(() => usePublishModal())

            expect(mockUseUpdateArticleTranslation).toHaveBeenCalledWith(42)
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => usePublishModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isPublishing')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onPublish')
            expect(typeof result.current.isOpen).toBe('boolean')
            expect(typeof result.current.isPublishing).toBe('boolean')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onPublish).toBe('function')
        })
    })
})
