import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useListIntents } from 'models/helpCenter/queries'

import { useSkillsArticles } from './useSkillsArticles'
import { useSkillsMetrics } from './useSkillsMetrics'

jest.mock('models/helpCenter/queries')
jest.mock('./useSkillsMetrics')

const mockUseListIntents = useListIntents as jest.Mock
const mockUseSkillsMetrics = useSkillsMetrics as jest.Mock

describe('useSkillsArticles', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockIntentsData = {
        intents: [
            {
                name: 'order::status' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 1,
                        title: 'Order Status',
                        locale: 'en',
                        article_translation_version_id: 100,
                        status: 'published' as const,
                        template_key: 'standard',
                        visibility_status: 'PUBLIC' as const,
                    },
                    {
                        id: 1,
                        title: 'Order Status',
                        locale: 'en-draft',
                        article_translation_version_id: 101,
                        status: 'draft' as const,
                        template_key: 'standard',
                        visibility_status: 'PUBLIC' as const,
                    },
                ],
            },
            {
                name: 'order::cancel' as any,
                status: 'linked' as const,
                help_center_id: 123,
                articles: [
                    {
                        id: 2,
                        title: 'Cancel Order',
                        locale: 'en',
                        article_translation_version_id: 200,
                        status: 'published' as const,
                        template_key: 'standard',
                        visibility_status: 'PUBLIC' as const,
                    },
                ],
            },
        ],
    }

    const mockMetricsData = [
        {
            resourceSourceId: 1,
            tickets: 100,
            handoverTickets: 20,
            csat: 4.5,
            resourceSourceSetId: 123,
        },
        {
            resourceSourceId: 2,
            tickets: 50,
            handoverTickets: 10,
            csat: 4.0,
            resourceSourceSetId: 124,
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return enriched articles with metrics', async () => {
        mockUseListIntents.mockReturnValue({
            data: mockIntentsData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

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
            handoverTickets: 20,
            csat: 4.5,
            resourceSourceSetId: 123,
        })
    })

    it('should return empty array when no intents data', async () => {
        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.articles).toEqual([])
        })
    })

    it('should return empty array when intents array is empty', async () => {
        mockUseListIntents.mockReturnValue({
            data: { intents: [] },
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.articles).toEqual([])
        })
    })

    it('should handle loading state from intents query', () => {
        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.articles).toEqual([])
    })

    it('should handle loading state from metrics query', () => {
        mockUseListIntents.mockReturnValue({
            data: mockIntentsData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        expect(result.current.isMetricsLoading).toBe(true)
    })

    it('should handle error state from intents query', () => {
        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        expect(result.current.isError).toBe(true)
    })

    it('should handle error state from metrics query', () => {
        mockUseListIntents.mockReturnValue({
            data: mockIntentsData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        expect(result.current.isMetricsError).toBe(true)
    })

    it('should enrich articles with undefined metrics when no matching metrics data', async () => {
        mockUseListIntents.mockReturnValue({
            data: mockIntentsData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.articles).toHaveLength(2)
        })

        expect(result.current.articles[0].metrics).toBeUndefined()
        expect(result.current.articles[1].metrics).toBeUndefined()
    })

    it('should return metrics date range', () => {
        mockUseListIntents.mockReturnValue({
            data: mockIntentsData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsArticles(123, 456), {
            wrapper,
        })

        expect(result.current.metricsDateRange).toHaveProperty('start_datetime')
        expect(result.current.metricsDateRange).toHaveProperty('end_datetime')
    })

    it('should pass help center ID to useListIntents', () => {
        mockUseListIntents.mockReturnValue({
            data: mockIntentsData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsArticles(999, 456), { wrapper })

        expect(mockUseListIntents).toHaveBeenCalledWith(999, {
            enabled: true,
        })
    })

    it('should pass shop integration ID to useSkillsMetrics', () => {
        mockUseListIntents.mockReturnValue({
            data: mockIntentsData,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsArticles(123, 888), { wrapper })

        expect(mockUseSkillsMetrics).toHaveBeenCalledWith(888, true)
    })

    it('should not fetch intents when help center ID is falsy', () => {
        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        mockUseSkillsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsArticles(0, 456), { wrapper })

        expect(mockUseListIntents).toHaveBeenCalledWith(0, {
            enabled: false,
        })
    })
})
