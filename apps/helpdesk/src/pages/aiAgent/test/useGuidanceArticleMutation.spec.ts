import { renderHook } from '@repo/testing'
import { act } from 'react-dom/test-utils'

import {
    useBulkCopyArticles,
    useCopyArticle,
    useCreateArticle,
    useDeleteArticle,
    useDeleteArticleTranslationDraft,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'

import { useGuidanceArticleMutation } from '../hooks/useGuidanceArticleMutation'

jest.mock('models/helpCenter/queries', () => ({
    useCreateArticle: jest.fn(),
    useDeleteArticle: jest.fn(),
    useDeleteArticleTranslationDraft: jest.fn(),
    useUpdateArticleTranslation: jest.fn(),
    useCopyArticle: jest.fn(),
    useBulkCopyArticles: jest.fn(),
    helpCenterKeys: {
        articles: jest.fn(() => ['articles']),
    },
}))

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: jest.fn(),
    }),
}))

const mockedUseCreateArticle = jest.mocked(useCreateArticle)
const mockedUseDeleteArticle = jest.mocked(useDeleteArticle)
const mockedUseDeleteArticleTranslationDraft = jest.mocked(
    useDeleteArticleTranslationDraft,
)
const mockedUseUpdateArticleTranslation = jest.mocked(
    useUpdateArticleTranslation,
)
const mockedUseCopyArticle = jest.mocked(useCopyArticle)
const mockedUseBulkCopyArticles = jest.mocked(useBulkCopyArticles)
const mockedReportError = jest.mocked(reportError)

describe('useGuidanceArticleMutation', () => {
    const helpCenterId = 1
    const mutateAsyncMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseCreateArticle.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        mockedUseDeleteArticle.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        mockedUseDeleteArticleTranslationDraft.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        mockedUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        mockedUseCopyArticle.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        mockedUseBulkCopyArticles.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)
    })

    describe('duplicateGuidanceArticle', () => {
        it('should call copyArticleAsync with correct parameters', async () => {
            const articleId = 2
            const shopName = 'test-shop'

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await act(async () => {
                await result.current.duplicateGuidanceArticle(
                    articleId,
                    shopName,
                )
            })

            expect(mutateAsyncMock).toHaveBeenCalledWith([
                undefined,
                { id: articleId, help_center_id: helpCenterId },
                shopName,
            ])
        })

        it('should handle error when copyArticleAsync fails', async () => {
            const articleId = 2
            const shopName = 'test-shop'
            const error = new Error('Copy failed')

            mutateAsyncMock.mockRejectedValueOnce(error)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await expect(async () => {
                await act(async () => {
                    await result.current.duplicateGuidanceArticle(
                        articleId,
                        shopName,
                    )
                })
            }).rejects.toThrow('Copy failed')

            expect(mockedReportError).toHaveBeenCalledWith(error, {
                tags: { team: 'convai-knowledge' },
                extra: {
                    context: 'Error during guidance article duplication',
                },
            })
        })
    })

    it('should return correct loading state', () => {
        mockedUseCopyArticle.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: true,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        expect(result.current.isGuidanceArticleUpdating).toBe(true)
    })

    it('should return return article when created', () => {
        mockedUseCreateArticle.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: true,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        expect(result.current.isGuidanceArticleUpdating).toBe(true)
    })

    it('should return article data when createGuidanceArticle is called', async () => {
        const mockData = { id: 123, title: 'Test Article' }

        mockedUseCreateArticle.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValueOnce({ data: mockData }),
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        const payload = { title: 'Some Title', content: 'Test' } as any // minimal shape for CreateGuidanceArticle

        const articleData = await act(async () => {
            return await result.current.createGuidanceArticle(payload)
        })

        expect(articleData).toEqual(mockData)
    })
    it('should return article data when updateGuidanceArticle is called', async () => {
        const mockUpdatedData = { id: 123, title: 'Updated Title' }

        mockedUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: jest
                .fn()
                .mockResolvedValueOnce({ data: mockUpdatedData }),
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        const payload = {
            title: 'Updated Title',
            content: 'Updated',
        } as any
        const params = { articleId: 123, locale: 'en' } as any

        const updatedData = await act(async () => {
            return await result.current.updateGuidanceArticle(payload, params)
        })

        expect(updatedData).toEqual(mockUpdatedData)
    })

    it('should report error if createGuidanceArticle fails', async () => {
        const error = new Error('Create failed')

        mockedUseCreateArticle.mockReturnValue({
            mutateAsync: jest.fn().mockRejectedValueOnce(error),
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        const payload = { title: 'Some Title', content: 'Test' } as any

        await act(async () => {
            try {
                await result.current.createGuidanceArticle(payload)
            } catch (e) {
                expect(e).toBeInstanceOf(Error)
                // expected error — do nothing
            }
        })

        expect(mockedReportError).toHaveBeenCalledWith(error, {
            tags: { team: 'convai-knowledge' },
            extra: {
                context: 'Error during guidance article creation',
            },
        })
    })

    it('should report error if updateGuidanceArticle fails', async () => {
        const error = new Error('Update failed')

        mockedUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: jest.fn().mockRejectedValueOnce(error),
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        const payload = {
            title: 'Updated Title',
            content: 'Updated',
        } as any
        const params = { articleId: 123, locale: 'en' } as any

        await act(async () => {
            try {
                await result.current.updateGuidanceArticle(payload, params)
            } catch (e) {
                expect(e).toBeInstanceOf(Error)
                // expected error — do nothing
            }
        })

        expect(mockedReportError).toHaveBeenCalledWith(error, {
            tags: { team: 'convai-knowledge' },
            extra: {
                context: 'Error during guidance article updating',
            },
        })
    })

    it('should throw an error when createGuidanceArticle is called without content', async () => {
        mockedUseCreateArticle.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        const payload = { title: 'Some Title', content: '' } as any // payload without content

        await act(async () => {
            try {
                await result.current.createGuidanceArticle(payload)
            } catch (e: any) {
                expect(e).toBeInstanceOf(Error)
                expect(e.message).toEqual(
                    'Content is required for creating the article',
                )
                // expected error — do nothing
            }
        })

        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    it('should throw an error when updateGuidanceArticle is called without content', async () => {
        mockedUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        const payload = { title: 'Some Title', content: '' } as any // payload without content
        const params = { articleId: 123, locale: 'en' } as any

        await act(async () => {
            try {
                await result.current.updateGuidanceArticle(payload, params)
            } catch (e: any) {
                expect(e).toBeInstanceOf(Error)
                expect(e.message).toEqual(
                    'Content is required for updating the article',
                )
                // expected error — do nothing
            }
        })

        expect(mutateAsyncMock).not.toHaveBeenCalled()
    })

    describe('discardGuidanceDraft', () => {
        it('should call deleteArticleTranslationDraftAsync with correct parameters', async () => {
            const articleId = 456
            const locale = 'en' as any

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await act(async () => {
                await result.current.discardGuidanceDraft(articleId, locale)
            })

            expect(mutateAsyncMock).toHaveBeenCalledWith([
                undefined,
                {
                    article_id: articleId,
                    help_center_id: helpCenterId,
                    locale,
                },
            ])
        })

        it('should handle error when deleteArticleTranslationDraftAsync fails', async () => {
            const articleId = 456
            const locale = 'en' as any
            const error = new Error('Discard draft failed')

            mutateAsyncMock.mockRejectedValueOnce(error)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await expect(async () => {
                await act(async () => {
                    await result.current.discardGuidanceDraft(articleId, locale)
                })
            }).rejects.toThrow('Discard draft failed')

            expect(mockedReportError).toHaveBeenCalledWith(error, {
                tags: { team: 'convai-knowledge' },
                extra: {
                    context: 'Error during guidance draft discard',
                },
            })
        })

        it('should return isDiscardingDraft loading state', () => {
            mockedUseDeleteArticleTranslationDraft.mockReturnValue({
                mutateAsync: mutateAsyncMock,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            expect(result.current.isDiscardingDraft).toBe(true)
        })

        it('should work with different locales', async () => {
            const articleId = 789
            const locale = 'fr' as any

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await act(async () => {
                await result.current.discardGuidanceDraft(articleId, locale)
            })

            expect(mutateAsyncMock).toHaveBeenCalledWith([
                undefined,
                {
                    article_id: articleId,
                    help_center_id: helpCenterId,
                    locale: 'fr',
                },
            ])
        })
    })
})
