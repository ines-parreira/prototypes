import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useFindOpportunityByIdOpportunity } from '@gorgias/knowledge-service-queries'
import type {
    FindOpportunityByIdOpportunity200,
    KnowledgeGapOpportunityDetail,
} from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import { mapOpportunityDetailToOpportunity } from '../utils/mapOpportunityDetailToOpportunity'
import { useFindOneOpportunity } from './useFindOneOpportunity'

jest.mock('@gorgias/knowledge-service-queries', () => ({
    useFindOpportunityByIdOpportunity: jest.fn(),
}))
jest.mock('../utils/mapOpportunityDetailToOpportunity', () => ({
    mapOpportunityDetailToOpportunity: jest.fn(),
}))

describe('useFindOneOpportunity', () => {
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

    const mockOpportunityDetailResponse: FindOpportunityByIdOpportunity200 = {
        id: 123,
        accountId: 456,
        opportunityType: 'FILL_KNOWLEDGE_GAP',
        shopIntegrationId: 789,
        shopName: 'Test Shop',
        createdDatetime: '2024-01-01T00:00:00Z',
        detectionCount: 5,
        detectionObjectIds: ['1', '2', '3', '4', '5'],
        knowledgeResource: {
            title: 'Test Opportunity',
            body: '<p>Test content</p>',
            locale: 'en',
            type: 'article',
            origin: null,
            version: 1,
        },
        resources: [],
    } as KnowledgeGapOpportunityDetail

    const mockMappedOpportunity = {
        id: '123',
        key: 'ks_123',
        title: 'Test Opportunity',
        content: '<p>Test content</p>',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ticketCount: 5,
        detectionObjectIds: ['1', '2', '3', '4', '5'],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should call useFindOpportunityByIdOpportunity with provided opportunityId', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })

        renderHook(() => useFindOneOpportunity(123), { wrapper })

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                    refetchOnWindowFocus: false,
                }),
            }),
        )
    })

    it('should pass 0 when opportunityId is undefined', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(() => useFindOneOpportunity(undefined), { wrapper })

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            0,
            expect.anything(),
        )
    })

    it('should default enabled to true when not provided', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })

        renderHook(() => useFindOneOpportunity(123), { wrapper })

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                }),
            }),
        )
    })

    it('should respect provided enabled option', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(
            () =>
                useFindOneOpportunity(123, {
                    query: { enabled: false },
                }),
            { wrapper },
        )

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: false,
                }),
            }),
        )
    })

    it('should default refetchOnWindowFocus to false when not provided', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })

        renderHook(() => useFindOneOpportunity(123), { wrapper })

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                query: expect.objectContaining({
                    refetchOnWindowFocus: false,
                }),
            }),
        )
    })

    it('should respect provided refetchOnWindowFocus option', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })

        renderHook(
            () =>
                useFindOneOpportunity(123, {
                    query: { refetchOnWindowFocus: true },
                }),
            { wrapper },
        )

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                query: expect.objectContaining({
                    refetchOnWindowFocus: true,
                }),
            }),
        )
    })

    it('should use select function to transform response data', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        const mockMapOpportunityDetailToOpportunity =
            mapOpportunityDetailToOpportunity as jest.Mock

        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })
        mockMapOpportunityDetailToOpportunity.mockReturnValue(
            mockMappedOpportunity,
        )

        renderHook(() => useFindOneOpportunity(123), { wrapper })

        const selectFunction =
            mockUseFindOpportunityByIdOpportunity.mock.calls[0][1].query.select

        expect(selectFunction).toBeDefined()

        const result = selectFunction({ data: mockOpportunityDetailResponse })

        expect(mockMapOpportunityDetailToOpportunity).toHaveBeenCalledWith(
            mockOpportunityDetailResponse,
        )
        expect(result).toEqual(mockMappedOpportunity)
    })

    it('should handle all options provided together', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })

        renderHook(
            () =>
                useFindOneOpportunity(456, {
                    query: {
                        enabled: false,
                        refetchOnWindowFocus: true,
                    },
                }),
            { wrapper },
        )

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            456,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: false,
                    refetchOnWindowFocus: true,
                }),
            }),
        )
    })

    it('should handle empty options object', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })

        renderHook(() => useFindOneOpportunity(123, {}), { wrapper })

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                    refetchOnWindowFocus: false,
                }),
            }),
        )
    })

    it('should handle options with empty query object', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
        })

        renderHook(() => useFindOneOpportunity(123, { query: {} }), {
            wrapper,
        })

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                    refetchOnWindowFocus: false,
                }),
            }),
        )
    })

    it('should return data from useFindOpportunityByIdOpportunity', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: mockMappedOpportunity,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useFindOneOpportunity(123), {
            wrapper,
        })

        expect(result.current.data).toEqual(mockMappedOpportunity)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return loading state from useFindOpportunityByIdOpportunity', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useFindOneOpportunity(123), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should handle error state from useFindOpportunityByIdOpportunity', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        const mockError = new Error('Failed to fetch')
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: mockError,
        })

        const { result } = renderHook(() => useFindOneOpportunity(123), {
            wrapper,
        })

        expect(result.current.isError).toBe(true)
        expect(result.current.error).toEqual(mockError)
    })

    it('should handle opportunityId 0 explicitly', () => {
        const mockUseFindOpportunityByIdOpportunity =
            useFindOpportunityByIdOpportunity as jest.Mock
        mockUseFindOpportunityByIdOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(() => useFindOneOpportunity(0), { wrapper })

        expect(mockUseFindOpportunityByIdOpportunity).toHaveBeenCalledWith(
            0,
            expect.anything(),
        )
    })
})
