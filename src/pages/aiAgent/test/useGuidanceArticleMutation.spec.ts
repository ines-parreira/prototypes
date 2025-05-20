import { act } from 'react-dom/test-utils'

import {
    useCopyArticle,
    useCreateArticle,
    useDeleteArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'
import { renderHook } from 'utils/testing/renderHook'

import { useGuidanceArticleMutation } from '../hooks/useGuidanceArticleMutation'

jest.mock('models/helpCenter/queries', () => ({
    useCreateArticle: jest.fn(),
    useDeleteArticle: jest.fn(),
    useUpdateArticleTranslation: jest.fn(),
    useCopyArticle: jest.fn(),
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
const mockedUseUpdateArticleTranslation = jest.mocked(
    useUpdateArticleTranslation,
)
const mockedUseCopyArticle = jest.mocked(useCopyArticle)
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

        mockedUseUpdateArticleTranslation.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)

        mockedUseCopyArticle.mockReturnValue({
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

            await act(async () => {
                await result.current.duplicateGuidanceArticle(
                    articleId,
                    shopName,
                )
            })

            expect(mockedReportError).toHaveBeenCalledWith(error, {
                tags: { team: 'convai-knowledge' },
                extra: {
                    context: 'Error during guidance article duplication',
                },
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
    })
})
