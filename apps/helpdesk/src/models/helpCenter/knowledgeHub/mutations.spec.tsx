import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import * as helpCenterQueries from 'models/helpCenter/queries'
import type {
    KnowledgeHubArticle,
    KnowledgeHubArticlesQueryParams,
    KnowledgeHubArticlesResponse,
} from 'models/helpCenter/types'
import { KnowledgeHubArticleSourceType } from 'models/helpCenter/types'

import {
    useKnowledgeHubBulkDelete,
    useKnowledgeHubBulkUpdateVisibility,
    useKnowledgeHubCreateArticle,
    useKnowledgeHubDeleteArticle,
    useKnowledgeHubUpdateArticle,
} from './mutations'

jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useCreateArticle: jest.fn(),
    useUpdateArticleTranslation: jest.fn(),
    useDeleteArticle: jest.fn(),
    useBulkDeleteArticles: jest.fn(),
    useBulkUpdateArticleTranslationVisibility: jest.fn(),
    helpCenterKeys: {
        knowledgeHubArticles: jest.fn(() => ['knowledge-hub-articles']),
    },
}))

const mockUseCreateArticle =
    helpCenterQueries.useCreateArticle as jest.MockedFunction<
        typeof helpCenterQueries.useCreateArticle
    >
const mockUseUpdateArticleTranslation =
    helpCenterQueries.useUpdateArticleTranslation as jest.MockedFunction<
        typeof helpCenterQueries.useUpdateArticleTranslation
    >
const mockUseDeleteArticle =
    helpCenterQueries.useDeleteArticle as jest.MockedFunction<
        typeof helpCenterQueries.useDeleteArticle
    >
const mockUseBulkDeleteArticles =
    helpCenterQueries.useBulkDeleteArticles as jest.MockedFunction<
        typeof helpCenterQueries.useBulkDeleteArticles
    >
const mockUseBulkUpdateArticleTranslationVisibility =
    helpCenterQueries.useBulkUpdateArticleTranslationVisibility as jest.MockedFunction<
        typeof helpCenterQueries.useBulkUpdateArticleTranslationVisibility
    >

describe('useKnowledgeHubMutations', () => {
    let queryClient: QueryClient
    const queryParams: KnowledgeHubArticlesQueryParams = {
        account_id: 123,
        guidance_help_center_id: 1,
    }

    const mockArticles: KnowledgeHubArticle[] = [
        {
            id: 1,
            title: 'Article 1',
            source: 'test-source',
            localeCode: 'en-US',
            visibilityStatus: 'PUBLIC',
            shopName: null,
            createdDatetime: '2024-01-01T00:00:00Z',
            updatedDatetime: '2024-01-01T00:00:00Z',
            type: KnowledgeHubArticleSourceType.GuidanceHelpCenter,
            draftVersionId: null,
            publishedVersionId: null,
        },
        {
            id: 2,
            title: 'Article 2',
            source: 'test-source',
            localeCode: 'en-US',
            visibilityStatus: 'UNLISTED',
            shopName: null,
            createdDatetime: '2024-01-02T00:00:00Z',
            updatedDatetime: '2024-01-02T00:00:00Z',
            type: KnowledgeHubArticleSourceType.GuidanceHelpCenter,
            draftVersionId: null,
            publishedVersionId: null,
        },
    ]

    const mockArticlesResponse: KnowledgeHubArticlesResponse = {
        articles: mockArticles,
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        jest.clearAllMocks()

        queryClient.setQueryData(
            ['knowledge-hub-articles'],
            mockArticlesResponse,
        )
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('useKnowledgeHubCreateArticle', () => {
        it('should add optimistic article to cache on mutate', async () => {
            let capturedCallbacks: any

            mockUseCreateArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubCreateArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                {
                    translation: {
                        title: 'New Article',
                        locale: 'en-US',
                        visibility_status: 'PUBLIC',
                    },
                },
            ]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData?.articles).toHaveLength(3)
            expect(updatedData?.articles[0].title).toBe('New Article')
            expect(updatedData?.articles[0].visibilityStatus).toBe('PUBLIC')
        })

        it('should revert cache on error', async () => {
            let capturedCallbacks: any

            mockUseCreateArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubCreateArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                {
                    translation: {
                        title: 'New Article',
                        locale: 'en-US',
                    },
                },
            ]

            const context = await capturedCallbacks.onMutate(variables)

            await capturedCallbacks.onError(
                new Error('Failed'),
                variables,
                context,
            )

            const revertedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(revertedData?.articles).toHaveLength(2)
            expect(revertedData).toEqual(mockArticlesResponse)
        })

        it('should call onSuccess callback', async () => {
            const onSuccess = jest.fn()
            let capturedCallbacks: any

            mockUseCreateArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(
                () =>
                    useKnowledgeHubCreateArticle(1, queryParams, { onSuccess }),
                { wrapper },
            )

            const mockData = { id: 3, title: 'Created Article' }
            await capturedCallbacks.onSuccess(mockData)

            expect(onSuccess).toHaveBeenCalledWith(mockData)
        })

        it('should call onError callback', async () => {
            const onError = jest.fn()
            let capturedCallbacks: any

            mockUseCreateArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(
                () => useKnowledgeHubCreateArticle(1, queryParams, { onError }),
                {
                    wrapper,
                },
            )

            const error = new Error('Create failed')
            const variables: any = [undefined, undefined, { translation: {} }]
            const context = { previousArticles: mockArticlesResponse }

            await capturedCallbacks.onError(error, variables, context)

            expect(onError).toHaveBeenCalledWith(error)
        })

        it('should invalidate queries on settled', async () => {
            const onSettled = jest.fn()
            let capturedCallbacks: any

            mockUseCreateArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(
                () =>
                    useKnowledgeHubCreateArticle(1, queryParams, { onSettled }),
                { wrapper },
            )

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

            await capturedCallbacks.onSettled()

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: ['knowledge-hub-articles'],
            })
            expect(onSettled).toHaveBeenCalled()
        })
    })

    describe('useKnowledgeHubUpdateArticle', () => {
        it('should update article in cache on mutate', async () => {
            let capturedCallbacks: any

            mockUseUpdateArticleTranslation.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubUpdateArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                { article_id: 1 },
                {
                    title: 'Updated Article',
                    visibility_status: 'PUBLIC',
                },
            ]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            const updatedArticle = updatedData?.articles.find((a) => a.id === 1)
            expect(updatedArticle?.title).toBe('Updated Article')
            expect(updatedArticle?.visibilityStatus).toBe('PUBLIC')
        })

        it('should preserve unchanged fields when updating', async () => {
            let capturedCallbacks: any

            mockUseUpdateArticleTranslation.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubUpdateArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                { article_id: 1 },
                {
                    title: 'Updated Title Only',
                },
            ]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            const updatedArticle = updatedData?.articles.find((a) => a.id === 1)
            expect(updatedArticle?.title).toBe('Updated Title Only')
            expect(updatedArticle?.visibilityStatus).toBe('PUBLIC')
        })

        it('should revert cache on error', async () => {
            let capturedCallbacks: any

            mockUseUpdateArticleTranslation.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubUpdateArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                { article_id: 1 },
                { title: 'Updated' },
            ]

            const context = await capturedCallbacks.onMutate(variables)

            await capturedCallbacks.onError(
                new Error('Failed'),
                variables,
                context,
            )

            const revertedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(revertedData?.articles[0].title).toBe('Article 1')
        })
    })

    describe('useKnowledgeHubDeleteArticle', () => {
        it('should remove article from cache on mutate', async () => {
            let capturedCallbacks: any

            mockUseDeleteArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubDeleteArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [undefined, { id: 1 }]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData?.articles).toHaveLength(1)
            expect(updatedData?.articles[0].id).toBe(2)
        })

        it('should revert cache on error', async () => {
            let capturedCallbacks: any

            mockUseDeleteArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubDeleteArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [undefined, { id: 1 }]

            const context = await capturedCallbacks.onMutate(variables)

            await capturedCallbacks.onError(
                new Error('Failed'),
                variables,
                context,
            )

            const revertedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(revertedData?.articles).toHaveLength(2)
        })
    })

    describe('useKnowledgeHubBulkDelete', () => {
        it('should remove multiple articles from cache on mutate', async () => {
            let capturedCallbacks: any

            mockUseBulkDeleteArticles.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubBulkDelete(queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                { article_ids: [1, 2] },
            ]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData?.articles).toHaveLength(0)
        })

        it('should handle partial deletion', async () => {
            let capturedCallbacks: any

            mockUseBulkDeleteArticles.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubBulkDelete(queryParams), {
                wrapper,
            })

            const variables: any = [undefined, undefined, { article_ids: [1] }]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData?.articles).toHaveLength(1)
            expect(updatedData?.articles[0].id).toBe(2)
        })

        it('should revert cache on error', async () => {
            let capturedCallbacks: any

            mockUseBulkDeleteArticles.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubBulkDelete(queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                { article_ids: [1, 2] },
            ]

            const context = await capturedCallbacks.onMutate(variables)

            await capturedCallbacks.onError(
                new Error('Failed'),
                variables,
                context,
            )

            const revertedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(revertedData?.articles).toHaveLength(2)
        })
    })

    describe('useKnowledgeHubBulkUpdateVisibility', () => {
        it('should update visibility for multiple articles on mutate', async () => {
            let capturedCallbacks: any

            mockUseBulkUpdateArticleTranslationVisibility.mockImplementation(
                (options) => {
                    capturedCallbacks = options
                    return {
                        mutateAsync: jest.fn(),
                    } as any
                },
            )

            renderHook(() => useKnowledgeHubBulkUpdateVisibility(queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                {
                    article_ids: [1, 2],
                    visibility_status: 'PUBLIC',
                },
            ]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData?.articles[0].visibilityStatus).toBe('PUBLIC')
            expect(updatedData?.articles[1].visibilityStatus).toBe('PUBLIC')
        })

        it('should update only specified articles', async () => {
            let capturedCallbacks: any

            mockUseBulkUpdateArticleTranslationVisibility.mockImplementation(
                (options) => {
                    capturedCallbacks = options
                    return {
                        mutateAsync: jest.fn(),
                    } as any
                },
            )

            renderHook(() => useKnowledgeHubBulkUpdateVisibility(queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                {
                    article_ids: [1],
                    visibility_status: 'UNLISTED',
                },
            ]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData?.articles[0].visibilityStatus).toBe('UNLISTED')
            expect(updatedData?.articles[1].visibilityStatus).toBe('UNLISTED')
        })

        it('should revert cache on error', async () => {
            let capturedCallbacks: any

            mockUseBulkUpdateArticleTranslationVisibility.mockImplementation(
                (options) => {
                    capturedCallbacks = options
                    return {
                        mutateAsync: jest.fn(),
                    } as any
                },
            )

            renderHook(() => useKnowledgeHubBulkUpdateVisibility(queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                {
                    article_ids: [1, 2],
                    visibility_status: 'PUBLIC',
                },
            ]

            const context = await capturedCallbacks.onMutate(variables)

            await capturedCallbacks.onError(
                new Error('Failed'),
                variables,
                context,
            )

            const revertedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(revertedData?.articles[0].visibilityStatus).toBe('PUBLIC')
            expect(revertedData?.articles[1].visibilityStatus).toBe('UNLISTED')
        })

        it('should invalidate queries on settled', async () => {
            const onSettled = jest.fn()
            let capturedCallbacks: any

            mockUseBulkUpdateArticleTranslationVisibility.mockImplementation(
                (options) => {
                    capturedCallbacks = options
                    return {
                        mutateAsync: jest.fn(),
                    } as any
                },
            )

            renderHook(
                () =>
                    useKnowledgeHubBulkUpdateVisibility(queryParams, {
                        onSettled,
                    }),
                { wrapper },
            )

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

            await capturedCallbacks.onSettled()

            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: ['knowledge-hub-articles'],
            })
            expect(onSettled).toHaveBeenCalled()
        })
    })

    describe('edge cases', () => {
        it('should handle empty articles array', async () => {
            queryClient.setQueryData<KnowledgeHubArticlesResponse>(
                ['knowledge-hub-articles'],
                { articles: [] },
            )

            let capturedCallbacks: any

            mockUseCreateArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubCreateArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                undefined,
                {
                    translation: {
                        title: 'New Article',
                        locale: 'en-US',
                    },
                },
            ]

            await capturedCallbacks.onMutate(variables)

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData?.articles).toHaveLength(1)
        })

        it('should handle missing cache data gracefully', async () => {
            queryClient.clear()

            let capturedCallbacks: any

            mockUseUpdateArticleTranslation.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubUpdateArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [
                undefined,
                { article_id: 1 },
                { title: 'Updated' },
            ]

            const context = await capturedCallbacks.onMutate(variables)

            expect(context.previousArticles).toBeUndefined()

            const updatedData =
                queryClient.getQueryData<KnowledgeHubArticlesResponse>([
                    'knowledge-hub-articles',
                ])

            expect(updatedData).toBeUndefined()
        })

        it('should not error when reverting with no previous data', async () => {
            queryClient.clear()

            let capturedCallbacks: any

            mockUseDeleteArticle.mockImplementation((options) => {
                capturedCallbacks = options
                return {
                    mutateAsync: jest.fn(),
                } as any
            })

            renderHook(() => useKnowledgeHubDeleteArticle(1, queryParams), {
                wrapper,
            })

            const variables: any = [undefined, { id: 1 }]
            const context = { previousArticles: undefined }

            await expect(
                capturedCallbacks.onError(
                    new Error('Failed'),
                    variables,
                    context,
                ),
            ).resolves.not.toThrow()
        })
    })
})
