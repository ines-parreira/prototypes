import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import useAppDispatch from 'hooks/useAppDispatch'
import { getBillingStateQuery, useExtendTrial } from 'models/billing/queries'
import { useExtendTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useExtendTrialWithSideEffects'
import { notify } from 'state/notifications/actions'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

jest.mock('state/notifications/actions')

jest.mock('@tanstack/react-query')
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
    it('should dispatch success notification on success and NOT invalidate billing state query', () => {
        renderHook(() => useExtendTrialWithSideEffects())

        useExtendTrialMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(undefined),
            [],
            undefined,
        )

        expect(useQueryClient().invalidateQueries).toHaveBeenLastCalledWith(
            getBillingStateQuery,
        )

        expect(dispatch).toHaveBeenCalledTimes(1)

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Free trial has been successfully extended.',
            status: NotificationStatus.Success,
            style: NotificationStyle.Alert,
            showDismissButton: true,
            noAutoDismiss: false,
            allowHTML: true,
        })
    })

    it('should dispatch error notification on failure and invalidate billing state query', () => {
        renderHook(() => useExtendTrialWithSideEffects())

        const myError = {}
        useExtendTrialMock.mock.calls[0][0]?.onError!(myError, [], undefined)

        expect(useQueryClient().invalidateQueries).not.toHaveBeenCalled()

        expect(dispatch).toHaveBeenCalledTimes(1)

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: `Could not extend trial : Oops something went wrong`,
            status: NotificationStatus.Error,
            style: NotificationStyle.Alert,
            showDismissButton: true,
            noAutoDismiss: false,
            allowHTML: true,
        })
    })
})
