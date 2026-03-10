import { act, renderHook, waitFor } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { useDeleteArticleTranslation } from 'models/helpCenter/mutations'
import type { LocaleCode } from 'models/helpCenter/types'
import type { OptionItem as LocaleOption } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue, ModalType } from '../context/types'
import { useDeleteTranslationModal } from './useDeleteTranslationModal'

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('models/helpCenter/mutations', () => ({
    useDeleteArticleTranslation: jest.fn(),
}))

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseNotify = useNotify as jest.Mock
const mockUseDeleteArticleTranslation = useDeleteArticleTranslation as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useDeleteTranslationModal', () => {
    let mockDispatch: jest.Mock
    let mockNotifyError: jest.Mock
    let mockDeleteTranslationMutateAsync: jest.Mock
    let mockOnClose: jest.Mock
    let mockOnDeletedFn: jest.Mock

    const mockLocaleOption: LocaleOption = {
        value: 'fr-FR' as LocaleCode,
        label: 'French (France)',
        text: 'French - France',
    }

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
    }

    const mockArticle = {
        id: 123,
        unlisted_id: 'test-unlisted-id',
        help_center_id: 1,
        available_locales: ['en-US', 'fr-FR'] as LocaleCode[],
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
        mockDeleteTranslationMutateAsync = jest.fn()
        mockOnClose = jest.fn()
        mockOnDeletedFn = jest.fn()

        mockUseNotify.mockReturnValue({
            error: mockNotifyError,
            success: jest.fn(),
        })
        mockUseDeleteArticleTranslation.mockReturnValue({
            mutateAsync: mockDeleteTranslationMutateAsync,
        })
        mockUseArticleContext.mockReturnValue(createMockContext())
    })

    describe('isOpen', () => {
        it('should return true when activeModal is delete-translation object', () => {
            const deleteTranslationModal: ModalType = {
                type: 'delete-translation',
                locale: mockLocaleOption,
            }
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: deleteTranslationModal },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: null },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is a string type', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'delete-article' },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is unsaved', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'unsaved' },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is discard-draft', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'discard-draft' },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('locale', () => {
        it('should return locale from activeModal when modal is open', () => {
            const deleteTranslationModal: ModalType = {
                type: 'delete-translation',
                locale: mockLocaleOption,
            }
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: deleteTranslationModal },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.locale).toEqual(mockLocaleOption)
        })

        it('should return undefined when modal is not open', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: null },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.locale).toBeUndefined()
        })

        it('should return undefined when activeModal is a different type', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: 'delete-article' },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.locale).toBeUndefined()
        })
    })

    describe('isDeleting', () => {
        it('should return true when isUpdating is true', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: true },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.isDeleting).toBe(true)
        })

        it('should return false when isUpdating is false', () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { isUpdating: false },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current.isDeleting).toBe(false)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useDeleteTranslationModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onDelete', () => {
        it('should not do anything when article id is missing', async () => {
            const deleteTranslationModal: ModalType = {
                type: 'delete-translation',
                locale: mockLocaleOption,
            }
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: {
                        article: undefined,
                        activeModal: deleteTranslationModal,
                    },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockDeleteTranslationMutateAsync).not.toHaveBeenCalled()
        })

        it('should not do anything when locale is missing', async () => {
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: null },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockDeleteTranslationMutateAsync).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            const deleteTranslationModal: ModalType = {
                type: 'delete-translation',
                locale: mockLocaleOption,
            }
            mockDeleteTranslationMutateAsync.mockResolvedValue({})
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: deleteTranslationModal },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call deleteTranslationMutation with correct params', async () => {
            const deleteTranslationModal: ModalType = {
                type: 'delete-translation',
                locale: mockLocaleOption,
            }
            mockDeleteTranslationMutateAsync.mockResolvedValue({})
            mockUseArticleContext.mockReturnValue(
                createMockContext({
                    state: { activeModal: deleteTranslationModal },
                }),
            )

            const { result } = renderHook(() => useDeleteTranslationModal())

            await act(async () => {
                await result.current.onDelete()
            })

            expect(mockDeleteTranslationMutateAsync).toHaveBeenCalledWith([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 123,
                    locale: 'fr-FR',
                },
            ])
        })

        describe('success flow', () => {
            it('should call config.onDeletedFn when provided', async () => {
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockResolvedValue({})
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockOnDeletedFn).toHaveBeenCalled()
            })

            it('should not fail when config.onDeletedFn is not provided', async () => {
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockResolvedValue({})
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                        config: { onDeletedFn: undefined },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

                await expect(
                    act(async () => {
                        await result.current.onDelete()
                    }),
                ).resolves.not.toThrow()
            })

            it('should call config.onClose on success', async () => {
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockResolvedValue({})
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockOnClose).toHaveBeenCalled()
            })
        })

        describe('error handling', () => {
            it('should show error notification when delete fails', async () => {
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockNotifyError).toHaveBeenCalledWith(
                    'An error occurred while deleting the translation.',
                )
            })

            it('should not call onDeletedFn or onClose when delete fails', async () => {
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

                await act(async () => {
                    await result.current.onDelete()
                })

                expect(mockOnDeletedFn).not.toHaveBeenCalled()
                expect(mockOnClose).not.toHaveBeenCalled()
            })
        })

        describe('finally block', () => {
            it('should dispatch SET_UPDATING false after success', async () => {
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockResolvedValue({})
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

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
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

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
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockResolvedValue({})
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

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
                const deleteTranslationModal: ModalType = {
                    type: 'delete-translation',
                    locale: mockLocaleOption,
                }
                mockDeleteTranslationMutateAsync.mockRejectedValue(
                    new Error('Network error'),
                )
                mockUseArticleContext.mockReturnValue(
                    createMockContext({
                        state: { activeModal: deleteTranslationModal },
                    }),
                )

                const { result } = renderHook(() => useDeleteTranslationModal())

                await act(async () => {
                    await result.current.onDelete()
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
            const { result } = renderHook(() => useDeleteTranslationModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isDeleting')
            expect(result.current).toHaveProperty('locale')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onDelete')
            expect(typeof result.current.isOpen).toBe('boolean')
            expect(typeof result.current.isDeleting).toBe('boolean')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onDelete).toBe('function')
        })
    })
})
