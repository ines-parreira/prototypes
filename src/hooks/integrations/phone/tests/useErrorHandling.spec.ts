import {renderHook} from '@testing-library/react-hooks'
import {dismissNotification} from 'reapop'

import {isRecoverableError} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {VoiceDeviceActions} from 'pages/integrations/integration/components/voice/types'
import {VoiceDeviceContextState} from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {assumeMock} from 'utils/testing'

import {useErrorHandling} from '../useErrorHandling'
import useVoiceDevice from '../useVoiceDevice'

jest.mock('hooks/useAppDispatch')
jest.mock('../useVoiceDevice')
jest.mock('state/notifications/actions')
jest.mock('hooks/integrations/phone/utils')

const useAppDispatchMock = assumeMock(useAppDispatch)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)
const notifyMock = assumeMock(notify)
const isRecoverableErrorMock = assumeMock(isRecoverableError)

describe('useErrorHandling', () => {
    const dispatchMock = jest.fn()
    const errorMock = new Error('Test error')
    const warningMock = 'Test warning'
    const actionsMock = {
        setWarning: jest.fn(),
    } as unknown as VoiceDeviceActions

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should dispatch an error notification when there is an unrecoverable error', () => {
        useVoiceDeviceMock.mockReturnValue({
            error: errorMock,
            warning: null,
            actions: actionsMock,
        } as VoiceDeviceContextState)
        isRecoverableErrorMock.mockReturnValue(false)

        renderHook(() => useErrorHandling())

        expect(notifyMock).toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Error,
                style: NotificationStyle.Banner,
                showIcon: true,
                dismissible: false,
                allowHTML: true,
                id: 'phone-error-banner',
            })
        )
    })

    it('should dismiss the error notification when there is no error', () => {
        useVoiceDeviceMock.mockReturnValue({
            error: null,
            warning: warningMock,
            actions: actionsMock,
        } as any)

        renderHook(() => useErrorHandling())

        expect(dispatchMock).toHaveBeenCalledWith(
            dismissNotification('phone-error-banner')
        )
        expect(notifyMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Error,
                id: 'phone-error-banner',
            })
        )
    })

    it('should dismiss the error notification when the error is recoverable', () => {
        useVoiceDeviceMock.mockReturnValue({
            error: errorMock,
            warning: warningMock,
            actions: actionsMock,
        } as VoiceDeviceContextState)
        isRecoverableErrorMock.mockReturnValue(true)

        renderHook(() => useErrorHandling())

        expect(dispatchMock).toHaveBeenCalledWith(
            dismissNotification('phone-error-banner')
        )
        expect(notifyMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Error,
                id: 'phone-error-banner',
            })
        )
    })

    it('should dispatch a warning notification when there is a warning', () => {
        useVoiceDeviceMock.mockReturnValue({
            error: errorMock,
            warning: warningMock,
            actions: actionsMock,
        } as VoiceDeviceContextState)

        renderHook(() => useErrorHandling())

        expect(notifyMock).toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Warning,
                style: NotificationStyle.Banner,
                id: 'phone-warning-banner',
            })
        )
    })

    it('should dismiss the warning notification when there is no warning', () => {
        useVoiceDeviceMock.mockReturnValue({
            error: errorMock,
            warning: null,
            actions: actionsMock,
        } as any)

        renderHook(() => useErrorHandling())

        expect(dispatchMock).toHaveBeenCalledWith(
            dismissNotification('phone-warning-banner')
        )
    })

    it('should call setWarning when the warning notification is clicked', () => {
        useVoiceDeviceMock.mockReturnValue({
            error: null,
            warning: warningMock,
            actions: actionsMock,
        } as any)

        renderHook(() => useErrorHandling())

        const onClick = notifyMock.mock.calls?.[0]?.[0]?.onClick
        onClick?.()

        expect(actionsMock.setWarning).toHaveBeenCalledTimes(1)
        expect(actionsMock.setWarning).toHaveBeenCalledWith(null)
    })
})
