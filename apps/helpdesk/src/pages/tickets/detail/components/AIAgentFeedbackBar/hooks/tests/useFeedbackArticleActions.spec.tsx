import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import type { ArticleTemplateKey } from 'models/helpCenter/types'
import {
    getArticleFixture,
    getCreateArticleDtoFixture,
} from 'pages/aiAgent/fixtures/article.fixture'
import { useArticlesActions } from 'pages/settings/helpCenter/hooks/useArticlesActions'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useUpsertArticleTemplateReview } from 'pages/settings/helpCenter/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useFeedbackArticleActions } from '../useFeedbackArticleActions'

jest.mock('@repo/logging')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/settings/helpCenter/hooks/useArticlesActions')
jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
jest.mock('pages/settings/helpCenter/queries')
jest.mock('state/notifications/actions')

describe('useFeedbackArticleActions', () => {
    const mockDispatch = jest.fn()
    const mockCreateArticle = jest.fn()
    const mockUpdateArticle = jest.fn()
    const mockDeleteArticle = jest.fn()
    const mockDeleteArticleTranslation = jest.fn()
    const mockMutateAsync = jest.fn()
    const mockOnArticleCreate = jest.fn()
    const mockOnArticleUpdate = jest.fn()
    const mockOnArticleDelete = jest.fn()
    const mockOnArticleTranslationDelete = jest.fn()

    const mockHelpCenter = {
        id: 1,
        default_locale: 'en-US' as const,
    }

    const templateKey: ArticleTemplateKey = 'applyDiscount'
    const existingArticle = getArticleFixture(1)
    const createArticleDto = getCreateArticleDtoFixture()
    const apiError = new Error('API Error')

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
        ;(useCurrentHelpCenter as jest.Mock).mockReturnValue(mockHelpCenter)
        ;(useArticlesActions as jest.Mock).mockReturnValue({
            createArticle: mockCreateArticle,
            updateArticle: mockUpdateArticle,
            deleteArticle: mockDeleteArticle,
            deleteArticleTranslation: mockDeleteArticleTranslation,
        })
        ;(useUpsertArticleTemplateReview as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
        })
        ;(notify as jest.Mock).mockReturnValue({ type: 'NOTIFY' })
        ;(logEvent as jest.Mock).mockImplementation(() => {})
        ;(reportError as jest.Mock).mockImplementation(() => {})
    })

    describe('when creating articles', () => {
        it('creates article successfully and shows success notification', async () => {
            const newArticle = getArticleFixture(2)
            mockCreateArticle.mockResolvedValue(newArticle)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.createArticle(createArticleDto, true)

            await waitFor(() => {
                expect(mockCreateArticle).toHaveBeenCalledWith(
                    {
                        ...createArticleDto.translation,
                        is_current: true,
                    },
                    null,
                )
            })

            expect(mockOnArticleCreate).toHaveBeenCalledWith(newArticle)
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'NOTIFY',
                }),
            )
            expect(notify).toHaveBeenCalledWith({
                message: 'Article created and published with success',
                status: NotificationStatus.Success,
            })
        })

        it('creates unpublished article and shows appropriate success message', async () => {
            const newArticle = getArticleFixture(2)
            mockCreateArticle.mockResolvedValue(newArticle)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.createArticle(createArticleDto, false)

            await waitFor(() => {
                expect(mockCreateArticle).toHaveBeenCalledWith(
                    {
                        ...createArticleDto.translation,
                        is_current: false,
                    },
                    null,
                )
            })

            expect(notify).toHaveBeenCalledWith({
                message: 'Article created with success',
                status: NotificationStatus.Success,
            })
        })

        it('logs analytics event when creating article from template', async () => {
            const newArticle = getArticleFixture(2)
            mockCreateArticle.mockResolvedValue(newArticle)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    templateKey,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.createArticle(createArticleDto, true)

            await waitFor(() => {
                expect(logEvent).toHaveBeenCalledWith(
                    SegmentEvent.HelpCenterTemplatesArticleFromTemplateCreated,
                    {
                        template_key: templateKey,
                    },
                )
            })
        })

        it('returns early when article is null', async () => {
            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.createArticle(null, true)

            expect(mockCreateArticle).not.toHaveBeenCalled()
            expect(mockOnArticleCreate).not.toHaveBeenCalled()
        })

        it('handles API error and shows error notification', async () => {
            mockCreateArticle.mockRejectedValue(apiError)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.createArticle(createArticleDto, true)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'NOTIFY',
                    }),
                )
            })

            expect(notify).toHaveBeenCalledWith({
                message:
                    'Failed to create the article: please try again later.',
                status: NotificationStatus.Error,
            })
            expect(reportError).toHaveBeenCalledWith(apiError)
        })
    })

    describe('when updating articles', () => {
        it('updates article successfully and shows success notification', async () => {
            const updatedArticle = { ...existingArticle }
            mockUpdateArticle.mockResolvedValue(updatedArticle)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.updateArticle(existingArticle, true)

            await waitFor(() => {
                expect(mockUpdateArticle).toHaveBeenCalledWith(
                    mockHelpCenter.default_locale,
                    {
                        ...existingArticle,
                        translation: {
                            ...existingArticle.translation,
                            is_current: true,
                        },
                    },
                )
            })

            expect(mockOnArticleUpdate).toHaveBeenCalledWith(updatedArticle)
            expect(notify).toHaveBeenCalledWith({
                message: 'Article saved and published with success',
                status: NotificationStatus.Success,
            })
        })

        it('updates unpublished article and shows appropriate success message', async () => {
            const updatedArticle = { ...existingArticle }
            mockUpdateArticle.mockResolvedValue(updatedArticle)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.updateArticle(existingArticle, false)

            expect(notify).toHaveBeenCalledWith({
                message: 'Article saved with success',
                status: NotificationStatus.Success,
            })
        })

        it('updates AI article template review when publishing draft AI article', async () => {
            const aiArticle = {
                ...existingArticle,
                template_key: 'ai_guidance_id_123',
                translation: {
                    ...existingArticle.translation,
                    is_current: false,
                },
            }
            const updatedArticle = { ...aiArticle }
            mockUpdateArticle.mockResolvedValue(updatedArticle)
            mockMutateAsync.mockResolvedValue({})

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.updateArticle(aiArticle, true)

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    { help_center_id: mockHelpCenter.id },
                    {
                        action: 'publish',
                        template_key: aiArticle.template_key,
                    },
                ])
            })
        })

        it('does not update template review for non-AI articles', async () => {
            const regularArticle = {
                ...existingArticle,
                template_key: 'applyDiscount' as ArticleTemplateKey,
                translation: {
                    ...existingArticle.translation,
                    is_current: false,
                },
            }
            mockUpdateArticle.mockResolvedValue(regularArticle)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.updateArticle(regularArticle, true)

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('returns early when article is null', async () => {
            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.updateArticle(null, true)

            expect(mockUpdateArticle).not.toHaveBeenCalled()
            expect(mockOnArticleUpdate).not.toHaveBeenCalled()
        })

        it('handles API error and shows error notification', async () => {
            mockUpdateArticle.mockRejectedValue(apiError)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.updateArticle(existingArticle, true)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'NOTIFY',
                    }),
                )
            })

            expect(notify).toHaveBeenCalledWith({
                message: 'Failed to save the article: please try again later.',
                status: NotificationStatus.Error,
            })
            expect(reportError).toHaveBeenCalledWith(apiError)
        })
    })

    describe('when deleting articles', () => {
        it('deletes existing article successfully and shows success notification', async () => {
            mockDeleteArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.deleteArticle(existingArticle)

            await waitFor(() => {
                expect(mockDeleteArticle).toHaveBeenCalledWith(
                    existingArticle.id,
                )
            })

            expect(mockOnArticleDelete).toHaveBeenCalledWith(existingArticle)
            expect(notify).toHaveBeenCalledWith({
                message: 'Article deleted with success',
                status: NotificationStatus.Success,
            })
        })

        it('returns early when trying to delete non-existing article', async () => {
            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.deleteArticle(createArticleDto)

            expect(mockDeleteArticle).not.toHaveBeenCalled()
            expect(mockOnArticleDelete).not.toHaveBeenCalled()
        })

        it('returns early when article is null', async () => {
            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.deleteArticle(null)

            expect(mockDeleteArticle).not.toHaveBeenCalled()
            expect(mockOnArticleDelete).not.toHaveBeenCalled()
        })

        it('handles API error and shows error notification', async () => {
            mockDeleteArticle.mockRejectedValue(apiError)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.deleteArticle(existingArticle)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'NOTIFY',
                    }),
                )
            })

            expect(notify).toHaveBeenCalledWith({
                message: 'Failed to delete the article',
                status: NotificationStatus.Error,
            })
            expect(reportError).toHaveBeenCalledWith(apiError)
        })
    })

    describe('when deleting article translations', () => {
        it('deletes article translation successfully and shows success notification', async () => {
            const articleId = 123
            const locale = 'es-ES'
            mockDeleteArticleTranslation.mockResolvedValue(undefined)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.deleteArticleTranslation(articleId, locale)

            await waitFor(() => {
                expect(mockDeleteArticleTranslation).toHaveBeenCalledWith(
                    articleId,
                    locale,
                )
            })

            expect(mockOnArticleTranslationDelete).toHaveBeenCalledWith(locale)
            expect(notify).toHaveBeenCalledWith({
                message: 'Article translation deleted with success',
                status: NotificationStatus.Success,
            })
        })

        it('handles API error and shows error notification', async () => {
            const articleId = 123
            const locale = 'es-ES'
            mockDeleteArticleTranslation.mockRejectedValue(apiError)

            const { result } = renderHook(() =>
                useFeedbackArticleActions(
                    null,
                    mockOnArticleCreate,
                    mockOnArticleUpdate,
                    mockOnArticleDelete,
                    mockOnArticleTranslationDelete,
                ),
            )

            await result.current.deleteArticleTranslation(articleId, locale)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'NOTIFY',
                    }),
                )
            })

            expect(notify).toHaveBeenCalledWith({
                message: 'Failed to delete the article translation',
                status: NotificationStatus.Error,
            })
            expect(reportError).toHaveBeenCalledWith(apiError)
        })
    })
})
