import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { listIntegrations } from '@gorgias/helpdesk-client'
import type {
    HttpResponse,
    Integration,
    ListIntegrations200,
} from '@gorgias/helpdesk-client'

import { renderHook } from 'utils/testing/renderHook'

import useAllIntegrations from '../useAllIntegrations'

jest.mock('@gorgias/helpdesk-client', () => ({
    listIntegrations: jest.fn(),
}))

const mockListIntegrations = listIntegrations as jest.MockedFunction<
    typeof listIntegrations
>

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const createMockResponse = (
    data: Integration[],
    nextCursor: string | null,
): HttpResponse<ListIntegrations200> => ({
    data: {
        data,
        meta: {
            next_cursor: nextCursor,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/integrations',
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
})

const mockIntegration1: Integration = {
    id: 1,
    name: 'Integration 1',
    type: 'phone',
    created_datetime: new Date().toISOString(),
    updated_datetime: new Date().toISOString(),
    meta: {
        phone_number: '+1234567890',
        display_name: ' 1',
        routing: {
            rules: [],
        },
    },
}

const mockIntegration2: Integration = {
    id: 2,
    name: 'Integration 2',
    type: 'phone',
    created_datetime: new Date().toISOString(),
    updated_datetime: new Date().toISOString(),
    meta: {
        phone_number: '+1111111111',
        display_name: '2',
        routing: {
            rules: [],
        },
    },
}

describe('useAllIntegrations', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return loading state initially', () => {
        const { result } = renderHook(() => useAllIntegrations(), {
            wrapper: createWrapper(),
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.integrations).toStrictEqual([])
    })

    it('should fetch and return integrations successfully', async () => {
        const mockData = createMockResponse(
            [mockIntegration1, mockIntegration2],
            null,
        )

        mockListIntegrations.mockResolvedValueOnce(mockData)

        const { result } = renderHook(() => useAllIntegrations(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.integrations).toEqual(mockData.data.data)
        expect(mockListIntegrations).toHaveBeenCalledWith({
            cursor: undefined,
            limit: 100,
        })
    })

    it('should handle pagination correctly', async () => {
        const firstPage = createMockResponse([mockIntegration1], 'next_page')
        const secondPage = createMockResponse([mockIntegration2], null)

        mockListIntegrations
            .mockResolvedValueOnce(firstPage)
            .mockResolvedValueOnce(secondPage)

        const { result } = renderHook(() => useAllIntegrations(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.integrations).toEqual([
            ...firstPage.data.data,
            ...secondPage.data.data,
        ])
        expect(mockListIntegrations).toHaveBeenCalledTimes(2)
        expect(mockListIntegrations).toHaveBeenCalledWith({
            cursor: undefined,
            limit: 100,
        })
        expect(mockListIntegrations).toHaveBeenCalledWith({
            cursor: 'next_page',
            limit: 100,
        })
    })
})
