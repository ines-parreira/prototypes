import { act, renderHook } from '@testing-library/react'

import type { LocaleCode } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useArticleToolbar } from './useArticleToolbar'

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseArticleContext = useArticleContext as jest.Mock

describe('useArticleToolbar', () => {
    let mockDispatch: jest.Mock
    let mockOnClose: jest.Mock
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
            hasAutoSavedInSession: false,
            article: mockArticle,
            translationMode: 'existing',
            currentLocale: 'en-US',
            pendingSettingsChanges: {},
            versionStatus: 'latest_draft',
            historicalVersion: null,
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
            shouldHideFullscreenButton: false,
        },
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockDispatch = jest.fn()
        mockOnClose = jest.fn()
        mockOnTest = jest.fn()

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

        it('should return "viewing-historical-version" state when historicalVersion is set', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        articleMode: 'read',
                        historicalVersion: {
                            versionId: 10,
                            version: 3,
                            title: 'Old Version',
                            content: '<p>Old content</p>',
                            publishedDatetime: '2024-03-01T12:00:00Z',
                            publisherUserId: 42,
                            commitMessage: 'Published v3',
                            impactDateRange: {
                                end_datetime: '',
                                start_datetime: '',
                            },
                        },
                    },
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({
                type: 'viewing-historical-version',
            })
        })

        it('should prioritize "viewing-historical-version" over other states', () => {
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
                        historicalVersion: {
                            versionId: 10,
                            version: 3,
                            title: 'Old Version',
                            content: '<p>Old content</p>',
                            publishedDatetime: null,
                            publisherUserId: undefined,
                            commitMessage: undefined,
                            impactDateRange: {
                                end_datetime: '',
                                start_datetime: '',
                            },
                        },
                    },
                    hasDraft: true,
                }),
            )

            const { result } = renderHook(() => useArticleToolbar())

            expect(result.current.state).toEqual({
                type: 'viewing-historical-version',
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
                'This version is read-only. View the version with draft edits to make changes.',
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
        it('should dispatch SET_MODAL with "publish" payload', () => {
            const { result } = renderHook(() => useArticleToolbar())

            act(() => {
                result.current.actions.onClickPublish()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'publish',
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
