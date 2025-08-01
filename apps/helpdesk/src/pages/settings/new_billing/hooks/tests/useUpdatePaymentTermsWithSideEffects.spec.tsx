import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, useQueryClient } from '@tanstack/react-query'

import { useUpdatePaymentTerms } from '@gorgias/helpdesk-queries'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

import { useUpdatePaymentTermsWithSideEffects } from '../useUpdatePaymentTermsWithSideEffects'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

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
    it('should dispatch success notification on success', () => {
        renderHook(() => useUpdatePaymentTermsWithSideEffects())

        useUpdatePaymentTermsMock.mock.calls[0][0]?.mutation?.onSuccess!(
            axiosSuccessResponse(undefined) as any,
            { data: { payment_terms: 45 } },
            undefined,
        )

        expect(useQueryClientMock().invalidateQueries).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledTimes(1)

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'The payment terms have been successfully updated.',
            status: NotificationStatus.Success,
            style: NotificationStyle.Alert,
            showDismissButton: true,
            noAutoDismiss: false,
            allowHTML: true,
        })
    })

    it('should dispatch error notification on failure', () => {
        renderHook(() => useUpdatePaymentTermsWithSideEffects())

        const myError = {}
        useUpdatePaymentTermsMock.mock.calls[0][0]?.mutation?.onError!(
            myError,
            { data: { payment_terms: 1 } },
            undefined,
        )

        expect(useQueryClientMock().invalidateQueries).not.toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalledTimes(1)

        expect(notify).toHaveBeenNthCalledWith(1, {
            message:
                'Could not update payment terms: Oops something went wrong',
            status: NotificationStatus.Error,
            style: NotificationStyle.Alert,
            showDismissButton: true,
            noAutoDismiss: false,
            allowHTML: true,
        })
    })
})
