import {renderHook} from '@testing-library/react-hooks'
import {dismissNotification} from 'reapop'

import {AlertBannerTypes} from 'AlertBanners'
import {isRecoverableError} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {VoiceDeviceActions} from 'pages/integrations/integration/components/voice/types'
import {notify} from 'state/notifications/actions'
import {
    BannerNotification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import {State} from 'state/twilio/voiceDevice'
import {assumeMock} from 'utils/testing'

import {useErrorHandling} from '../useErrorHandling'

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('hooks/integrations/phone/utils')

const useAppDispatchMock = assumeMock(useAppDispatch)
const notifyMock = assumeMock(notify)
const isRecoverableErrorMock = assumeMock(isRecoverableError)

describe('useErrorHandling', () => {
    const dispatchMock = jest.fn()
    const errorMock = new Error('Test error')
    const warningMock = 'Test warning'
    const actionsMock = {
        setWarning: jest.fn(),
    } as unknown as VoiceDeviceActions
    let stateMock: State

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        stateMock = {
            error: errorMock,
            warning: warningMock,
        } as State
    })

    it('should dispatch an error notification when there is an unrecoverable error', () => {
        isRecoverableErrorMock.mockReturnValue(false)

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(notifyMock).toHaveBeenCalledWith(
            expect.objectContaining({
                style: NotificationStyle.Banner,
                type: AlertBannerTypes.Critical,
                id: 'phone-error-banner',
            })
        )
    })

    it('should dismiss the error notification when there is no error', () => {
        stateMock.error = null

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(dispatchMock).toHaveBeenCalledWith(
            dismissNotification('phone-error-banner')
        )
        expect(notifyMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: NotificationStatus.Error,
                id: 'phone-error-banner',
            })
        )
    })

    it('should dismiss the error notification when the error is recoverable', () => {
        stateMock.warning = null
        isRecoverableErrorMock.mockReturnValue(true)

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(dispatchMock).toHaveBeenCalledWith(
            dismissNotification('phone-error-banner')
        )
        expect(notifyMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: NotificationStatus.Error,
                id: 'phone-error-banner',
            })
        )
    })

    it('should dispatch a warning notification when there is a warning', () => {
        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(notifyMock).toHaveBeenCalledWith(
            expect.objectContaining({
                type: AlertBannerTypes.Warning,
                style: NotificationStyle.Banner,
                id: 'phone-warning-banner',
            })
        )
    })

    it('should dismiss the warning notification when there is no warning', () => {
        stateMock.warning = null

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(dispatchMock).toHaveBeenCalledWith(
            dismissNotification('phone-warning-banner')
        )
    })

    it('should call setWarning when the warning notification is clicked', () => {
        stateMock.error = null

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        const onClose = (notifyMock.mock.calls?.[0]?.[0] as BannerNotification)
            .onClose
        onClose?.()

        expect(actionsMock.setWarning).toHaveBeenCalledTimes(1)
        expect(actionsMock.setWarning).toHaveBeenCalledWith(null)
    })
})
