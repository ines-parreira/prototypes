import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'

import type { SkillAggregateMetrics } from './useSkillsAggregateMetrics'
import {
    skillKey,
    useSkillsAggregateMetrics,
} from './useSkillsAggregateMetrics'
import { useSkillsArticles } from './useSkillsArticles'

jest.mock('models/helpCenter/queries')
jest.mock('./useSkillsAggregateMetrics', () => {
    const actual = jest.requireActual('./useSkillsAggregateMetrics')
    return {
        ...actual,
        useSkillsAggregateMetrics: jest.fn(),
    }
})

const mockUseGetHelpCenterArticleList = useGetHelpCenterArticleList as jest.Mock
const mockUseSkillsAggregateMetrics = useSkillsAggregateMetrics as jest.Mock

const HELP_CENTER_ID = 123

const buildMetricsMap = (): Map<string, SkillAggregateMetrics> => {
    const map = new Map<string, SkillAggregateMetrics>()
    map.set(skillKey(HELP_CENTER_ID, 1), {
        tickets: 100,
        handoverTickets: 20,
        csat: 4.5,
    })
    map.set(skillKey(HELP_CENTER_ID, 2), {
        tickets: 50,
        handoverTickets: 10,
        csat: 4.0,
    })
    return map
}

describe('useSkillsArticles', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockArticlesData = {
        meta: {
            page: 1,
            per_page: 200,
            item_count: 2,
            nb_pages: 1,
            current_page: '/articles?page=1&per_page=200',
        },
        object: 'list',
        data: [
            {
                id: 1,
                unlisted_id: 'abc',
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                category_id: null,
                help_center_id: HELP_CENTER_ID,
                origin: 'skill',
                ingested_resource_id: null,
                available_locales: ['en-US'],
                rating: { positive: 0, negative: 0 },
                translation: {
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                    title: 'Order Status',
                    excerpt: '',
                    content: '',
                    slug: 'order-status',
                    locale: 'en-US',
                    article_id: 1,
                    category_id: null,
                    article_unlisted_id: 'abc',
                    seo_meta: { title: null, description: null },
                    visibility_status: 'PUBLIC',
                    customer_visibility: 'PUBLIC',
                    is_current: false,
                    draft_version_id: 101,
                    published_version_id: 100,
                    published_datetime: '2024-01-01T00:00:00Z',
                    publisher_user_id: null,
                    commit_message: null,
                    version: 2,
                    intents: ['order::status'],
                    rating: { positive: 0, negative: 0 },
                },
            },
            {
                id: 2,
                unlisted_id: 'def',
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                category_id: null,
                help_center_id: HELP_CENTER_ID,
                origin: 'skill',
                ingested_resource_id: null,
                available_locales: ['en-US'],
                rating: { positive: 0, negative: 0 },
                translation: {
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                    title: 'Cancel Order',
                    excerpt: '',
                    content: '',
                    slug: 'cancel-order',
                    locale: 'en-US',
                    article_id: 2,
                    category_id: null,
                    article_unlisted_id: 'def',
                    seo_meta: { title: null, description: null },
                    visibility_status: 'PUBLIC',
                    customer_visibility: 'PUBLIC',
                    is_current: true,
                    draft_version_id: null,
                    published_version_id: 200,
                    published_datetime: '2024-01-01T00:00:00Z',
                    publisher_user_id: null,
                    commit_message: null,
                    version: 1,
                    intents: ['order::cancel'],
                    rating: { positive: 0, negative: 0 },
                },
            },
        ],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return enriched articles with metrics', async () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: buildMetricsMap(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        await waitFor(() => {
            expect(result.current.articles).toHaveLength(2)
        })

        expect(result.current.articles[0]).toMatchObject({
            id: 1,
            title: 'Order Status',
            intents: expect.arrayContaining([
                expect.objectContaining({
                    name: 'order::status',
                }),
            ]),
        })

        expect(result.current.articles[0].metrics).toEqual({
            tickets: 100,
            prevTickets: null,
            handoverTickets: 20,
            prevHandoverTickets: null,
            csat: 4.5,
            prevCsat: null,
            resourceSourceSetId: HELP_CENTER_ID,
        })
    })

    it('should detect draft versions', async () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        await waitFor(() => {
            expect(result.current.articles).toHaveLength(2)
        })

        expect(result.current.articles[0].draftVersion).toBeDefined()
        expect(result.current.articles[1].draftVersion).toBeUndefined()
    })

    it('should return empty array when no data', async () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        await waitFor(() => {
            expect(result.current.articles).toEqual([])
        })
    })

    it('should return empty array when articles array is empty', async () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: { meta: { item_count: 0, nb_pages: 0 }, data: [] },
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        await waitFor(() => {
            expect(result.current.articles).toEqual([])
        })
    })

    it('should handle loading state from articles query', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.articles).toEqual([])
    })

    it('should handle loading state from metrics query', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        expect(result.current.isMetricsLoading).toBe(true)
    })

    it('should handle error state from articles query', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should handle error state from metrics query', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        expect(result.current.isMetricsError).toBe(true)
    })

    it('should leave article.metrics unset when no matching metrics entry', async () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        await waitFor(() => {
            expect(result.current.articles).toHaveLength(2)
        })

        expect(result.current.articles[0].metrics).toBeUndefined()
        expect(result.current.articles[1].metrics).toBeUndefined()
    })

    it('should return metrics date range', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: buildMetricsMap(),
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(
            () => useSkillsArticles(HELP_CENTER_ID, 456),
            {
                wrapper,
            },
        )

        expect(result.current.metricsDateRange).toHaveProperty('start_datetime')
        expect(result.current.metricsDateRange).toHaveProperty('end_datetime')
    })

    it('should pass correct params to useGetHelpCenterArticleList', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: buildMetricsMap(),
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsArticles(999, 456), { wrapper })

        expect(mockUseGetHelpCenterArticleList).toHaveBeenCalledWith(
            999,
            {
                origin: 'skill',
                version_status: 'latest_draft',
                per_page: 200,
            },
            { enabled: true },
        )
    })

    it('should pass shop integration ID and date range to useSkillsAggregateMetrics', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockArticlesData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: buildMetricsMap(),
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsArticles(HELP_CENTER_ID, 888), { wrapper })

        expect(mockUseSkillsAggregateMetrics).toHaveBeenCalledWith({
            shopIntegrationId: 888,
            dateRange: expect.objectContaining({
                start_datetime: expect.any(String),
                end_datetime: expect.any(String),
            }),
            enabled: true,
        })
    })

    it('should disable the metrics query when shop integration ID is falsy', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsArticles(HELP_CENTER_ID, 0), { wrapper })

        expect(mockUseSkillsAggregateMetrics).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        )
    })

    it('should not fetch articles when help center ID is falsy', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsAggregateMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsArticles(0, 456), { wrapper })

        expect(mockUseGetHelpCenterArticleList).toHaveBeenCalledWith(
            0,
            {
                origin: 'skill',
                version_status: 'latest_draft',
                per_page: 200,
            },
            { enabled: false },
        )
    })
})
