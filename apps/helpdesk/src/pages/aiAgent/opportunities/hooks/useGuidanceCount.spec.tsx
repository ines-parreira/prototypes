import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { Paths } from 'rest_api/help_center_api/client.generated'

import { useGuidanceCount } from './useGuidanceCount'

jest.mock('models/helpCenter/queries')

const mockUseGetHelpCenterArticleList =
    useGetHelpCenterArticleList as jest.MockedFunction<
        typeof useGetHelpCenterArticleList
    >

const createMockArticleListResponse = (itemCount: number) => ({
    data: [],
    meta: {
        item_count: itemCount,
        total_count: itemCount,
        page: 1,
        per_page: 1,
    },
})

describe('useGuidanceCount', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should return guidance count and loading state', () => {
        const mockData = createMockArticleListResponse(42)
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockData,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: true,
            status: 'success',
        } as any)

        const { result } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 123 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(42)
        expect(result.current.isLoading).toBe(false)
    })

    it('should call useGetHelpCenterArticleList with correct parameters', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: false,
            status: 'loading',
        } as any)

        const helpCenterId = 456

        renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: helpCenterId }),
            { wrapper },
        )

        const expectedQueryParams: Paths.ListArticles.QueryParameters = {
            version_status: 'latest_draft',
            per_page: 1,
        }

        expect(mockUseGetHelpCenterArticleList).toHaveBeenCalledWith(
            helpCenterId,
            expectedQueryParams,
            {
                refetchOnWindowFocus: false,
                staleTime: 10 * 60 * 1000,
            },
        )
    })

    it('should return 0 when data is undefined', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: true,
            status: 'success',
        } as any)

        const { result } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 789 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return 0 when meta.item_count is undefined', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [],
                meta: {} as any,
            },
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: true,
            status: 'success',
        } as any)

        const { result } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 111 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle loading state correctly', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: true,
            isSuccess: false,
            status: 'loading',
        } as any)

        const { result } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 222 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })

    it('should handle error state gracefully', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error('Failed to fetch'),
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: false,
            status: 'error',
        } as any)

        const { result } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 333 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle large item counts', () => {
        const mockData = createMockArticleListResponse(9999)
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockData,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: true,
            status: 'success',
        } as any)

        const { result } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 444 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(9999)
        expect(result.current.isLoading).toBe(false)
    })

    it('should update when data changes', async () => {
        const initialData = createMockArticleListResponse(5)
        const updatedData = createMockArticleListResponse(10)

        mockUseGetHelpCenterArticleList.mockReturnValueOnce({
            data: initialData,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: true,
            status: 'success',
        } as any)

        const { result, rerender } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 555 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(5)

        mockUseGetHelpCenterArticleList.mockReturnValueOnce({
            data: updatedData,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: true,
            status: 'success',
        } as any)

        rerender()

        await waitFor(() => {
            expect(result.current.guidanceCount).toBe(10)
        })
    })

    it('should set correct query options', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: false,
            status: 'loading',
        } as any)

        renderHook(() => useGuidanceCount({ guidanceHelpCenterId: 666 }), {
            wrapper,
        })

        const lastCallArgs = mockUseGetHelpCenterArticleList.mock.calls[0]
        const queryOptions = lastCallArgs[2]

        expect(queryOptions).toEqual({
            refetchOnWindowFocus: false,
            staleTime: 600000,
        })
    })

    it('should handle zero item count', () => {
        const mockData = createMockArticleListResponse(0)
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: mockData,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: true,
            status: 'success',
        } as any)

        const { result } = renderHook(
            () => useGuidanceCount({ guidanceHelpCenterId: 777 }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should use per_page of 1 for efficiency', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: false,
            status: 'loading',
        } as any)

        renderHook(() => useGuidanceCount({ guidanceHelpCenterId: 888 }), {
            wrapper,
        })

        const queryParams = mockUseGetHelpCenterArticleList.mock.calls[0][1]
        expect(queryParams.per_page).toBe(1)
    })

    it('should only request latest_draft version status', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isRefetching: false,
            isFetching: false,
            isSuccess: false,
            status: 'loading',
        } as any)

        renderHook(() => useGuidanceCount({ guidanceHelpCenterId: 999 }), {
            wrapper,
        })

        const queryParams = mockUseGetHelpCenterArticleList.mock.calls[0][1]
        expect(queryParams.version_status).toBe('latest_draft')
    })
})
