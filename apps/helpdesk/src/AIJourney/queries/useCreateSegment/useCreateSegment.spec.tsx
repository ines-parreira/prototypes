import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import { createSegment } from '@gorgias/customer-segmentation-client'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useCreateSegment } from './useCreateSegment'

jest.mock('@gorgias/customer-segmentation-client', () => ({
    createSegment: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

const mockCreateSegment = createSegment as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockDispatch = jest.fn()

describe('useCreateSegment', () => {
    let queryClient: QueryClient

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
            logger: { log: () => {}, warn: () => {}, error: () => {} },
        })
        return ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    it('should call createSegment with the provided params and return res.data', async () => {
        const mockData = {
            id: '1',
            name: 'My Segment',
            conditions: 'gt(shopper.lifetime_value, 100)',
            integration_id: 123,
            created_datetime: '2026-01-01T00:00:00',
            updated_datetime: '2026-01-01T00:00:00',
        }
        mockCreateSegment.mockResolvedValue({ data: mockData })

        const { result } = renderHook(() => useCreateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            const response = await result.current.mutateAsync({
                name: 'My Segment',
                conditions: 'gt(shopper.lifetime_value, 100)',
                integration_id: 123,
            })

            expect(response).toEqual(mockData)
        })

        expect(mockCreateSegment).toHaveBeenCalledTimes(1)
        expect(mockCreateSegment).toHaveBeenCalledWith({
            name: 'My Segment',
            conditions: 'gt(shopper.lifetime_value, 100)',
            integration_id: 123,
        })
    })

    it('should invalidate segments queries for the integration on success', async () => {
        mockCreateSegment.mockResolvedValue({ data: {} })

        const wrapper = createWrapper()
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useCreateSegment(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync({
                name: 'My Segment',
                conditions: '',
                integration_id: 123,
            })
        })

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ['journeys', 'segments', 123],
        })
    })

    it('should dispatch a success notification on success', async () => {
        const mockNotifyAction = { type: 'notify/success' }
        mockCreateSegment.mockResolvedValue({ data: {} })
        ;(notify as jest.Mock).mockReturnValue(mockNotifyAction)

        const { result } = renderHook(() => useCreateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({
                name: 'My Segment',
                conditions: '',
                integration_id: 123,
            })
        })

        expect(notify).toHaveBeenCalledWith({
            message: 'Segment created',
            status: NotificationStatus.Success,
        })
        expect(mockDispatch).toHaveBeenCalledWith(mockNotifyAction)
    })

    it('should dispatch an error notification on failure', async () => {
        const mockNotifyAction = { type: 'notify/error' }
        mockCreateSegment.mockRejectedValue(new Error('Network error'))
        ;(notify as jest.Mock).mockReturnValue(mockNotifyAction)

        const { result } = renderHook(() => useCreateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    name: 'My Segment',
                    conditions: '',
                    integration_id: 123,
                }),
            ).rejects.toThrow('Network error')
        })

        expect(notify).toHaveBeenCalledWith({
            message: 'Error creating segment',
            status: NotificationStatus.Error,
        })
        expect(mockDispatch).toHaveBeenCalledWith(mockNotifyAction)
    })
})
