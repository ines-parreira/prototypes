import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Duration } from '@gorgias/toolkit'

import { mockCustomer } from '@gorgias/helpdesk-mocks'

import { server } from '../../tests/server'
import { GET_CUSTOMER_STALE_TIME_MS, useGetCustomer } from '../useGetCustomer'

let getCustomerRequest: Request | undefined

afterEach(() => {
    getCustomerRequest = undefined
})

describe('useGetCustomer', () => {
    it('uses a one hour stale time', () => {
        expect(GET_CUSTOMER_STALE_TIME_MS).toBe(Duration.hours(1))
    })

    it('preserves params and http options', async () => {
        const params = { include: ['integrations'] } as any
        const requestOptions = { headers: { 'X-Test': 'true' } } as any

        server.use(
            http.all('*', ({ request }) => {
                const url = new URL(request.url)

                if (
                    request.method !== 'GET' ||
                    !/^\/api\/customers\/\d+$/.test(url.pathname)
                ) {
                    return
                }

                getCustomerRequest = request

                return HttpResponse.json(mockCustomer({ id: 2 }))
            }),
        )

        renderHook(() =>
            useGetCustomer(2, params, {
                http: requestOptions,
                query: {
                    retry: false,
                },
            }),
        )

        await waitFor(() => {
            expect(getCustomerRequest).toBeDefined()
        })

        const url = new URL(getCustomerRequest!.url)

        expect(url.searchParams.get('include')).toBe('integrations')
        expect(getCustomerRequest!.headers.get('X-Test')).toBe('true')
    })
})
