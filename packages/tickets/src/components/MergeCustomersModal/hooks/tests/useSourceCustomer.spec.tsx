import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockCustomer, mockGetCustomerHandler } from '@gorgias/helpdesk-mocks'

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

import { useSourceCustomer } from '../useSourceCustomer'

describe('useSourceCustomer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should disable customer query when source customer is null', () => {
        const { result } = renderHook(() => useSourceCustomer(null))

        expect(result.current.sourceCustomer).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it('should return source customer fallback when full data is not loaded', () => {
        const sourceCustomer = mockCustomer({
            id: 2,
            name: 'Source Customer',
            email: 'source@example.com',
        })

        server.use(
            mockGetCustomerHandler(() => new Promise(() => undefined)).handler,
        )

        const { result } = renderHook(() => useSourceCustomer(sourceCustomer))

        expect(result.current.sourceCustomer).toEqual(sourceCustomer)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return full source customer data when query succeeds', async () => {
        const sourceCustomer = mockCustomer({
            id: 2,
            name: 'Fallback Source Customer',
            email: 'fallback@example.com',
        })

        const fullSourceCustomer = mockCustomer({
            id: 2,
            name: 'Loaded Source Customer',
            email: 'loaded@example.com',
        })

        server.use(
            mockGetCustomerHandler(async () =>
                HttpResponse.json(fullSourceCustomer),
            ).handler,
        )

        const { result } = renderHook(() => useSourceCustomer(sourceCustomer))

        await waitFor(() => {
            expect(result.current.sourceCustomer).toEqual(fullSourceCustomer)
            expect(result.current.isLoading).toBe(false)
        })
    })
})
