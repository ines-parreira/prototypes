import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'
import { useUpdatePaymentTerms } from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'

import { useUpdatePaymentTermsWithSideEffects } from '../useUpdatePaymentTermsWithSideEffects'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('@gorgias/helpdesk-queries')
const useUpdatePaymentTermsMock = assumeMock(useUpdatePaymentTerms)

describe('useUpdatePaymentTermsWithSideEffects', () => {
    const invalidateQueriesMock = jest.fn()
    beforeEach(() => {
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should show success toast on success', async () => {
        renderHook(() => useUpdatePaymentTermsWithSideEffects())

        act(() => {
            useUpdatePaymentTermsMock.mock.calls[0][0]?.mutation?.onSuccess!(
                axiosSuccessResponse(undefined) as any,
                { data: { payment_terms: 45 } },
                undefined,
            )
        })

        expect(useQueryClientMock().invalidateQueries).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'The payment terms have been successfully updated.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast on failure', async () => {
        renderHook(() => useUpdatePaymentTermsWithSideEffects())

        const myError = {}
        act(() => {
            useUpdatePaymentTermsMock.mock.calls[0][0]?.mutation?.onError!(
                myError,
                { data: { payment_terms: 1 } },
                undefined,
            )
        })

        expect(useQueryClientMock().invalidateQueries).not.toHaveBeenCalled()

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Could not update payment terms: Oops something went wrong',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
