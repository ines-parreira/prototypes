import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockDeleteSegmentHandler } from '@gorgias/customer-segmentation-mocks'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useDeleteSegment } from './useDeleteSegment'

const server = setupServer()
let queryClient = mockQueryClient()

const createWrapper = () => {
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useDeleteSegment', () => {
    it('should call deleteSegment with the correct segmentId', async () => {
        const deleteSegmentMock = mockDeleteSegmentHandler()
        const waitForDeleteSegmentRequest =
            deleteSegmentMock.waitForRequest(server)
        server.use(deleteSegmentMock.handler)

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({ segmentId: 'seg-123' })
        })

        await waitForDeleteSegmentRequest((request) => {
            expect(new URL(request.url).pathname).toContain('seg-123')
        })
    })

    it('should invalidate segments queries and show a success toast on success', async () => {
        server.use(mockDeleteSegmentHandler().handler)
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({ segmentId: 'seg-456' })
        })

        await waitFor(() =>
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: aiJourneyKeys.segmentsAll(),
            }),
        )
        expect(
            await screen.findByRole('status', {
                name: 'Segment deleted successfully',
            }),
        ).toHaveAttribute('data-intent', 'success')
    })

    it('should set error state and show error toast when deleteSegment fails', async () => {
        server.use(
            mockDeleteSegmentHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to delete segment' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useDeleteSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            result.current.mutate({ segmentId: 'seg-789' })
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error).toBeDefined()
        expect(
            await screen.findByRole('status', {
                name: 'Error deleting segment',
            }),
        ).toHaveAttribute('data-intent', 'destructive')
    })
})
