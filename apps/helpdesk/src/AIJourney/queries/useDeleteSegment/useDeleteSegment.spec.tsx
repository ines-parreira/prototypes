import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { deleteSegment } from '@gorgias/customer-segmentation-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'

import { useDeleteSegment } from './useDeleteSegment'

jest.mock('@gorgias/customer-segmentation-client', () => ({
    deleteSegment: jest.fn(),
}))

const mockDeleteSegment = deleteSegment as jest.Mock

describe('useDeleteSegment', () => {
    let queryClient: QueryClient
    const mockStore = configureMockStore([thunk])()

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                mutations: {
                    retry: false,
                },
            },
        })

        return ({ children }: { children?: React.ReactNode }) => (
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call deleteSegment with the correct segmentId', async () => {
        mockDeleteSegment.mockResolvedValue({ data: undefined })

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({ segmentId: 'seg-123' })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockDeleteSegment).toHaveBeenCalledTimes(1)
        expect(mockDeleteSegment).toHaveBeenCalledWith('seg-123')
    })

    it('should return the response data on success', async () => {
        const responseData = { id: 'seg-123' }
        mockDeleteSegment.mockResolvedValue({ data: responseData })

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({ segmentId: 'seg-123' })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(responseData)
    })

    it('should invalidate segments queries on success', async () => {
        mockDeleteSegment.mockResolvedValue({ data: undefined })

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        await act(async () => {
            result.current.mutate({ segmentId: 'seg-456' })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: aiJourneyKeys.segmentsAll(),
        })
    })

    it('should show a success toast on success', async () => {
        mockDeleteSegment.mockResolvedValue({ data: undefined })

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({ segmentId: 'seg-123' })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        const toastEl = await screen.findByRole('status', {
            name: 'Segment deleted successfully',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should set error state and show error toast when deleteSegment fails', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation()
        const mockError = new Error('Failed to delete segment')
        mockDeleteSegment.mockRejectedValue(mockError)

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({ segmentId: 'seg-789' })
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual(mockError)
        const toastEl = await screen.findByRole('status', {
            name: 'Error deleting segment',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        consoleErrorSpy.mockRestore()
    })
})
