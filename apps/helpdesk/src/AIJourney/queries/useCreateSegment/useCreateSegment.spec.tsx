import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateSegmentHandler,
    mockCreateSegmentResponse,
} from '@gorgias/customer-segmentation-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useCreateSegment } from './useCreateSegment'

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

describe('useCreateSegment', () => {
    it('should call createSegment with the provided params and return res.data', async () => {
        const response = mockCreateSegmentResponse({
            id: '1',
            name: 'My Segment',
            conditions: 'gt(shopper.lifetime_value, 100)',
            integration_id: 123,
        })
        const createSegmentMock = mockCreateSegmentHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForCreateSegmentRequest =
            createSegmentMock.waitForRequest(server)
        server.use(createSegmentMock.handler)

        const { result } = renderHook(() => useCreateSegment(), {
            wrapper: createWrapper(),
        })

        const requestBody = {
            name: 'My Segment',
            conditions: 'gt(shopper.lifetime_value, 100)',
            integration_id: 123,
        }

        await act(async () => {
            await expect(
                result.current.mutateAsync(requestBody),
            ).resolves.toEqual(response)
        })

        await waitForCreateSegmentRequest(async (request) => {
            expect(await request.json()).toEqual(requestBody)
        })
    })

    it('should invalidate segments queries and show a success toast on success', async () => {
        server.use(mockCreateSegmentHandler().handler)
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

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

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ['journeys', 'segments', 123],
        })
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: ['audience-segments', 123],
        })
        expect(
            await screen.findByRole('status', { name: 'Segment created' }),
        ).toHaveAttribute('data-intent', 'success')
    })

    it('should show an error toast on failure', async () => {
        server.use(
            mockCreateSegmentHandler(async () =>
                HttpResponse.json({ error: 'Network error' } as never, {
                    status: 500,
                }),
            ).handler,
        )

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
            ).rejects.toBeDefined()
        })

        expect(
            await screen.findByRole('status', {
                name: 'Error creating segment',
            }),
        ).toHaveAttribute('data-intent', 'destructive')
    })
})
