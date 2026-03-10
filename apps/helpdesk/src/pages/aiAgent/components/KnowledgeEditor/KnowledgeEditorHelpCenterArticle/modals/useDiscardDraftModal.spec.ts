import { act, renderHook, waitFor } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useDeleteArticleTranslationDraft } from 'models/helpCenter/mutations'
import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useDiscardDraftModal } from './useDiscardDraftModal'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/mutations', () => ({
    useDeleteArticleTranslationDraft: jest.fn(),
}))

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseNotify = useNotify as jest.Mock
const mockUseDeleteArticleTranslationDraft =
    useDeleteArticleTranslationDraft as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useDiscardDraftModal', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockNotifySuccess: jest.Mock
    let mockDiscardDraftMutateAsync: jest.Mock
    let mockOnClose: jest.Mock
    let mockOnUpdatedFn: jest.Mock
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
        draft_version_id: 456,
        published_version_id: 789,
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
            onUpdatedFn: mockOnUpdatedFn,
            onDeletedFn: mockOnDeletedFn,
            ...overrides.config,
        } as ArticleContextValue['config'],
        hasPendingContentChanges: false,
        isFormValid: true,
        hasDraft: true,
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
        mockDiscardDraftMutateAsync = jest.fn()
        mockOnClose = jest.fn()
        mockOnUpdatedFn = jest.fn()
        mockOnDeletedFn = jest.fn()

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        })
        mockUseDeleteArticleTranslationDraft.mockReturnValue({
            mutateAsync: mockDiscardDraftMutateAsync,
        })
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('isOpen', () => {
        it('should return true when activeModal is "discard-draft"', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'discard-draft' },
                }),
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: null },
                }),
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is a different modal', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'delete-article' },
                }),
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('isDiscarding', () => {
        it('should return true when isUpdating is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: true },
                }),
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isDiscarding).toBe(true)
        })

        it('should return false when isUpdating is false', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: false },
                }),
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current.isDiscarding).toBe(false)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useDiscardDraftModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onDiscard', () => {
        it('should not do anything when article id is missing', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                }),
            )

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockDiscardDraftMutateAsync).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockDiscardDraftMutateAsync.mockResolvedValue({
                data: mockTranslation,
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call deleteTranslationDraftMutation with correct params', async () => {
            mockDiscardDraftMutateAsync.mockResolvedValue({
                data: mockTranslation,
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockDiscardDraftMutateAsync).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 123,
                    locale: 'en-US',
                },
            ])
        })

        it('should show success notification when response contains translation data', async () => {
            mockDiscardDraftMutateAsync.mockResolvedValue({
                data: mockTranslation,
            })

            const { result } = renderHook(() => useDiscardDraftModal())

            await act(async () => {
                await result.current.onDiscard()
            })

            expect(mockNotifySuccess).toHaveBeenCalledWith('Draft discarded')
        })

        describe('when response contains translation data (has title)', () => {
            it('should dispatch SWITCH_VERSION with response data', async () => {
                const responseTranslation = {
                    ...mockTranslation,
                    title: 'Updated Title',
                }
                mockDiscardDraftMutateAsync.mockResolvedValue({
                    data: responseTranslation,
                })

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SWITCH_VERSION',
                    payload: {
                        article: {
                            ...mockArticle,
                            translation: responseTranslation,
                        },
                        versionStatus: 'current',
                    },
                })
            })

            it('should call onUpdatedFn after successful discard', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({
                    data: mockTranslation,
                })

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockOnUpdatedFn).toHaveBeenCalled()
            })

            it('should not call onClose or onDeletedFn', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({
                    data: mockTranslation,
                })

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockOnClose).not.toHaveBeenCalled()
                expect(mockOnDeletedFn).not.toHaveBeenCalled()
            })
        })

        describe('when response does not contain translation data (no title)', () => {
            it('should call config.onClose', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockOnClose).toHaveBeenCalled()
            })

            it('should call onDeletedFn', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockOnDeletedFn).toHaveBeenCalled()
            })

            it('should not call onUpdatedFn or dispatch SWITCH_VERSION', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockOnUpdatedFn).not.toHaveBeenCalled()
                expect(mockDispatch).not.toHaveBeenCalledWith(
                    expect.objectContaining({ type: 'SWITCH_VERSION' }),
                )
            })

            it('should not show success notification', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({})

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockNotifySuccess).not.toHaveBeenCalled()
            })
        })

        describe('error handling', () => {
            it('should show error notification when discard fails', async () => {
                mockDiscardDraftMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockNotifyError).toHaveBeenCalledWith(
                    'An error occurred while discarding draft.',
                )
            })

            it('should not call onClose or onDeletedFn when discard fails', async () => {
                mockDiscardDraftMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockOnClose).not.toHaveBeenCalled()
                expect(mockOnDeletedFn).not.toHaveBeenCalled()
            })

            it('should not call onUpdatedFn when discard fails', async () => {
                mockDiscardDraftMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                expect(mockOnUpdatedFn).not.toHaveBeenCalled()
            })
        })

        describe('finally block', () => {
            it('should dispatch SET_UPDATING false after success', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({
                    data: mockTranslation,
                })

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'SET_UPDATING',
                        payload: false,
                    })
                })
            })

            it('should dispatch SET_UPDATING false after error', async () => {
                mockDiscardDraftMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'SET_UPDATING',
                        payload: false,
                    })
                })
            })

            it('should dispatch CLOSE_MODAL after success', async () => {
                mockDiscardDraftMutateAsync.mockResolvedValue({
                    data: mockTranslation,
                })

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'CLOSE_MODAL',
                    })
                })
            })

            it('should dispatch CLOSE_MODAL after error', async () => {
                mockDiscardDraftMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )

                const { result } = renderHook(() => useDiscardDraftModal())

                await act(async () => {
                    await result.current.onDiscard()
                })

                await waitFor(() => {
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: 'CLOSE_MODAL',
                    })
                })
            })
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useDiscardDraftModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isDiscarding')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onDiscard')
            expect(typeof result.current.isOpen).toBe('boolean')
            expect(typeof result.current.isDiscarding).toBe('boolean')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onDiscard).toBe('function')
        })
    })
})
