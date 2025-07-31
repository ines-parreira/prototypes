import { renderHook } from '@repo/testing'

import { AlertBannerTypes, BannerCategories } from 'AlertBanners'
import { isRecoverableError } from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { VoiceDeviceActions } from 'pages/integrations/integration/components/voice/types'
import { State } from 'state/twilio/voiceDevice'
import { assumeMock } from 'utils/testing'

import { useErrorHandling } from '../useErrorHandling'

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('hooks/integrations/phone/utils')

const useAppDispatchMock = assumeMock(useAppDispatch)
const isRecoverableErrorMock = assumeMock(isRecoverableError)

const mockAddBanner = jest.fn()
const mockRemoveBanner = jest.fn()
jest.mock('AlertBanners/hooks/useBanners', () => ({
    useBanners: jest.fn(() => ({
        addBanner: mockAddBanner,
        removeBanner: mockRemoveBanner,
    })),
}))

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
    })

    it('should dismiss the warning notification when there is no warning', () => {
        stateMock = {
            error: errorMock,
            warning: null,
        } as State

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(mockRemoveBanner).toHaveBeenCalledTimes(1)
        expect(mockRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.ERROR_HANDLING,
            'phone-warning-banner',
        )
    })

    it('should dispatch an error notification when there is an unrecoverable error', () => {
        stateMock = {
            error: errorMock,
        } as State

        isRecoverableErrorMock.mockReturnValue(false)

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(mockAddBanner).toHaveBeenCalledTimes(1)
        expect(mockAddBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                message: undefined,
                type: AlertBannerTypes.Critical,
                instanceId: 'phone-error-banner',
                category: BannerCategories.ERROR_HANDLING,
                CTA: expect.objectContaining({
                    type: 'action',
                    text: 'Reload page',
                    onClick: expect.any(Function),
                }),
            }),
        )
    })

    it('should dismiss the error notification when there is no error', () => {
        stateMock = {} as State
        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(mockRemoveBanner).toHaveBeenCalled()
        expect(mockRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.ERROR_HANDLING,
            'phone-error-banner',
        )
    })

    it('should dismiss the error notification when the error is recoverable', () => {
        stateMock = {
            error: errorMock,
        } as State

        isRecoverableErrorMock.mockReturnValue(true)

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(mockRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.ERROR_HANDLING,
            'phone-error-banner',
        )
        expect(mockAddBanner).not.toHaveBeenCalled()
    })

    it('should dispatch a warning notification when there is a warning', () => {
        stateMock = {
            warning: warningMock,
        } as State
        renderHook(() => useErrorHandling(stateMock, actionsMock))

        expect(mockAddBanner).toHaveBeenCalledTimes(1)
        expect(mockAddBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                type: AlertBannerTypes.Warning,
                instanceId: 'phone-warning-banner',
                category: BannerCategories.ERROR_HANDLING,
                message:
                    'Poor network connection detected. Voice calls cannot be properly received or made until connection improves. Try restarting the network on your device.',
                onClose: expect.any(Function),
            }),
        )
    })

    it('should call setWarning when the warning notification is clicked', () => {
        stateMock = {
            warning: warningMock,
        } as State

        renderHook(() => useErrorHandling(stateMock, actionsMock))

        const onClose = (
            mockAddBanner.mock.calls as Array<
                [
                    {
                        onClose?: () => void
                        type: string
                        instanceId: string
                        category: string
                        message: string
                    },
                ]
            >
        )[0][0].onClose
        onClose?.()

        expect(actionsMock.setWarning).toHaveBeenCalledTimes(1)
        expect(actionsMock.setWarning).toHaveBeenCalledWith(null)
    })
})
