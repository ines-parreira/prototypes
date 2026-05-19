import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { updateSegment } from '@gorgias/customer-segmentation-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'

import { useUpdateSegment } from './useUpdateSegment'

jest.mock('@gorgias/customer-segmentation-client', () => ({
    updateSegment: jest.fn(),
}))

const mockUpdateSegment = updateSegment as jest.Mock

const updateSegmentRequest = {
    name: 'Updated Segment',
    conditions:
        '{"field":"email","operator":"contains","value":"@example.com"}',
}

describe('useUpdateSegment', () => {
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

    it('should call updateSegment with the correct segmentId and request body', async () => {
        mockUpdateSegment.mockResolvedValue({ data: undefined })

        const { result } = renderHook(() => useUpdateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({
                segmentId: 'seg-123',
                updateSegmentRequest,
            })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockUpdateSegment).toHaveBeenCalledTimes(1)
        expect(mockUpdateSegment).toHaveBeenCalledWith(
            'seg-123',
            updateSegmentRequest,
        )
    })

    it('should return the response data on success', async () => {
        const responseData = { id: 'seg-123', ...updateSegmentRequest }
        mockUpdateSegment.mockResolvedValue({ data: responseData })

        const { result } = renderHook(() => useUpdateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({
                segmentId: 'seg-123',
                updateSegmentRequest,
            })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(responseData)
    })

    it('should invalidate segments queries on success', async () => {
        mockUpdateSegment.mockResolvedValue({ data: undefined })

        const { result } = renderHook(() => useUpdateSegment(), {
            wrapper: createWrapper(),
        })

        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        await act(async () => {
            result.current.mutate({
                segmentId: 'seg-456',
                updateSegmentRequest,
            })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: aiJourneyKeys.segmentsAll(),
        })
    })

    it('should show a success toast on success', async () => {
        mockUpdateSegment.mockResolvedValue({ data: undefined })

        const { result } = renderHook(() => useUpdateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({
                segmentId: 'seg-123',
                updateSegmentRequest,
            })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        const toastEl = await screen.findByRole('status', {
            name: 'Segment updated successfully',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should set error state and show error toast when updateSegment fails', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation()
        const mockError = new Error('Failed to update segment')
        mockUpdateSegment.mockRejectedValue(mockError)

        const { result } = renderHook(() => useUpdateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({
                segmentId: 'seg-789',
                updateSegmentRequest,
            })
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual(mockError)
        const toastEl = await screen.findByRole('status', {
            name: 'Error updating segment',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        consoleErrorSpy.mockRestore()
    })
})
