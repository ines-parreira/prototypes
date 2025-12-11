import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import type { HelpCenterClient } from 'rest_api/help_center_api/client'

import {
    useBulkCopyArticles,
    useBulkDeleteArticles,
    useBulkUpdateArticleTranslationVisibility,
    useGetKnowledgeHubArticles,
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
