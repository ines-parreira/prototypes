import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    getBillingStateQuery,
    useReactivateTrial,
} from 'models/billing/queries'
import { useReactivateTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useReactivateTrialWithSideEffects'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))
const useQueryClientMock = assumeMock(useQueryClient)
const invalidateQueriesMock = jest.fn()
useQueryClientMock.mockImplementation(
    () =>
        ({
            invalidateQueries: invalidateQueriesMock,
        }) as unknown as QueryClient,
)

jest.mock('models/billing/queries')
const useReactivateTrialMock = assumeMock(useReactivateTrial)

describe('useReactivateTrialWithSideEffects', () => {
    afterEach(() => {
        toast.dismiss()
    })

    it('should show success toast on success and invalidate billing state query', async () => {
        renderHook(() => useReactivateTrialWithSideEffects())

        act(() => {
            useReactivateTrialMock.mock.calls[0][0]?.onSuccess!(
                axiosSuccessResponse(undefined),
                [],
                undefined,
            )
        })

        expect(useQueryClient().invalidateQueries).toHaveBeenLastCalledWith(
            getBillingStateQuery,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Free trial has been successfully reactivated.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast on failure and NOT invalidate billing state query', async () => {
        renderHook(() => useReactivateTrialWithSideEffects())

        const myError = {}
        act(() => {
            useReactivateTrialMock.mock.calls[0][0]?.onError!(
                myError,
                [],
                undefined,
            )
        })

        expect(useQueryClient().invalidateQueries).not.toHaveBeenCalled()

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Could not extend trial : Oops something went wrong',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
