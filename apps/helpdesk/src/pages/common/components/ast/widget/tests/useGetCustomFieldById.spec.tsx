import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'

import { useGetCustomFieldById } from '../useGetCustomFieldById'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const mockUseCustomFieldDefinitions = assumeMock(useCustomFieldDefinitions)

describe('useGetCustomFieldById', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const renderHookWithProvider = (customFieldId?: number | string | null) => {
        return renderHook(() => useGetCustomFieldById(customFieldId), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })
    }

    const mockCustomField = {
        id: 123,
        name: 'Test Custom Field',
        field_type: 'text',
        deactivated_datetime: null,
    }

    const mockDeactivatedCustomField = {
        id: 456,
        name: 'Deactivated Field',
        field_type: 'dropdown',
        deactivated_datetime: '2023-01-01T00:00:00Z',
    }

    it('should return null when customFieldId is undefined', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: undefined,
            isLoading: false,
            isFetched: false,
        } as any)

        const { result } = renderHookWithProvider()

        expect(result.current).toBeNull()
    })

    it('should call useCustomFieldDefinitions with enabled: true when customFieldId is provided', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([mockCustomField]),
            isLoading: false,
            isFetched: true,
        } as any)

        renderHookWithProvider(123)

        expect(mockUseCustomFieldDefinitions).toHaveBeenCalledWith(
            {
                archived: false,
                object_type: 'Ticket',
            },
            {
                query: {
                    enabled: true,
                },
            },
        )
    })

    it('should return the custom field when found by numeric ID', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([mockCustomField]),
            isLoading: false,
            isFetched: true,
        } as any)

        const { result } = renderHookWithProvider(123)

        expect(result.current).toEqual(mockCustomField)
    })

    it('should return the custom field when found by string ID', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([mockCustomField]),
            isLoading: false,
            isFetched: true,
        } as any)

        const { result } = renderHookWithProvider('123')

        expect(result.current).toEqual(mockCustomField)
    })

    it('should filter out deactivated custom fields', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([
                mockCustomField,
                mockDeactivatedCustomField,
            ]),
            isLoading: false,
            isFetched: true,
        } as any)

        const { result } = renderHookWithProvider(456)

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when custom field is not found', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([mockCustomField]),
            isLoading: false,
            isFetched: true,
        } as any)

        const { result } = renderHookWithProvider(999)

        expect(result.current).toBeUndefined()
    })

    it('should handle empty data array', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: apiListCursorPaginationResponse([]),
            isLoading: false,
            isFetched: true,
        } as any)

        const { result } = renderHookWithProvider(123)

        expect(result.current).toBeUndefined()
    })
})
