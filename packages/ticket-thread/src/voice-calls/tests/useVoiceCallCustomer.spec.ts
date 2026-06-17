import type { ReactNode } from 'react'

import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockCustomer, mockGetCustomerHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { customerGetQueryOptions } from '#shared/hooks/customerQueryOptions'
import { renderHook } from '#tests/render.utils'
import { server } from '#tests/server'
import { useVoiceCallCustomer } from '#voice-calls/hooks/useVoiceCallCustomer'

const testCustomer = mockCustomer({ id: 10, name: 'Jane Doe' })

beforeEach(() => {
    server.use(
        mockGetCustomerHandler(async () => HttpResponse.json(testCustomer))
            .handler,
    )
})

describe('useVoiceCallCustomer', () => {
    it('returns customer data after loading', async () => {
        const { result } = renderHook(() => useVoiceCallCustomer(10))
        await waitFor(() => {
            expect(result.current.customer).toBeDefined()
        })
        expect(result.current.customer?.name).toBe('Jane Doe')
    })

    it('isLoading is true before data resolves', () => {
        const { result } = renderHook(() => useVoiceCallCustomer(10))
        expect(result.current.isLoading).toBe(true)
    })

    it('uses ticket-thread customer GET cache settings', async () => {
        let queryClient: QueryClient | undefined

        const QueryClientCaptor = ({ children }: { children: ReactNode }) => {
            queryClient = useQueryClient()
            return children
        }

        const { result } = renderHook(() => useVoiceCallCustomer(10), {
            wrapper: QueryClientCaptor,
        })

        await waitFor(() => {
            expect(result.current.customer).toBeDefined()
        })

        const query = queryClient
            ?.getQueryCache()
            .find(queryKeys.customers.getCustomer(10))

        expect(query?.options).toMatchObject(customerGetQueryOptions)
    })
})
