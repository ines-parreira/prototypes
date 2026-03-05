import { renderHook } from '@repo/testing'
import { act } from 'react-dom/test-utils'

import {
    useBulkCopyArticles,
    useCopyArticle,
    useCreateArticle,
    useDeleteArticle,
    useDeleteArticleTranslationDraft,
    useRebasePublishArticleTranslation,
    useUpdateArticleTranslation,
} from 'models/helpCenter/mutations'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { reportError } from 'utils/errors'

import { useGuidanceArticleMutation } from '../hooks/useGuidanceArticleMutation'

jest.mock('models/helpCenter/mutations', () => ({
    useCreateArticle: jest.fn(),
    useDeleteArticle: jest.fn(),
    useDeleteArticleTranslationDraft: jest.fn(),
    useUpdateArticleTranslation: jest.fn(),
    useCopyArticle: jest.fn(),
    useBulkCopyArticles: jest.fn(),
    useRebasePublishArticleTranslation: jest.fn(),
}))

jest.mock('models/helpCenter/resources', () => ({
    ...jest.requireActual('models/helpCenter/resources'),
    getHelpCenterArticle: jest.fn(),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
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
const mockedUseRebasePublishArticleTranslation = jest.mocked(
    useRebasePublishArticleTranslation,
)
const mockedGetHelpCenterArticle = jest.mocked(getHelpCenterArticle)
const mockedUseHelpCenterApi = jest.mocked(useHelpCenterApi)
const mockedReportError = jest.mocked(reportError)

describe('useGuidanceArticleMutation', () => {
    const helpCenterId = 1
    const mutateAsyncMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseHelpCenterApi.mockReturnValue({
            client: {} as any,
        } as any)
        mockedGetHelpCenterArticle.mockResolvedValue(null)

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

        mockedUseRebasePublishArticleTranslation.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isLoading: false,
        } as any)
    })

    describe('getGuidanceArticleTranslation', () => {
        it('returns translation intents and locale for conflicting guidance', async () => {
            mockedGetHelpCenterArticle.mockResolvedValueOnce({
                id: 42,
                translation: {
                    locale: 'en-US',
                    intents: ['marketing::unsubscribe', 'order::status'],
                },
            } as any)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            const translation = await act(async () =>
                result.current.getGuidanceArticleTranslation({
                    articleId: 42,
                    locale: 'en',
                } as any),
            )

            expect(mockedGetHelpCenterArticle).toHaveBeenCalledWith(
                expect.anything(),
                {
                    id: 42,
                    help_center_id: helpCenterId,
                },
                {
                    locale: 'en',
                    version_status: 'current',
                    locale_fallback: true,
                },
            )
            expect(translation).toEqual({
                locale: 'en-US',
                intents: ['marketing::unsubscribe', 'order::status'],
            })
        })

        it('returns null when translation is not available', async () => {
            mockedGetHelpCenterArticle.mockResolvedValueOnce(null)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            const translation = await act(async () =>
                result.current.getGuidanceArticleTranslation({
                    articleId: 999,
                    locale: 'en',
                } as any),
            )

            expect(translation).toBeNull()
        })

        it('reports and rethrows errors when fetching translation fails', async () => {
            const error = new Error('Fetch failed')
            mockedGetHelpCenterArticle.mockRejectedValueOnce(error)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await expect(async () => {
                await act(async () => {
                    await result.current.getGuidanceArticleTranslation({
                        articleId: 42,
                        locale: 'en',
                    } as any)
                })
            }).rejects.toThrow('Fetch failed')

            expect(mockedReportError).toHaveBeenCalledWith(error, {
                tags: { team: 'convai-knowledge' },
                extra: {
                    context:
                        'Error while fetching conflicting guidance translation',
                    articleId: 42,
                    locale: 'en',
                },
            })
        })
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

    it('should call rebasePublishGuidanceArticle with correct parameters', async () => {
        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        await act(async () => {
            await result.current.rebasePublishGuidanceArticle(
                {
                    intents: ['order::status'],
                },
                {
                    articleId: 2,
                    locale: 'en',
                } as any,
            )
        })

        expect(mutateAsyncMock).toHaveBeenCalledWith([
            undefined,
            {
                article_id: 2,
                help_center_id: helpCenterId,
                locale: 'en',
            },
            {
                intents: ['order::status'],
                commit_message: undefined,
            },
        ])
    })

    it('reports and rethrows errors when rebasePublishGuidanceArticle fails', async () => {
        const error = new Error('Rebase failed')
        mutateAsyncMock.mockRejectedValueOnce(error)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        await expect(async () => {
            await act(async () => {
                await result.current.rebasePublishGuidanceArticle(
                    {
                        intents: ['order::status'],
                    },
                    {
                        articleId: 2,
                        locale: 'en',
                    } as any,
                )
            })
        }).rejects.toThrow('Rebase failed')

        expect(mockedReportError).toHaveBeenCalledWith(error, {
            tags: { team: 'convai-knowledge' },
            extra: {
                context: 'Error during guidance rebase publish',
            },
        })
    })

    it('returns empty intents when conflicting translation has no intents', async () => {
        mockedGetHelpCenterArticle.mockResolvedValueOnce({
            id: 42,
            translation: {
                locale: 'en-US',
                intents: undefined,
            },
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticleMutation({
                guidanceHelpCenterId: helpCenterId,
            }),
        )

        const translation = await act(async () =>
            result.current.getGuidanceArticleTranslation({
                articleId: 42,
                locale: 'en',
            } as any),
        )

        expect(translation).toEqual({
            locale: 'en-US',
            intents: [],
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

    describe('deleteGuidanceArticle', () => {
        it('should call deleteGuidanceArticle with correct parameters', async () => {
            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await act(async () => {
                await result.current.deleteGuidanceArticle(321)
            })

            expect(mutateAsyncMock).toHaveBeenCalledWith([
                undefined,
                {
                    id: 321,
                    help_center_id: helpCenterId,
                },
            ])
        })

        it('reports and rethrows errors when deleteGuidanceArticle fails', async () => {
            const error = new Error('Delete failed')
            mutateAsyncMock.mockRejectedValueOnce(error)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await expect(async () => {
                await act(async () => {
                    await result.current.deleteGuidanceArticle(321)
                })
            }).rejects.toThrow('Delete failed')

            expect(mockedReportError).toHaveBeenCalledWith(error, {
                tags: { team: 'convai-knowledge' },
                extra: {
                    context: 'Error during guidance article deletion',
                },
            })
        })
    })

    describe('duplicate', () => {
        it('should call duplicate with expected payload', async () => {
            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await act(async () => {
                await result.current.duplicate([1, 2], ['shop-a', 'shop-b'])
            })

            expect(mutateAsyncMock).toHaveBeenCalledWith([
                undefined,
                { help_center_id: helpCenterId },
                {
                    article_ids: [1, 2],
                    shop_names: ['shop-a', 'shop-b'],
                },
            ])
        })

        it('reports and rethrows errors when duplicate fails', async () => {
            const error = new Error('Bulk copy failed')
            mutateAsyncMock.mockRejectedValueOnce(error)

            const { result } = renderHook(() =>
                useGuidanceArticleMutation({
                    guidanceHelpCenterId: helpCenterId,
                }),
            )

            await expect(async () => {
                await act(async () => {
                    await result.current.duplicate([1], ['shop-a'])
                })
            }).rejects.toThrow('Bulk copy failed')

            expect(mockedReportError).toHaveBeenCalledWith(error, {
                tags: { team: 'convai-knowledge' },
                extra: {
                    context: 'Error during guidance article duplication',
                },
            })
        })
    })
})
