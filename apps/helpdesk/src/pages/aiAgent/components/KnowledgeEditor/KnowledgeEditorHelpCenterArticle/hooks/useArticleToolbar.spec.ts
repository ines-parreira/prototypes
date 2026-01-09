import { act, renderHook, waitFor } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useArticleToolbar } from './useArticleToolbar'

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

describe('useArticleToolbar', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockNotifySuccess: jest.Mock
    let mockMutateAsync: jest.Mock
    let mockOnClose: jest.Mock
    let mockOnUpdatedFn: jest.Mock
    let mockOnTest: jest.Mock

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
        is_current: true,
        rating: { up: 0, down: 0 },
        draft_version_id: null,
        published_version_id: null,
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
            isFormValid: boolean
            canEdit: boolean
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
            onClose: mockOnClose,
            onUpdatedFn: mockOnUpdatedFn,
            ...overrides.config,
        } as ArticleContextValue['config'],
        hasPendingContentChanges: false,
        isFormValid: overrides.isFormValid ?? true,
        hasDraft: overrides.hasDraft ?? false,
        canEdit: overrides.canEdit ?? true,
        playground: {
            isOpen: false,
            onTest: mockOnTest,
            onClose: jest.fn(),
            sidePanelWidth: '60vw',
        },
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockDispatch = jest.fn()
        mockNotifyError = jest.fn()
        mockNotifySuccess = jest.fn()
        mockMutateAsync = jest.fn()
        mockOnClose = jest.fn()
        mockOnUpdatedFn = jest.fn()
        mockOnTest = jest.fn()

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        })
        mockUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('toolbar state', () => {
        it('should return "create" state when articleMode is "create"', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { articleMode: 'create', article: undefined },
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({ type: 'create' })
        })

        it('should return "draft-edit" state when viewing draft in edit mode', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        articleMode: 'edit',
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

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({ type: 'draft-edit' })
        })

        it('should return "draft-view" state when viewing draft in read mode', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        articleMode: 'read',
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

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({ type: 'draft-view' })
        })

        it('should return "published-with-draft" state when viewing published version with draft available', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        articleMode: 'read',
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                is_current: true,
                            },
                        },
                    },
                    hasDraft: true,
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({
                type: 'published-with-draft',
            })
        })

        it('should return "published-without-draft" state when viewing published version without draft in read mode', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        articleMode: 'read',
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                is_current: true,
                            },
                        },
                    },
                    hasDraft: false,
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({
                type: 'published-without-draft',
            })
        })

        it('should return "published-without-draft-edit" state when editing published version without draft', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        articleMode: 'edit',
                        article: {
                            ...mockArticle,
                            translation: {
                                ...mockTranslation,
                                is_current: true,
                            },
                        },
                    },
                    hasDraft: false,
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({
                type: 'published-without-draft-edit',
            })
        })
    })

    describe('isDisabled', () => {
        it('should return false when not updating and not auto-saving', () => {
            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.isDisabled).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: true },
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when isAutoSaving is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isAutoSaving: true },
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.isDisabled).toBe(true)
        })
    })

    describe('isFormValid', () => {
        it('should return true when form is valid', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ isFormValid: true }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.isFormValid).toBe(true)
        })

        it('should return false when form is invalid', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ isFormValid: false }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.isFormValid).toBe(false)
        })
    })

    describe('canEdit and editDisabledReason', () => {
        it('should return canEdit=true and no disabled reason when editing is allowed', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ canEdit: true }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.canEdit).toBe(true)
            expect(result.current.editDisabledReason).toBeUndefined()
        })

        it('should return canEdit=false and disabled reason when editing is not allowed', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({ canEdit: false }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.canEdit).toBe(false)
            expect(result.current.editDisabledReason).toBe(
                'You already have a draft version. Only one draft is allowed at a time, so the published version is read-only.',
            )
        })
    })

    describe('onClickEdit', () => {
        it('should dispatch SET_MODE with "edit" payload', () => {
            const { result } = renderHook(() => useArticleToolbar())

            act(() => {
                result.current.actions.onClickEdit()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'edit',
            })
        })
    })

    describe('onClickPublish', () => {
        it('should not do anything when article id is missing', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { article: undefined },
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockMutateAsync.mockResolvedValue({ data: mockArticle.translation })

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call updateTranslationMutation with correct params', async () => {
            mockMutateAsync.mockResolvedValue({ data: mockArticle.translation })

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
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
                },
            ])
        })

        it('should dispatch MARK_CONTENT_AS_SAVED and SET_MODE on success', async () => {
            const updatedTranslation = {
                ...mockTranslation,
                title: 'Published Title',
                content: '<p>Published content</p>',
            }
            mockMutateAsync.mockResolvedValue({ data: updatedTranslation })

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'MARK_CONTENT_AS_SAVED',
                payload: {
                    title: 'Published Title',
                    content: '<p>Published content</p>',
                    article: expect.objectContaining({
                        translation:
                            expect.objectContaining(updatedTranslation),
                    }),
                },
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'read',
            })
        })

        it('should show success notification on successful publish', async () => {
            mockMutateAsync.mockResolvedValue({ data: mockArticle.translation })

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            expect(mockNotifySuccess).toHaveBeenCalledWith(
                'Article published successfully.',
            )
        })

        it('should call onUpdatedFn callback on successful publish', async () => {
            mockMutateAsync.mockResolvedValue({ data: mockArticle.translation })

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            expect(mockOnUpdatedFn).toHaveBeenCalled()
        })

        it('should show error notification when publish fails', async () => {
            mockMutateAsync.mockRejectedValue(new Error('Network error'))

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            expect(mockNotifyError).toHaveBeenCalledWith(
                'An error occurred while publishing the article.',
            )
        })

        it('should dispatch SET_UPDATING false at end', async () => {
            mockMutateAsync.mockResolvedValue({ data: mockArticle.translation })

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            await waitFor(() => {
                const lastCall =
                    mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
                expect(lastCall).toEqual([
                    { type: 'SET_UPDATING', payload: false },
                ])
            })
        })

        it('should dispatch SET_UPDATING false even on error', async () => {
            mockMutateAsync.mockRejectedValue(new Error('Network error'))

            const { result } = renderHook(() => useArticleToolbar())

            await act(async () => {
                await result.current.actions.onClickPublish()
            })

            await waitFor(() => {
                const lastCall =
                    mockDispatch.mock.calls[mockDispatch.mock.calls.length - 1]
                expect(lastCall).toEqual([
                    { type: 'SET_UPDATING', payload: false },
                ])
            })
        })
    })

    describe('onOpenDeleteModal', () => {
        it('should dispatch SET_MODAL with "delete-article" payload', () => {
            const { result } = renderHook(() => useArticleToolbar())

            act(() => {
                result.current.actions.onOpenDeleteModal()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'delete-article',
            })
        })
    })

    describe('onDiscard', () => {
        describe('in create mode', () => {
            it('should call onClose when there is no content', () => {
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: {
                            articleMode: 'create',
                            title: '',
                            content: '',
                            article: undefined,
                        },
                    }),
                )

                const { result } = renderHook(() => useArticleToolbar())

                act(() => {
                    result.current.actions.onDiscard()
                })

                expect(mockOnClose).toHaveBeenCalled()
                expect(mockDispatch).not.toHaveBeenCalled()
            })

            it('should dispatch SET_MODAL with "unsaved" when there is content', () => {
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: {
                            articleMode: 'create',
                            title: 'Some title',
                            content: 'Some content',
                            article: undefined,
                        },
                    }),
                )

                const { result } = renderHook(() => useArticleToolbar())

                act(() => {
                    result.current.actions.onDiscard()
                })

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODAL',
                    payload: 'unsaved',
                })
            })

            it('should dispatch SET_MODAL with "unsaved" when only title has content', () => {
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: {
                            articleMode: 'create',
                            title: 'Some title',
                            content: '',
                            article: undefined,
                        },
                    }),
                )

                const { result } = renderHook(() => useArticleToolbar())

                act(() => {
                    result.current.actions.onDiscard()
                })

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODAL',
                    payload: 'unsaved',
                })
            })
        })

        describe('in edit or read mode', () => {
            it('should dispatch SET_MODAL with "discard-draft"', () => {
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { articleMode: 'edit' },
                    }),
                )

                const { result } = renderHook(() => useArticleToolbar())

                act(() => {
                    result.current.actions.onDiscard()
                })

                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'SET_MODAL',
                    payload: 'discard-draft',
                })
            })
        })
    })

    describe('onTest', () => {
        it('should call playground.onTest', () => {
            const { result } = renderHook(() => useArticleToolbar())

            result.current.onTest()

            expect(mockOnTest).toHaveBeenCalled()
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current).toHaveProperty('state')
            expect(result.current).toHaveProperty('actions')
            expect(result.current.actions).toHaveProperty('onClickEdit')
            expect(result.current.actions).toHaveProperty('onClickPublish')
            expect(result.current.actions).toHaveProperty('onOpenDeleteModal')
            expect(result.current.actions).toHaveProperty('onDiscard')
            expect(result.current).toHaveProperty('isDisabled')
            expect(result.current).toHaveProperty('isFormValid')
            expect(result.current).toHaveProperty('canEdit')
            expect(result.current).toHaveProperty('editDisabledReason')
            expect(result.current).toHaveProperty('onTest')
            expect(result.current).toHaveProperty('isPlaygroundOpen')
        })
    })

    describe('isPlaygroundOpen', () => {
        it('should return isPlaygroundOpen based on playground.isOpen', () => {
            const contextWithPlaygroundOpen = createMockContext()
            contextWithPlaygroundOpen.playground.isOpen = true
            mockUseArticleContext.mockReturnValue(contextWithPlaygroundOpen)

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.isPlaygroundOpen).toBe(true)
        })

        it('should return false when playground is closed', () => {
            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.isPlaygroundOpen).toBe(false)
        })
    })
})
