import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import createBillingErrorNotification from '../../utils/createBillingErrorNotification'
import useDispatchBillingError from '../useDispatchBillingError'

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('../../utils/createBillingErrorNotification')

const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockNotify = assumeMock(notify)
const mockCreateBillingErrorNotification = assumeMock(
    createBillingErrorNotification,
)

describe('useDispatchBillingError', () => {
    const mockDispatch = jest.fn()
    const mockContactBilling = jest.fn()
    const mockNotification = {
        message: 'Test error message',
        buttons: [],
        noAutoDismiss: true,
        showDismissButton: true,
        status: NotificationStatus.Error,
        id: 'billing-error-notification',
    }
    const mockNotifyThunk = jest.fn().mockResolvedValue(undefined)

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockCreateBillingErrorNotification.mockReturnValue(mockNotification)
        mockNotify.mockReturnValue(mockNotifyThunk)
    })

    it('should call createBillingErrorNotification with error and contactBilling function when dispatching error', () => {
        const { result } = renderHook(() =>
            useDispatchBillingError(mockContactBilling),
        )
        const error = new Error('Test error')

        act(() => {
            result.current(error)
        })

        expect(mockCreateBillingErrorNotification).toHaveBeenCalledWith(
            error,
            mockContactBilling,
        )
        expect(mockCreateBillingErrorNotification).toHaveBeenCalledTimes(1)
    })

    it('should dispatch notify action with the created notification', () => {
        const { result } = renderHook(() =>
            useDispatchBillingError(mockContactBilling),
        )
        const error = new Error('Test error')

        act(() => {
            result.current(error)
        })

        expect(mockNotify).toHaveBeenCalledWith(mockNotification)
        expect(mockDispatch).toHaveBeenCalledWith(mockNotifyThunk)
        expect(mockDispatch).toHaveBeenCalledTimes(1)
    })
})
