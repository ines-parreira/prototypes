import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockCustomer, mockGetCustomerHandler } from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useVoiceCallCustomer } from '../hooks/useVoiceCallCustomer'

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
})
