import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    useBulkCopyArticles,
    useBulkDeleteArticles,
    useBulkUpdateArticleTranslationVisibility,
    useCopyArticle,
    useCreateArticle,
    useCreateArticleTranslation,
    useDeleteArticle,
    useDeleteArticleTranslation,
    useDeleteArticleTranslationDraft,
    useRebasePublishArticleTranslation,
    useUpdateArticleTranslation,
} from '../mutations'
import { helpCenterKeys } from '../queries'
import * as resources from '../resources'

jest.mock('../resources', () => ({
    createArticle: jest.fn(),
    deleteArticle: jest.fn(),
    updateArticleTranslation: jest.fn(),
    createArticleTranslation: jest.fn(),
    deleteArticleTranslation: jest.fn(),
    deleteArticleTranslationDraft: jest.fn(),
    copyArticle: jest.fn(),
    bulkDeleteArticles: jest.fn(),
    bulkCopyArticles: jest.fn(),
    bulkUpdateArticleTranslationVisibility: jest.fn(),
    rebasePublishArticleTranslation: jest.fn(),
}))

const mockCreateArticle = resources.createArticle as jest.Mock
const mockDeleteArticle = resources.deleteArticle as jest.Mock
const mockUpdateArticleTranslation =
    resources.updateArticleTranslation as jest.Mock
const mockCreateArticleTranslation =
    resources.createArticleTranslation as jest.Mock
const mockDeleteArticleTranslation =
    resources.deleteArticleTranslation as jest.Mock
const mockDeleteArticleTranslationDraft =
    resources.deleteArticleTranslationDraft as jest.Mock
const mockCopyArticle = resources.copyArticle as jest.Mock
const mockBulkDeleteArticles = resources.bulkDeleteArticles as jest.Mock
const mockBulkCopyArticles = resources.bulkCopyArticles as jest.Mock
const mockBulkUpdateArticleTranslationVisibility =
    resources.bulkUpdateArticleTranslationVisibility as jest.Mock
const mockRebasePublishArticleTranslation =
    resources.rebasePublishArticleTranslation as jest.Mock

const mockTranslationPayload = {
    locale: 'en-US' as const,
    title: 'Test Article',
    content: 'Test Content',
    excerpt: 'Test excerpt',
    slug: 'test-article',
    seo_meta: {
        title: 'Test Article',
        description: 'Test description',
    },
}

describe('helpCenter mutations', () => {
    const helpCenterId = 123
    const articleListKey = helpCenterKeys.articles(helpCenterId)

    describe('useCreateArticle', () => {
        const queryClient = mockQueryClient()
        const onSuccessMock = jest.fn()
        const onErrorMock = jest.fn()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'cancelQueries')
            jest.spyOn(queryClient, 'setQueryData')
            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should call the mutation function with correct parameters', async () => {
            const mockResponse = {
                data: { id: 1, help_center_id: helpCenterId },
            }
            mockCreateArticle.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useCreateArticle(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { translation: mockTranslationPayload },
            ])

            await waitFor(() => {
                expect(mockCreateArticle).toHaveBeenCalled()
            })
        })

        it('should cancel queries when mutation starts', async () => {
            mockCreateArticle.mockResolvedValue({ data: { id: 1 } })

            const { result } = renderHook(
                () => useCreateArticle(helpCenterId),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { translation: mockTranslationPayload },
            ])

            await waitFor(() => {
                expect(queryClient.cancelQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })

        it('should invalidate queries on settled', async () => {
            mockCreateArticle.mockResolvedValue({ data: { id: 1 } })

            const { result } = renderHook(
                () =>
                    useCreateArticle(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { translation: mockTranslationPayload },
            ])

            await waitFor(() => {
                expect(onSettledMock).toHaveBeenCalled()
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })

        it('should call onSuccess callback on success', async () => {
            const mockResponse = {
                data: { id: 1, help_center_id: helpCenterId },
            }
            mockCreateArticle.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useCreateArticle(helpCenterId, {
                        onSuccess: onSuccessMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { translation: mockTranslationPayload },
            ])

            await waitFor(() => {
                expect(onSuccessMock).toHaveBeenCalledWith(mockResponse)
            })
        })

        it('should call onError callback on error', async () => {
            const error = new Error('API error')
            mockCreateArticle.mockRejectedValue(error)

            const { result } = renderHook(
                () =>
                    useCreateArticle(helpCenterId, {
                        onError: onErrorMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { translation: mockTranslationPayload },
            ])

            await waitFor(() => {
                expect(onErrorMock).toHaveBeenCalledWith(error)
            })
        })

        describe('Optimistic updates', () => {
            it('should optimistically add article to the list', async () => {
                const existingData = {
                    data: [
                        { id: 100, help_center_id: helpCenterId },
                        { id: 101, help_center_id: helpCenterId },
                    ],
                }

                queryClient.setQueryData(articleListKey, existingData)
                mockCreateArticle.mockResolvedValue({ data: { id: 1 } })

                const { result } = renderHook(
                    () => useCreateArticle(helpCenterId),
                    { wrapper },
                )

                result.current.mutate([
                    undefined,
                    { help_center_id: helpCenterId },
                    {
                        translation: {
                            ...mockTranslationPayload,
                            title: 'New Article',
                            content: 'New Content',
                        },
                    },
                ])

                await waitFor(() => {
                    const updatedData = queryClient.getQueryData(
                        articleListKey,
                    ) as any

                    // Should have 3 items now (2 existing + 1 optimistic)
                    expect(updatedData?.data?.length).toBe(3)
                    // Optimistic article should be first
                    expect(updatedData?.data?.[0]?.translation?.title).toBe(
                        'New Article',
                    )
                })
            })

            it('should revert optimistic update on error', async () => {
                const existingData = {
                    data: [{ id: 100, help_center_id: helpCenterId }],
                }

                queryClient.setQueryData(articleListKey, existingData)
                mockCreateArticle.mockRejectedValue(new Error('API error'))

                const { result } = renderHook(
                    () => useCreateArticle(helpCenterId),
                    { wrapper },
                )

                result.current.mutate([
                    undefined,
                    { help_center_id: helpCenterId },
                    {
                        translation: {
                            ...mockTranslationPayload,
                            title: 'New Article',
                            content: 'New Content',
                        },
                    },
                ])

                await waitFor(() => {
                    expect(result.current.isError).toBe(true)
                })

                // After error, data should be reverted
                const revertedData = queryClient.getQueryData(
                    articleListKey,
                ) as any
                expect(revertedData?.data?.length).toBe(1)
                expect(revertedData?.data?.[0]?.id).toBe(100)
            })
        })
    })

    describe('useDeleteArticle', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'cancelQueries')
            jest.spyOn(queryClient, 'setQueryData')
            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should call the mutation function with correct parameters', async () => {
            mockDeleteArticle.mockResolvedValue({ data: {} })

            const { result } = renderHook(
                () =>
                    useDeleteArticle(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { id: 1, help_center_id: helpCenterId },
            ])

            await waitFor(() => {
                expect(mockDeleteArticle).toHaveBeenCalled()
            })
        })

        it('should invalidate both article and article list caches on settled', async () => {
            mockDeleteArticle.mockResolvedValue({ data: {} })
            const articleId = 1

            const { result } = renderHook(
                () =>
                    useDeleteArticle(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { id: articleId, help_center_id: helpCenterId },
            ])

            await waitFor(() => {
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.article(helpCenterId, articleId),
                    refetchType: 'none',
                })
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                    exact: true,
                })
            })
        })

        describe('Optimistic updates', () => {
            it('should optimistically remove article from the list', async () => {
                const existingData = {
                    data: [
                        { id: 1, help_center_id: helpCenterId },
                        { id: 2, help_center_id: helpCenterId },
                    ],
                }

                queryClient.setQueryData(articleListKey, existingData)
                mockDeleteArticle.mockResolvedValue({ data: {} })

                const { result } = renderHook(
                    () => useDeleteArticle(helpCenterId),
                    { wrapper },
                )

                result.current.mutate([
                    undefined,
                    { id: 1, help_center_id: helpCenterId },
                ])

                await waitFor(() => {
                    const updatedData = queryClient.getQueryData(
                        articleListKey,
                    ) as any

                    expect(updatedData?.data?.length).toBe(1)
                    expect(updatedData?.data?.[0]?.id).toBe(2)
                })
            })
        })
    })

    describe('useUpdateArticleTranslation', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'cancelQueries')
            jest.spyOn(queryClient, 'setQueryData')
            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should call the mutation function with correct parameters', async () => {
            mockUpdateArticleTranslation.mockResolvedValue({ data: {} })

            const { result } = renderHook(
                () =>
                    useUpdateArticleTranslation(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                {
                    article_id: 1,
                    help_center_id: helpCenterId,
                    locale: 'en-US',
                },
                { title: 'Updated Title' },
            ])

            await waitFor(() => {
                expect(mockUpdateArticleTranslation).toHaveBeenCalled()
            })
        })

        describe('Optimistic updates', () => {
            it('should optimistically update translation in the list', async () => {
                const existingData = {
                    data: [
                        {
                            id: 1,
                            help_center_id: helpCenterId,
                            translation: { title: 'Original Title' },
                        },
                    ],
                }

                queryClient.setQueryData(articleListKey, existingData)
                mockUpdateArticleTranslation.mockResolvedValue({ data: {} })

                const { result } = renderHook(
                    () => useUpdateArticleTranslation(helpCenterId),
                    { wrapper },
                )

                result.current.mutate([
                    undefined,
                    {
                        article_id: 1,
                        help_center_id: helpCenterId,
                        locale: 'en-US',
                    },
                    { title: 'Updated Title' },
                ])

                await waitFor(() => {
                    const updatedData = queryClient.getQueryData(
                        articleListKey,
                    ) as any

                    expect(updatedData?.data?.[0]?.translation?.title).toBe(
                        'Updated Title',
                    )
                })
            })
        })
    })

    describe('useBulkCopyArticles', () => {
        const queryClient = mockQueryClient()
        const onSuccessMock = jest.fn()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should call the mutation function with correct parameters', async () => {
            mockBulkCopyArticles.mockResolvedValue({ data: {} })

            const { result } = renderHook(
                () =>
                    useBulkCopyArticles(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { article_ids: [1, 2, 3], shop_names: ['shop1', 'shop2'] },
            ])

            await waitFor(() => {
                expect(mockBulkCopyArticles).toHaveBeenCalled()
            })
        })

        it('should invalidate queries on settled', async () => {
            mockBulkCopyArticles.mockResolvedValue({ data: {} })

            const { result } = renderHook(
                () =>
                    useBulkCopyArticles(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { article_ids: [1, 2, 3], shop_names: ['shop1'] },
            ])

            await waitFor(() => {
                expect(onSettledMock).toHaveBeenCalled()
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })

        it('should call onSuccess callback on success', async () => {
            const mockResponse = { data: { copied_count: 3 } }
            mockBulkCopyArticles.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useBulkCopyArticles(helpCenterId, {
                        onSuccess: onSuccessMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { article_ids: [1, 2, 3], shop_names: ['shop1'] },
            ])

            await waitFor(() => {
                expect(onSuccessMock).toHaveBeenCalledWith(mockResponse)
            })
        })
    })

    describe('useBulkDeleteArticles', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should call the mutation function with correct parameters', async () => {
            mockBulkDeleteArticles.mockResolvedValue({ data: {} })

            const { result } = renderHook(
                () =>
                    useBulkDeleteArticles(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { article_ids: [1, 2, 3] },
            ])

            await waitFor(() => {
                expect(mockBulkDeleteArticles).toHaveBeenCalled()
            })
        })

        it('should invalidate queries on settled', async () => {
            mockBulkDeleteArticles.mockResolvedValue({ data: {} })

            const { result } = renderHook(
                () =>
                    useBulkDeleteArticles(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                { article_ids: [1, 2, 3] },
            ])

            await waitFor(() => {
                expect(onSettledMock).toHaveBeenCalled()
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })
    })

    describe('useCreateArticleTranslation', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should invalidate both article and article list caches on settled', async () => {
            mockCreateArticleTranslation.mockResolvedValue({ data: {} })
            const articleId = 1

            const { result } = renderHook(
                () =>
                    useCreateArticleTranslation(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { article_id: articleId, help_center_id: helpCenterId },
                {
                    ...mockTranslationPayload,
                    locale: 'fr-FR' as const,
                    title: 'Titre',
                    content: 'Contenu',
                },
            ])

            await waitFor(() => {
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.article(helpCenterId, articleId),
                })
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })
    })

    describe('useDeleteArticleTranslation', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should invalidate both article and article list caches on settled', async () => {
            mockDeleteArticleTranslation.mockResolvedValue({ data: {} })
            const articleId = 1

            const { result } = renderHook(
                () =>
                    useDeleteArticleTranslation(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                {
                    article_id: articleId,
                    help_center_id: helpCenterId,
                    locale: 'fr-FR',
                },
            ])

            await waitFor(() => {
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.article(helpCenterId, articleId),
                })
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })
    })

    describe('useDeleteArticleTranslationDraft', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should invalidate both article and article list caches on settled', async () => {
            mockDeleteArticleTranslationDraft.mockResolvedValue({ data: {} })
            const articleId = 1

            const { result } = renderHook(
                () =>
                    useDeleteArticleTranslationDraft(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                {
                    article_id: articleId,
                    help_center_id: helpCenterId,
                    locale: 'en-US',
                },
            ])

            await waitFor(() => {
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.article(helpCenterId, articleId),
                })
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })
    })

    describe('useCopyArticle', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should invalidate article list cache on settled', async () => {
            mockCopyArticle.mockResolvedValue({ data: {} })

            const { result } = renderHook(
                () =>
                    useCopyArticle(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { id: 1, help_center_id: helpCenterId },
                'target-shop',
            ])

            await waitFor(() => {
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })
    })

    describe('useBulkUpdateArticleTranslationVisibility', () => {
        const queryClient = mockQueryClient()
        const onSettledMock = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()

            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('should invalidate article list cache on settled', async () => {
            mockBulkUpdateArticleTranslationVisibility.mockResolvedValue({
                data: {},
            })

            const { result } = renderHook(
                () =>
                    useBulkUpdateArticleTranslationVisibility(helpCenterId, {
                        onSettled: onSettledMock,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId },
                {
                    article_ids: [1, 2],
                    visibility_status: 'PUBLIC',
                    locale_code: 'en-US' as const,
                },
            ])

            await waitFor(() => {
                expect(onSettledMock).toHaveBeenCalled()
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
            })
        })
    })

    describe('useRebasePublishArticleTranslation', () => {
        const queryClient = mockQueryClient()
        const onSettled = jest.fn()
        const onError = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            queryClient.clear()
            jest.spyOn(queryClient, 'invalidateQueries')
        })

        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )

        it('calls resource mutation with expected arguments', async () => {
            mockRebasePublishArticleTranslation.mockResolvedValue({
                data: { id: 1 },
            })
            const onSuccess = jest.fn()

            const { result } = renderHook(
                () =>
                    useRebasePublishArticleTranslation(helpCenterId, {
                        onSuccess,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId, article_id: 1, locale: 'en' },
                { intents: ['order::status'] },
            ])

            await waitFor(() => {
                expect(mockRebasePublishArticleTranslation).toHaveBeenCalled()
                expect(onSuccess).toHaveBeenCalledWith({ data: { id: 1 } })
            })
        })

        it('calls onError callback when resource mutation fails', async () => {
            const error = new Error('Rebase failed')
            mockRebasePublishArticleTranslation.mockRejectedValue(error)

            const { result } = renderHook(
                () =>
                    useRebasePublishArticleTranslation(helpCenterId, {
                        onError,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId, article_id: 1, locale: 'en' },
                { intents: ['order::status'] },
            ])

            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(error)
            })
        })

        it('invalidates article and article list caches on settled', async () => {
            mockRebasePublishArticleTranslation.mockResolvedValue({
                data: { id: 1 },
            })

            const { result } = renderHook(
                () =>
                    useRebasePublishArticleTranslation(helpCenterId, {
                        onSettled,
                    }),
                { wrapper },
            )

            result.current.mutate([
                undefined,
                { help_center_id: helpCenterId, article_id: 1, locale: 'en' },
                { intents: ['order::status'] },
            ])

            await waitFor(() => {
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: helpCenterKeys.article(helpCenterId, 1),
                })
                expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                    queryKey: articleListKey,
                })
                expect(onSettled).toHaveBeenCalled()
            })
        })
    })
})
