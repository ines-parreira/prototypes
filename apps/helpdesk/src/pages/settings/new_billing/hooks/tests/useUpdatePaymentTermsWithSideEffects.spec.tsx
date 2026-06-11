import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import { mockUpdatePaymentTermsHandler } from '@gorgias/helpdesk-mocks'

import { useUpdatePaymentTermsWithSideEffects } from '../useUpdatePaymentTermsWithSideEffects'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))
const useQueryClientMock = assumeMock(useQueryClient)

const updatePaymentTermsHandler = mockUpdatePaymentTermsHandler()
const server = setupServer(updatePaymentTermsHandler.handler)

describe('useUpdatePaymentTermsWithSideEffects', () => {
    const invalidateQueriesMock = jest.fn()
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    afterEach(() => {
        toast.dismiss()
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should show success toast on success', async () => {
        const { result } = renderHook(() =>
            useUpdatePaymentTermsWithSideEffects(),
        )

        result.current.mutate({ data: { payment_terms: 45 } })

        await waitFor(() => {
            expect(
                useQueryClientMock().invalidateQueries,
            ).toHaveBeenCalledTimes(1)
            expect(
                screen.getByRole('status', {
                    name: 'The payment terms have been successfully updated.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast on failure', async () => {
        server.use(
            mockUpdatePaymentTermsHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useUpdatePaymentTermsWithSideEffects(),
        )

        result.current.mutate({ data: { payment_terms: 1 } })

        await waitFor(() => {
            expect(
                useQueryClientMock().invalidateQueries,
            ).not.toHaveBeenCalled()
            expect(
                screen.getByRole('status', {
                    name: 'Could not update payment terms: Oops something went wrong',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
