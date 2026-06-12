import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockMergeCustomersHandler,
    mockMergeCustomersResponse,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { useMergeCustomers } from '../useMergeCustomers'

describe('useMergeCustomers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should merge customers and update cache on success', async () => {
        const mergeCustomersMock = mockMergeCustomersHandler(async () =>
            HttpResponse.json(mockMergeCustomersResponse()),
        )
        const waitForMergeCustomersRequest =
            mergeCustomersMock.waitForRequest(server)
        server.use(mergeCustomersMock.handler)

        const { result } = renderHook(() => useMergeCustomers(123))

        const data = {
            name: 'Merged Name',
            email: 'merged@example.com',
            channels: [],
            note: 'Merged note',
            meta: {},
        }

        const params = {
            source_id: 2,
            target_id: 1,
        }

        await result.current.mergeCustomers(data as any, params as any)

        await waitForMergeCustomersRequest(async (request) => {
            const url = new URL(request.url)

            expect(url.searchParams.get('source_id')).toBe('2')
            expect(url.searchParams.get('target_id')).toBe('1')
            expect(await request.json()).toEqual(data)
        })
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Customers successfully merged.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast and rethrow when merge fails', async () => {
        server.use(
            mockMergeCustomersHandler(async () =>
                HttpResponse.json({ error: { msg: 'merge failed' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useMergeCustomers(123))

        await expect(
            result.current.mergeCustomers(
                {} as any,
                {
                    source_id: 2,
                    target_id: 1,
                } as any,
            ),
        ).rejects.toBeTruthy()

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Could not merge customers',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
