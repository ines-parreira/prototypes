import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { HelpCenterClient } from 'rest_api/help_center_api/client'

import { useGetKnowledgeHubArticles } from './queries'
import * as resources from './resources'
import {
    KnowledgeHubArticleSourceType,
    KnowledgeHubArticlesQueryParams,
    KnowledgeHubArticlesResponse,
} from './types'

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
