import { act, renderHook, waitFor } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useDeleteArticle } from 'models/helpCenter/mutations'
import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useDeleteArticleModal } from './useDeleteArticleModal'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/mutations', () => ({
    useDeleteArticle: jest.fn(),
}))

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseNotify = useNotify as jest.Mock
const mockUseDeleteArticle = useDeleteArticle as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useDeleteArticleModal', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockDeleteArticleMutateAsync: jest.Mock
    let mockOnClose: jest.Mock
    let mockOnDeletedFn: jest.Mock

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
            onClose: mockOnClose,
            onDeletedFn: mockOnDeletedFn,
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
        mockDeleteArticleMutateAsync = jest.fn()
        mockOnClose = jest.fn()
        mockOnDeletedFn = jest.fn()

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
            success: jest.fn(),
        })
        mockUseDeleteArticle.mockReturnValue({
            mutateAsync: mockDeleteArticleMutateAsync,
        })
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('isOpen', () => {
        it('should return true when activeModal is "delete-article"', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'delete-article' },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: null },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is a different modal', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'unsaved' },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is discard-draft', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'discard-draft' },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('isDeleting', () => {
        it('should return true when isUpdating is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: true },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.isDeleting).toBe(true)
        })

        it('should return false when isUpdating is false', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: false },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.isDeleting).toBe(false)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useDeleteArticleModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onDelete', () => {
        it('should not do anything when article id is missing', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockDeleteArticleMutateAsync).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockDeleteArticleMutateAsync.mockResolvedValue({})

            const { result } = renderHook(() => useDeleteArticleModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call deleteArticleMutation with correct params', async () => {
            mockDeleteArticleMutateAsync.mockResolvedValue({})

            const { result } = renderHook(() => useDeleteArticleModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDeleteArticleMutateAsync).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: 1,
                    id: 123,
                },
            ])
        })

        describe('success flow', () => {
            it('should call config.onDeletedFn when provided', async () => {
                mockDeleteArticleMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockOnDeletedFn).toHaveBeenCalled()
            })

            it('should not fail when config.onDeletedFn is not provided', async () => {
                mockDeleteArticleMutateAsync.mockResolvedValue({})
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        config: { onDeletedFn: undefined },
                    }),
                )

                const { result } = renderHook(() => useDeleteArticleModal())

                await expect(
                    act(async () => {
                        await result.current.onDelete()
                    }),
                ).resolves.not.toThrow()
            })
        })

        describe('error handling', () => {
            it('should show error notification when delete fails', async () => {
                mockDeleteArticleMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockNotifyError).toHaveBeenCalledWith(
                    'An error occurred while deleting the article.',
                )
            })

            it('should not call onDeletedFn when delete fails', async () => {
                mockDeleteArticleMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockOnDeletedFn).not.toHaveBeenCalled()
            })
        })

        describe('finally block', () => {
            it('should dispatch SET_UPDATING false after success', async () => {
                mockDeleteArticleMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'SET_UPDATING',
                        payload: false,
                    })
                })
            })

            it('should dispatch SET_UPDATING false after error', async () => {
                mockDeleteArticleMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'SET_UPDATING',
                        payload: false,
                    })
                })
            })

            it('should dispatch CLOSE_MODAL after success', async () => {
                mockDeleteArticleMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'CLOSE_MODAL',
                    })
                })
            })

            it('should dispatch CLOSE_MODAL after error', async () => {
                mockDeleteArticleMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'CLOSE_MODAL',
                    })
                })
            })

            it('should call config.onClose after success', async () => {
                mockDeleteArticleMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockOnClose).toHaveBeenCalled()
            })

            it('should call config.onClose after error', async () => {
                mockDeleteArticleMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDeleteArticleModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockOnClose).toHaveBeenCalled()
            })
        })
    })

    describe('hasBothVersions', () => {
        it('should return true when both draft and published versions exist', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                published_version_id: 1,
                                draft_version_id: 2,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.hasBothVersions).toBe(true)
        })

        it('should return false when only draft version exists', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                published_version_id: null,
                                draft_version_id: 1,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.hasBothVersions).toBe(false)
        })

        it('should return false when draft and published are the same', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                published_version_id: 1,
                                draft_version_id: 1,
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.hasBothVersions).toBe(false)
        })

        it('should return false when article is undefined', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: undefined,
                    },
                }),
            )

            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current.hasBothVersions).toBe(false)
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useDeleteArticleModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isDeleting')
            expect(result.current).toHaveProperty('hasBothVersions')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onDelete')
            expect(typeof result.current.isOpen).toBe('boolean')
            expect(typeof result.current.isDeleting).toBe('boolean')
            expect(typeof result.current.hasBothVersions).toBe('boolean')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onDelete).toBe('function')
        })
    })
})
