import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'

import { deleteJourney } from '@gorgias/convert-client'

import { useDeleteJourney } from './useDeleteJourney'

jest.mock('@gorgias/convert-client', () => ({
    deleteJourney: jest.fn(),
}))

const mockDeleteJourney = deleteJourney as jest.Mock

describe('useDeleteJourney', () => {
    let queryClient: QueryClient

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    it('should successfully delete a journey', async () => {
        const mockResponse = { success: true }
        mockDeleteJourney.mockResolvedValue({ data: mockResponse })

        const { result } = renderHook(() => useDeleteJourney(), { wrapper })

        await act(async () => {
            const response = await result.current.mutateAsync({
                id: 'journey-123',
            })

            expect(response).toEqual(mockResponse)
            expect(mockDeleteJourney).toHaveBeenCalledTimes(1)
            expect(mockDeleteJourney).toHaveBeenCalledWith('journey-123', {
                baseURL: expect.any(String),
            })
        })
    })

    it('should handle errors when deleting a journey', async () => {
        const mockError = new Error('Failed to delete journey')
        mockDeleteJourney.mockRejectedValue(mockError)

        const { result } = renderHook(() => useDeleteJourney(), { wrapper })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    id: 'journey-456',
                }),
            ).rejects.toThrow('Failed to delete journey')

            expect(mockDeleteJourney).toHaveBeenCalledTimes(1)
            expect(mockDeleteJourney).toHaveBeenCalledWith('journey-456', {
                baseURL: expect.any(String),
            })
        })
    })

    it('should invalidate queries on successful deletion', async () => {
        const mockResponse = { success: true }
        mockDeleteJourney.mockResolvedValue({ data: mockResponse })

        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useDeleteJourney(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync({
                id: 'journey-999',
            })
        })

        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1)
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: expect.arrayContaining(['journeys']),
            })
        })
    })
})
