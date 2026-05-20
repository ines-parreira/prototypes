import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { getBillingStateQuery, useExtendTrial } from 'models/billing/queries'
import { useExtendTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useExtendTrialWithSideEffects'

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
const useExtendTrialMock = assumeMock(useExtendTrial)

describe('useExtendTrialWithSideEffects', () => {
    afterEach(() => {
        toast.dismiss()
    })

    it('should show success toast on success and invalidate billing state query', async () => {
        renderHook(() => useExtendTrialWithSideEffects())

        act(() => {
            useExtendTrialMock.mock.calls[0][0]?.onSuccess!(
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
                    name: 'Free trial has been successfully extended.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show error toast on failure and NOT invalidate billing state query', async () => {
        renderHook(() => useExtendTrialWithSideEffects())

        const myError = {}
        act(() => {
            useExtendTrialMock.mock.calls[0][0]?.onError!(
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
