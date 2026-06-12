import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockUpdateSegmentHandler,
    mockUpdateSegmentResponse,
} from '@gorgias/customer-segmentation-mocks'

import { aiJourneyKeys } from 'AIJourney/queries/utils'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateSegment } from './useUpdateSegment'

const server = setupServer()
let queryClient = mockQueryClient()

const updateSegmentRequest = {
    name: 'Updated Segment',
    conditions:
        '{"field":"email","operator":"contains","value":"@example.com"}',
}

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

describe('useUpdateSegment', () => {
    it('should call updateSegment with the correct segmentId and request body', async () => {
        const response = mockUpdateSegmentResponse({
            id: 'seg-123',
            ...updateSegmentRequest,
        })
        const updateSegmentMock = mockUpdateSegmentHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForUpdateSegmentRequest =
            updateSegmentMock.waitForRequest(server)
        server.use(updateSegmentMock.handler)

        const { result } = renderHook(() => useUpdateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    segmentId: 'seg-123',
                    updateSegmentRequest,
                }),
            ).resolves.toEqual(response)
        })

        await waitForUpdateSegmentRequest(async (request) => {
            expect(new URL(request.url).pathname).toContain('seg-123')
            expect(await request.json()).toEqual(updateSegmentRequest)
        })
    })

    it('should invalidate segments queries and show a success toast on success', async () => {
        server.use(mockUpdateSegmentHandler().handler)
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useUpdateSegment(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await result.current.mutateAsync({
                segmentId: 'seg-456',
                updateSegmentRequest,
            })
        })

        await waitFor(() =>
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: aiJourneyKeys.segmentsAll(),
            }),
        )
        expect(
            await screen.findByRole('status', {
                name: 'Segment updated successfully',
            }),
        ).toHaveAttribute('data-intent', 'success')
    })

    it('should set error state and show error toast when updateSegment fails', async () => {
        server.use(
            mockUpdateSegmentHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to update segment' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

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

        expect(result.current.error).toBeDefined()
        expect(
            await screen.findByRole('status', {
                name: 'Error updating segment',
            }),
        ).toHaveAttribute('data-intent', 'destructive')
    })
})
