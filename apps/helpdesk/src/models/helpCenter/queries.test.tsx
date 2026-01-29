import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import type { HelpCenterClient } from 'rest_api/help_center_api/client'

import {
    useBulkCopyArticles,
    useBulkDeleteArticles,
    useBulkUpdateArticleTranslationVisibility,
    useDeleteArticleTranslationDraft,
    useGetArticleTranslationVersion,
    useGetArticleTranslationVersions,
    useGetHelpCenterStatistics,
    useGetKnowledgeHubArticles,
    useInfiniteGetArticleTranslationVersions,
} from './queries'
import * as resources from './resources'
import type {
    KnowledgeHubArticlesQueryParams,
    KnowledgeHubArticlesResponse,
} from './types'
import { KnowledgeHubArticleSourceType } from './types'

const mockClient = {} as HelpCenterClient

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(() => ({
        client: mockClient,
    })),
}))

const mockGetKnowledgeHubArticles = jest.spyOn(
    resources,
    'getKnowledgeHubArticles',
)

const mockResponse: KnowledgeHubArticlesResponse = {
    articles: [
        {
            id: 1,
            title: 'Test Article 1',
            type: KnowledgeHubArticleSourceType.FaqHelpCenter,
            updatedDatetime: '2024-01-15T10:00:00Z',
            createdDatetime: '2024-01-01T10:00:00Z',
            visibilityStatus: 'PUBLIC',
            source: 'test-source.com',
            localeCode: 'en-US',
            shopName: 'test-shop',
            draftVersionId: null,
            publishedVersionId: null,
        },
        {
            id: 2,
            title: 'Test Article 2',
            type: KnowledgeHubArticleSourceType.GuidanceHelpCenter,
            updatedDatetime: '2024-01-20T10:00:00Z',
            createdDatetime: '2024-01-05T10:00:00Z',
            visibilityStatus: 'UNLISTED',
            source: 'another-source.com',
            localeCode: 'en-US',
            shopName: 'test-shop',
            draftVersionId: null,
            publishedVersionId: null,
        },
    ],
}

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useGetKnowledgeHubArticles', () => {
    const queryParams: KnowledgeHubArticlesQueryParams = {
        account_id: 123,
        guidance_help_center_id: 1,
        snippet_help_center_id: 2,
        faq_help_center_id: 3,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should fetch knowledge hub articles successfully', async () => {
        mockGetKnowledgeHubArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(
            () => useGetKnowledgeHubArticles(queryParams),
            { wrapper: createWrapper() },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockResponse)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should handle loading state correctly', async () => {
        mockGetKnowledgeHubArticles.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve(mockResponse), 100),
                ),
        )

        const { result } = renderHook(
            () => useGetKnowledgeHubArticles(queryParams),
            { wrapper: createWrapper() },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.isLoading).toBe(false)
    })

    it('should handle error state', async () => {
        const mockError = new Error('API Error')
        mockGetKnowledgeHubArticles.mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useGetKnowledgeHubArticles(queryParams),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeTruthy()
        expect(result.current.data).toBeUndefined()
    })

    it('should respect custom enabled override', async () => {
        mockGetKnowledgeHubArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(
            () =>
                useGetKnowledgeHubArticles(queryParams, {
                    enabled: false,
                }),
            { wrapper: createWrapper() },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockGetKnowledgeHubArticles).not.toHaveBeenCalled()
    })

    it('should handle empty articles response', async () => {
        const emptyResponse: KnowledgeHubArticlesResponse = {
            articles: [],
        }

        mockGetKnowledgeHubArticles.mockResolvedValue(emptyResponse)

        const { result } = renderHook(
            () => useGetKnowledgeHubArticles(queryParams),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(emptyResponse)
        expect(result.current.data?.articles).toHaveLength(0)
    })

    it('should call getKnowledgeHubArticles with correct parameters', async () => {
        mockGetKnowledgeHubArticles.mockResolvedValue(mockResponse)

        const customParams: KnowledgeHubArticlesQueryParams = {
            account_id: 456,
            guidance_help_center_id: 10,
            snippet_help_center_id: null,
        }

        const { result } = renderHook(
            () => useGetKnowledgeHubArticles(customParams),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetKnowledgeHubArticles).toHaveBeenCalledWith(
            mockClient,
            customParams,
        )
    })
})

describe('useBulkDeleteArticles', () => {
    let queryClient: QueryClient
    const mockBulkDeleteArticles = jest.spyOn(resources, 'bulkDeleteArticles')

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should successfully delete articles', async () => {
        const mockResponse = { deleted_count: 3 }
        mockBulkDeleteArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useBulkDeleteArticles(), {
            wrapper,
        })

        let response
        await act(async () => {
            response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                { article_ids: [1, 2, 3] },
            ])
        })
        expect(response).toEqual(mockResponse)

        expect(mockBulkDeleteArticles).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            { article_ids: [1, 2, 3] },
        )

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should handle error when deletion fails', async () => {
        const mockError = new Error('Failed to delete articles')
        mockBulkDeleteArticles.mockRejectedValue(mockError)

        const { result } = renderHook(() => useBulkDeleteArticles(), {
            wrapper,
        })

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    { help_center_id: 1 },
                    { article_ids: [1, 2, 3] },
                ])
            } catch (error) {
                expect(error).toEqual(mockError)
            }
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('should call onSuccess callback after successful deletion', async () => {
        const mockResponse = { deleted_count: 2 }
        mockBulkDeleteArticles.mockResolvedValue(mockResponse)
        const onSuccess = jest.fn()

        const { result } = renderHook(
            () => useBulkDeleteArticles({ onSuccess }),
            { wrapper },
        )

        await act(async () => {
            await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                { article_ids: [1, 2] },
            ])
        })

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith(
                mockResponse,
                [undefined, { help_center_id: 1 }, { article_ids: [1, 2] }],
                undefined,
            )
        })
    })

    it('should call onError callback when deletion fails', async () => {
        const mockError = new Error('Deletion failed')
        mockBulkDeleteArticles.mockRejectedValue(mockError)
        const onError = jest.fn()

        const { result } = renderHook(
            () => useBulkDeleteArticles({ onError }),
            { wrapper },
        )

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    { help_center_id: 1 },
                    { article_ids: [1] },
                ])
            } catch {
                // Expected to throw
            }
        })

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(
                mockError,
                [undefined, { help_center_id: 1 }, { article_ids: [1] }],
                undefined,
            )
        })
    })

    it('should handle empty article_ids array', async () => {
        const mockResponse = { deleted_count: 0 }
        mockBulkDeleteArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useBulkDeleteArticles(), {
            wrapper,
        })

        await act(async () => {
            const response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                { article_ids: [] },
            ])
            expect(response).toEqual(mockResponse)
        })
    })
})

describe('useBulkUpdateArticleTranslationVisibility', () => {
    let queryClient: QueryClient
    const mockBulkUpdateArticleTranslationVisibility = jest.spyOn(
        resources,
        'bulkUpdateArticleTranslationVisibility',
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should successfully update visibility status to PUBLIC', async () => {
        const mockResponse = { articles: [{ id: 1 }, { id: 2 }] }
        mockBulkUpdateArticleTranslationVisibility.mockResolvedValue(
            mockResponse,
        )

        const { result } = renderHook(
            () => useBulkUpdateArticleTranslationVisibility(),
            { wrapper },
        )

        await act(async () => {
            const response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1, 2],
                    locale_code: 'en-US',
                    visibility_status: 'PUBLIC',
                },
            ])
            expect(response).toEqual(mockResponse)
        })

        expect(mockBulkUpdateArticleTranslationVisibility).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            {
                article_ids: [1, 2],
                locale_code: 'en-US',
                visibility_status: 'PUBLIC',
            },
        )

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should successfully update visibility status to UNLISTED', async () => {
        const mockResponse = { articles: [{ id: 1 }] }
        mockBulkUpdateArticleTranslationVisibility.mockResolvedValue(
            mockResponse,
        )

        const { result } = renderHook(
            () => useBulkUpdateArticleTranslationVisibility(),
            { wrapper },
        )

        await act(async () => {
            const response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 2 },
                {
                    article_ids: [1],
                    locale_code: 'en-US',
                    visibility_status: 'UNLISTED',
                },
            ])
            expect(response).toEqual(mockResponse)
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should handle error when visibility update fails', async () => {
        const mockError = new Error('Failed to update visibility')
        mockBulkUpdateArticleTranslationVisibility.mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useBulkUpdateArticleTranslationVisibility(),
            { wrapper },
        )

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1],
                        locale_code: 'en-US',
                        visibility_status: 'PUBLIC',
                    },
                ])
            } catch (error) {
                expect(error).toEqual(mockError)
            }
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('should call onSuccess callback after successful update', async () => {
        const mockResponse = { articles: [{ id: 1 }] }
        mockBulkUpdateArticleTranslationVisibility.mockResolvedValue(
            mockResponse,
        )
        const onSuccess = jest.fn()

        const { result } = renderHook(
            () => useBulkUpdateArticleTranslationVisibility({ onSuccess }),
            { wrapper },
        )

        await act(async () => {
            await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1],
                    locale_code: 'en-US',
                    visibility_status: 'PUBLIC',
                },
            ])
        })

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith(
                mockResponse,
                [
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1],
                        locale_code: 'en-US',
                        visibility_status: 'PUBLIC',
                    },
                ],
                undefined,
            )
        })
    })

    it('should call onError callback when update fails', async () => {
        const mockError = new Error('Update failed')
        mockBulkUpdateArticleTranslationVisibility.mockRejectedValue(mockError)
        const onError = jest.fn()

        const { result } = renderHook(
            () => useBulkUpdateArticleTranslationVisibility({ onError }),
            { wrapper },
        )

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1],
                        locale_code: 'en-US',
                        visibility_status: 'PUBLIC',
                    },
                ])
            } catch {
                // Expected to throw
            }
        })

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(
                mockError,
                [
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1],
                        locale_code: 'en-US',
                        visibility_status: 'PUBLIC',
                    },
                ],
                undefined,
            )
        })
    })

    it('should handle different locale codes', async () => {
        const mockResponse = { articles: [{ id: 1 }] }
        mockBulkUpdateArticleTranslationVisibility.mockResolvedValue(
            mockResponse,
        )

        const { result } = renderHook(
            () => useBulkUpdateArticleTranslationVisibility(),
            { wrapper },
        )

        await act(async () => {
            await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1],
                    locale_code: 'fr-FR',
                    visibility_status: 'PUBLIC',
                },
            ])
        })

        expect(mockBulkUpdateArticleTranslationVisibility).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            {
                article_ids: [1],
                locale_code: 'fr-FR',
                visibility_status: 'PUBLIC',
            },
        )
    })
})

describe('useBulkCopyArticles', () => {
    let queryClient: QueryClient
    const mockBulkCopyArticles = jest.spyOn(resources, 'bulkCopyArticles')

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should successfully copy articles to multiple shops', async () => {
        const mockResponse = { copied_count: 6 }
        mockBulkCopyArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useBulkCopyArticles(), {
            wrapper,
        })

        let response
        await act(async () => {
            response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1, 2, 3],
                    shop_names: ['shop-1', 'shop-2'],
                },
            ])
        })
        expect(response).toEqual(mockResponse)

        expect(mockBulkCopyArticles).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            {
                article_ids: [1, 2, 3],
                shop_names: ['shop-1', 'shop-2'],
            },
        )

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should handle error when copy fails', async () => {
        const mockError = new Error('Failed to copy articles')
        mockBulkCopyArticles.mockRejectedValue(mockError)

        const { result } = renderHook(() => useBulkCopyArticles(), {
            wrapper,
        })

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1, 2],
                        shop_names: ['shop-1'],
                    },
                ])
            } catch (error) {
                expect(error).toEqual(mockError)
            }
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('should call onSuccess callback after successful copy', async () => {
        const mockResponse = { copied_count: 2 }
        mockBulkCopyArticles.mockResolvedValue(mockResponse)
        const onSuccess = jest.fn()

        const { result } = renderHook(
            () => useBulkCopyArticles({ onSuccess }),
            { wrapper },
        )

        await act(async () => {
            await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1, 2],
                    shop_names: ['shop-1'],
                },
            ])
        })

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith(
                mockResponse,
                [
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1, 2],
                        shop_names: ['shop-1'],
                    },
                ],
                undefined,
            )
        })
    })

    it('should call onError callback when copy fails', async () => {
        const mockError = new Error('Copy failed')
        mockBulkCopyArticles.mockRejectedValue(mockError)
        const onError = jest.fn()

        const { result } = renderHook(() => useBulkCopyArticles({ onError }), {
            wrapper,
        })

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1],
                        shop_names: ['shop-1'],
                    },
                ])
            } catch {
                // Expected to throw
            }
        })

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(
                mockError,
                [
                    undefined,
                    { help_center_id: 1 },
                    {
                        article_ids: [1],
                        shop_names: ['shop-1'],
                    },
                ],
                undefined,
            )
        })
    })

    it('should handle empty shop_names array', async () => {
        const mockResponse = { copied_count: 0 }
        mockBulkCopyArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useBulkCopyArticles(), {
            wrapper,
        })

        await act(async () => {
            const response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1, 2, 3],
                    shop_names: [],
                },
            ])
            expect(response).toEqual(mockResponse)
        })
    })

    it('should handle single article and single shop', async () => {
        const mockResponse = { copied_count: 1 }
        mockBulkCopyArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useBulkCopyArticles(), {
            wrapper,
        })

        await act(async () => {
            const response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1],
                    shop_names: ['single-shop'],
                },
            ])
            expect(response).toEqual(mockResponse)
        })
    })

    it('should handle large batch of articles and shops', async () => {
        const mockResponse = { copied_count: 15 }
        mockBulkCopyArticles.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useBulkCopyArticles(), {
            wrapper,
        })

        await act(async () => {
            const response = await result.current.mutateAsync([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1, 2, 3, 4, 5],
                    shop_names: ['shop-1', 'shop-2', 'shop-3'],
                },
            ])
            expect(response).toEqual(mockResponse)
        })

        expect(mockBulkCopyArticles).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            {
                article_ids: [1, 2, 3, 4, 5],
                shop_names: ['shop-1', 'shop-2', 'shop-3'],
            },
        )
    })
})

describe('useGetHelpCenterStatistics', () => {
    let queryClient: QueryClient
    const mockGetHelpCenterStatistics = jest.spyOn(
        resources,
        'getHelpCenterStatistics',
    )

    const mockStatisticsResponse = [
        {
            articleId: 1,
            rating: {
                up: 150,
                down: 30,
            },
        },
        {
            articleId: 2,
            rating: {
                up: 80,
                down: 20,
            },
        },
    ]

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should fetch help center statistics successfully', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                        ids: [1, 2],
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockStatisticsResponse)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should call getHelpCenterStatistics with correct parameters', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    123,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                        ids: [10, 20, 30],
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetHelpCenterStatistics).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 123 },
            {
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                ids: [10, 20, 30],
            },
        )
    })

    it('should handle loading state correctly', async () => {
        mockGetHelpCenterStatistics.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve(mockStatisticsResponse), 100),
                ),
        )

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.isLoading).toBe(false)
    })

    it('should handle error state', async () => {
        const mockError = new Error('Failed to fetch statistics')
        mockGetHelpCenterStatistics.mockRejectedValue(mockError)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeTruthy()
        expect(result.current.data).toBeUndefined()
    })

    it('should respect custom enabled override when false', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { enabled: false },
                ),
            { wrapper },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockGetHelpCenterStatistics).not.toHaveBeenCalled()
    })

    it('should handle empty statistics response', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue([])

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual([])
        expect(result.current.data).toHaveLength(0)
    })

    it('should handle statistics with zero ratings', async () => {
        const zeroRatingsResponse = [
            {
                articleId: 1,
                rating: {
                    up: 0,
                    down: 0,
                },
            },
        ]

        mockGetHelpCenterStatistics.mockResolvedValue(zeroRatingsResponse)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                        ids: [1],
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(zeroRatingsResponse)
        expect(result.current.data?.[0].rating.up).toBe(0)
        expect(result.current.data?.[0].rating.down).toBe(0)
    })

    it('should handle statistics without ids parameter', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetHelpCenterStatistics).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            {
                start_date: '2024-01-01',
                end_date: '2024-12-31',
            },
        )
    })

    it('should call onSuccess callback after successful fetch', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)
        const onSuccess = jest.fn()

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { onSuccess, enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(onSuccess).toHaveBeenCalledWith(mockStatisticsResponse)
    })

    it('should call onError callback when fetch fails', async () => {
        const mockError = new Error('Fetch failed')
        mockGetHelpCenterStatistics.mockRejectedValue(mockError)
        const onError = jest.fn()

        renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { onError, enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(mockError)
        })
    })

    it('should handle pagination parameters', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                        page: 2,
                        per_page: 50,
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetHelpCenterStatistics).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            {
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                page: 2,
                per_page: 50,
            },
        )
    })

    it('should handle large number of article ids', async () => {
        const largeIdArray = Array.from({ length: 100 }, (_, i) => i + 1)
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                        ids: largeIdArray,
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetHelpCenterStatistics).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 1 },
            expect.objectContaining({
                ids: largeIdArray,
            }),
        )
    })

    it('should return null when client is undefined', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(null)

        const { result } = renderHook(
            () =>
                useGetHelpCenterStatistics(
                    1,
                    {
                        start_date: '2024-01-01',
                        end_date: '2024-12-31',
                    },
                    { enabled: true },
                ),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toBeNull()
    })

    it('should use correct query key', () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const queryParams = {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            ids: [1, 2],
        }

        renderHook(
            () => useGetHelpCenterStatistics(1, queryParams, { enabled: true }),
            { wrapper },
        )

        const queries = queryClient.getQueryCache().getAll()
        const statisticsQuery = queries.find((q) =>
            q.queryKey.includes('statistics'),
        )

        expect(statisticsQuery?.queryKey).toEqual([
            'help-center',
            1,
            'statistics',
            queryParams,
        ])
    })

    it('should refetch when query parameters change', async () => {
        mockGetHelpCenterStatistics.mockResolvedValue(mockStatisticsResponse)

        const { result, rerender } = renderHook(
            ({ queryParams }) =>
                useGetHelpCenterStatistics(1, queryParams, { enabled: true }),
            {
                wrapper,
                initialProps: {
                    queryParams: {
                        start_date: '2024-01-01',
                        end_date: '2024-06-30',
                    },
                },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(mockGetHelpCenterStatistics).toHaveBeenCalledTimes(1)

        mockGetHelpCenterStatistics.mockClear()

        rerender({
            queryParams: {
                start_date: '2024-07-01',
                end_date: '2024-12-31',
            },
        })

        await waitFor(() => {
            expect(mockGetHelpCenterStatistics).toHaveBeenCalledWith(
                mockClient,
                { help_center_id: 1 },
                {
                    start_date: '2024-07-01',
                    end_date: '2024-12-31',
                },
            )
        })
    })
})

describe('useGetArticleTranslationVersions', () => {
    let queryClient: QueryClient
    const mockListArticleTranslationVersions = jest.spyOn(
        resources,
        'listArticleTranslationVersions',
    )

    const mockVersionsResponse = {
        object: 'list' as const,
        data: [
            {
                id: 1,
                version: 1,
                title: 'Article Title v1',
                excerpt: 'Article excerpt v1',
                content: '<p>Article body v1</p>',
                slug: 'article-title-v1',
                seo_meta: null,
                created_datetime: '2024-01-01T10:00:00Z',
                published_datetime: '2024-01-01T10:00:00Z',
            },
            {
                id: 2,
                version: 2,
                title: 'Article Title v2',
                excerpt: 'Article excerpt v2',
                content: '<p>Article body v2</p>',
                slug: 'article-title-v2',
                seo_meta: null,
                created_datetime: '2024-01-15T10:00:00Z',
                published_datetime: '2024-01-15T10:00:00Z',
            },
        ],
        meta: {
            page: 1,
            per_page: 25,
            nb_pages: 1,
            item_count: 2,
            current_page:
                '/help-centers/1/articles/100/translations/en-US/versions?page=1&per_page=25',
        },
    }

    const pathParams = {
        help_center_id: 1,
        article_id: 100,
        locale: 'en-US',
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should fetch article translation versions successfully', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            mockVersionsResponse,
        )

        const { result } = renderHook(
            () => useGetArticleTranslationVersions(pathParams),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockVersionsResponse)
        expect(result.current.isLoading).toBe(false)
    })

    it('should call listArticleTranslationVersions with correct parameters', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            mockVersionsResponse,
        )

        const { result } = renderHook(
            () =>
                useGetArticleTranslationVersions(pathParams, {
                    page: 2,
                    per_page: 10,
                }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockListArticleTranslationVersions).toHaveBeenCalledWith(
            mockClient,
            pathParams,
            { page: 2, per_page: 10 },
        )
    })

    it('should handle error state', async () => {
        const mockError = new Error('Failed to fetch versions')
        mockListArticleTranslationVersions.mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useGetArticleTranslationVersions(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeTruthy()
    })

    it('should respect custom enabled override when false', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            mockVersionsResponse,
        )

        const { result } = renderHook(
            () =>
                useGetArticleTranslationVersions(pathParams, undefined, {
                    enabled: false,
                }),
            { wrapper },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })

    it('should handle empty versions response', async () => {
        const emptyResponse = {
            object: 'list' as const,
            data: [],
            meta: {
                page: 1,
                per_page: 25,
                nb_pages: 0,
                item_count: 0,
                current_page:
                    '/help-centers/1/articles/100/translations/en-US/versions?page=1&per_page=25',
            },
        }
        mockListArticleTranslationVersions.mockResolvedValue(emptyResponse)

        const { result } = renderHook(
            () => useGetArticleTranslationVersions(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.data).toHaveLength(0)
    })

    it('should be disabled when locale is missing', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            mockVersionsResponse,
        )

        const { result } = renderHook(
            () =>
                useGetArticleTranslationVersions({
                    help_center_id: 1,
                    article_id: 100,
                    locale: '',
                }),
            { wrapper },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })
})

describe('useInfiniteGetArticleTranslationVersions', () => {
    let queryClient: QueryClient
    const mockListArticleTranslationVersions = jest.spyOn(
        resources,
        'listArticleTranslationVersions',
    )

    const createPageResponse = (page: number, hasMore: boolean) => ({
        object: 'list' as const,
        data: [
            {
                id: page * 10 + 1,
                version: page * 10 + 1,
                title: `Article Title v${page * 10 + 1}`,
                excerpt: `Article excerpt v${page * 10 + 1}`,
                content: `<p>Article body v${page * 10 + 1}</p>`,
                slug: `article-title-v${page * 10 + 1}`,
                seo_meta: null,
                created_datetime: '2024-01-01T10:00:00Z',
                published_datetime: '2024-01-01T10:00:00Z',
            },
            {
                id: page * 10 + 2,
                version: page * 10 + 2,
                title: `Article Title v${page * 10 + 2}`,
                excerpt: `Article excerpt v${page * 10 + 2}`,
                content: `<p>Article body v${page * 10 + 2}</p>`,
                slug: `article-title-v${page * 10 + 2}`,
                seo_meta: null,
                created_datetime: '2024-01-02T10:00:00Z',
                published_datetime: '2024-01-02T10:00:00Z',
            },
        ],
        meta: {
            page,
            per_page: 2,
            nb_pages: hasMore ? page + 1 : page,
            item_count: 2,
            current_page: `/help-centers/1/articles/100/translations/en-US/versions?page=${page}&per_page=2`,
            next_page: hasMore
                ? `/help-centers/1/articles/100/translations/en-US/versions?page=${page + 1}&per_page=2`
                : undefined,
        },
    })

    const pathParams = {
        help_center_id: 1,
        article_id: 100,
        locale: 'en-US',
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should fetch first page of versions successfully', async () => {
        const firstPageResponse = createPageResponse(1, true)
        mockListArticleTranslationVersions.mockResolvedValue(firstPageResponse)

        const { result } = renderHook(
            () => useInfiniteGetArticleTranslationVersions(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.pages).toHaveLength(1)
        expect(result.current.data?.pages[0]).toEqual(firstPageResponse)
    })

    it('should fetch next page when fetchNextPage is called', async () => {
        const firstPageResponse = createPageResponse(1, true)
        const secondPageResponse = createPageResponse(2, false)

        mockListArticleTranslationVersions
            .mockResolvedValueOnce(firstPageResponse)
            .mockResolvedValueOnce(secondPageResponse)

        const { result } = renderHook(
            () => useInfiniteGetArticleTranslationVersions(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.hasNextPage).toBe(true)

        await act(async () => {
            await result.current.fetchNextPage()
        })

        await waitFor(() => {
            expect(result.current.data?.pages).toHaveLength(2)
        })

        expect(result.current.data?.pages[1]).toEqual(secondPageResponse)
    })

    it('should not have next page when on last page', async () => {
        const lastPageResponse = createPageResponse(1, false)
        mockListArticleTranslationVersions.mockResolvedValue(lastPageResponse)

        const { result } = renderHook(
            () => useInfiniteGetArticleTranslationVersions(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.hasNextPage).toBe(false)
    })

    it('should handle error state', async () => {
        const mockError = new Error('Failed to fetch versions')
        mockListArticleTranslationVersions.mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useInfiniteGetArticleTranslationVersions(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeTruthy()
    })

    it('should respect custom enabled override', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            createPageResponse(1, false),
        )

        const { result } = renderHook(
            () =>
                useInfiniteGetArticleTranslationVersions(
                    pathParams,
                    undefined,
                    {
                        enabled: false,
                    },
                ),
            { wrapper },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })

    it('should pass query params correctly', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            createPageResponse(1, false),
        )

        const { result } = renderHook(
            () =>
                useInfiniteGetArticleTranslationVersions(pathParams, {
                    per_page: 10,
                }),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockListArticleTranslationVersions).toHaveBeenCalledWith(
            mockClient,
            pathParams,
            { per_page: 10, page: 1 },
        )
    })
})

describe('useGetArticleTranslationVersion', () => {
    let queryClient: QueryClient
    const mockGetArticleTranslationVersion = jest.spyOn(
        resources,
        'getArticleTranslationVersion',
    )

    const mockVersionResponse = {
        id: 1,
        version: 5,
        title: 'Article Title',
        excerpt: 'Article excerpt',
        content: '<p>Article body content</p>',
        slug: 'article-title',
        seo_meta: null,
        created_datetime: '2024-01-01T10:00:00Z',
        published_datetime: '2024-01-15T10:00:00Z',
    }

    const pathParams = {
        help_center_id: 1,
        article_id: 100,
        locale: 'en-US',
        version_id: 5,
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should fetch a specific version successfully', async () => {
        mockGetArticleTranslationVersion.mockResolvedValue(mockVersionResponse)

        const { result } = renderHook(
            () => useGetArticleTranslationVersion(pathParams),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockVersionResponse)
        expect(result.current.isLoading).toBe(false)
    })

    it('should call getArticleTranslationVersion with correct parameters', async () => {
        mockGetArticleTranslationVersion.mockResolvedValue(mockVersionResponse)

        const { result } = renderHook(
            () => useGetArticleTranslationVersion(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetArticleTranslationVersion).toHaveBeenCalledWith(
            mockClient,
            pathParams,
        )
    })

    it('should handle error state', async () => {
        const mockError = new Error('Version not found')
        mockGetArticleTranslationVersion.mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useGetArticleTranslationVersion(pathParams),
            { wrapper },
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeTruthy()
    })

    it('should respect custom enabled override', async () => {
        mockGetArticleTranslationVersion.mockResolvedValue(mockVersionResponse)

        const { result } = renderHook(
            () =>
                useGetArticleTranslationVersion(pathParams, {
                    enabled: false,
                }),
            { wrapper },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockGetArticleTranslationVersion).not.toHaveBeenCalled()
    })

    it('should be disabled when version_id is undefined', async () => {
        mockGetArticleTranslationVersion.mockResolvedValue(mockVersionResponse)

        const { result } = renderHook(
            () =>
                useGetArticleTranslationVersion({
                    help_center_id: 1,
                    article_id: 100,
                    locale: 'en-US',
                    version_id: undefined as unknown as number,
                }),
            { wrapper },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockGetArticleTranslationVersion).not.toHaveBeenCalled()
    })

    it('should be disabled when locale is empty', async () => {
        mockGetArticleTranslationVersion.mockResolvedValue(mockVersionResponse)

        const { result } = renderHook(
            () =>
                useGetArticleTranslationVersion({
                    help_center_id: 1,
                    article_id: 100,
                    locale: '',
                    version_id: 5,
                }),
            { wrapper },
        )

        expect(result.current.fetchStatus).toBe('idle')
        expect(mockGetArticleTranslationVersion).not.toHaveBeenCalled()
    })
})

describe('useDeleteArticleTranslationDraft', () => {
    let queryClient: QueryClient
    const mockDeleteArticleTranslationDraft = jest.spyOn(
        resources,
        'deleteArticleTranslationDraft',
    )

    const createMockAxiosResponse = (status: number = 204) => ({
        data: {} as Record<string, never>,
        status,
        statusText: status === 204 ? 'No Content' : 'OK',
        headers: {},
        config: {} as any,
    })

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should successfully delete article translation draft', async () => {
        const mockResponse = createMockAxiosResponse()
        mockDeleteArticleTranslationDraft.mockResolvedValue(mockResponse)

        const { result } = renderHook(
            () => useDeleteArticleTranslationDraft(),
            { wrapper },
        )

        let response
        await act(async () => {
            response = await result.current.mutateAsync([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 100,
                    locale: 'en-US',
                },
            ])
        })

        expect(response).toEqual(mockResponse)
        expect(mockDeleteArticleTranslationDraft).toHaveBeenCalledWith(
            mockClient,
            {
                help_center_id: 1,
                article_id: 100,
                locale: 'en-US',
            },
        )

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should handle error when deletion fails', async () => {
        const mockError = new Error('Failed to delete draft')
        mockDeleteArticleTranslationDraft.mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useDeleteArticleTranslationDraft(),
            { wrapper },
        )

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    {
                        help_center_id: 1,
                        article_id: 100,
                        locale: 'en-US',
                    },
                ])
            } catch (error) {
                expect(error).toEqual(mockError)
            }
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('should call onSuccess callback after successful deletion', async () => {
        const mockResponse = createMockAxiosResponse()
        mockDeleteArticleTranslationDraft.mockResolvedValue(mockResponse)
        const onSuccess = jest.fn()

        const { result } = renderHook(
            () => useDeleteArticleTranslationDraft({ onSuccess }),
            { wrapper },
        )

        await act(async () => {
            await result.current.mutateAsync([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 100,
                    locale: 'en-US',
                },
            ])
        })

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith(
                mockResponse,
                [
                    undefined,
                    {
                        help_center_id: 1,
                        article_id: 100,
                        locale: 'en-US',
                    },
                ],
                undefined,
            )
        })
    })

    it('should call onError callback when deletion fails', async () => {
        const mockError = new Error('Deletion failed')
        mockDeleteArticleTranslationDraft.mockRejectedValue(mockError)
        const onError = jest.fn()

        const { result } = renderHook(
            () => useDeleteArticleTranslationDraft({ onError }),
            { wrapper },
        )

        await act(async () => {
            try {
                await result.current.mutateAsync([
                    undefined,
                    {
                        help_center_id: 1,
                        article_id: 100,
                        locale: 'en-US',
                    },
                ])
            } catch {
                // Expected to throw
            }
        })

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(
                mockError,
                [
                    undefined,
                    {
                        help_center_id: 1,
                        article_id: 100,
                        locale: 'en-US',
                    },
                ],
                undefined,
            )
        })
    })

    it('should handle different locales', async () => {
        const mockResponse = createMockAxiosResponse()
        mockDeleteArticleTranslationDraft.mockResolvedValue(mockResponse)

        const { result } = renderHook(
            () => useDeleteArticleTranslationDraft(),
            { wrapper },
        )

        await act(async () => {
            await result.current.mutateAsync([
                undefined,
                {
                    help_center_id: 1,
                    article_id: 100,
                    locale: 'fr-FR',
                },
            ])
        })

        expect(mockDeleteArticleTranslationDraft).toHaveBeenCalledWith(
            mockClient,
            {
                help_center_id: 1,
                article_id: 100,
                locale: 'fr-FR',
            },
        )
    })
})
