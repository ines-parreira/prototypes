import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { deleteSegment } from '@gorgias/customer-segmentation-client'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useDeleteSegment } from './useDeleteSegment'

jest.mock('@gorgias/customer-segmentation-client', () => ({
    deleteSegment: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

const mockDeleteSegment = deleteSegment as jest.Mock
const mockUseAppDispatch = jest.mocked(useAppDispatch)

describe('useDeleteSegment', () => {
    let queryClient: QueryClient
    const mockDispatch = jest.fn()
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
        mockUseAppDispatch.mockReturnValue(mockDispatch)
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
            queryKey: aiJourneyKeys.segments(),
        })
    })

    it('should dispatch success notification on success', async () => {
        mockDeleteSegment.mockResolvedValue({ data: undefined })

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({ segmentId: 'seg-123' })
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                message: 'Segment deleted successfully',
                status: NotificationStatus.Success,
            }),
        )
    })

    it('should set error state and dispatch error notification when deleteSegment fails', async () => {
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
        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                message: 'Error deleting segment',
                status: NotificationStatus.Error,
            }),
        )
        consoleErrorSpy.mockRestore()
    })
})
