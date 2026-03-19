import { assumeMock } from '@repo/testing'
import { isDesktopDevice } from '@repo/utils'
import { isDeviceReady } from '@repo/voice'
import { act, renderHook } from '@testing-library/react'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHasPhone from 'hooks/useHasPhone'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'

import { usePlaceCallButton } from '../usePlaceCallButton'

jest.mock('hooks/integrations/phone/useVoiceDevice')
jest.mock('hooks/useHasPhone')
jest.mock(
    'pages/integrations/integration/components/voice/useMicrophonePermissions',
)
jest.mock('@repo/voice', () => ({
    ...jest.requireActual('@repo/voice'),
    isDeviceReady: jest.fn(),
}))
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    isDesktopDevice: jest.fn(),
    useConditionalShortcuts: jest.fn(),
}))

const useVoiceDeviceMock = assumeMock(useVoiceDevice)
const useHasPhoneMock = assumeMock(useHasPhone)
const useMicrophonePermissionsMock = assumeMock(useMicrophonePermissions)
const isDesktopDeviceMock = assumeMock(isDesktopDevice)
const isDeviceReadyMock = assumeMock(isDeviceReady)

describe('usePlaceCallButton', () => {
    beforeEach(() => {
        useVoiceDeviceMock.mockReturnValue({ device: {} } as any)
        useHasPhoneMock.mockReturnValue(true)
        useMicrophonePermissionsMock.mockReturnValue({
            permissionDenied: false,
        })
        isDesktopDeviceMock.mockReturnValue(true)
        isDeviceReadyMock.mockReturnValue(true)
    })

    it('returns shouldDisplayButton=false when hasPhone is false', () => {
        useHasPhoneMock.mockReturnValue(false)

        const { result } = renderHook(() => usePlaceCallButton())

        expect(result.current.shouldDisplayButton).toBe(false)
    })

    it('returns shouldDisplayButton=false when not on a desktop device', () => {
        isDesktopDeviceMock.mockReturnValue(false)

        const { result } = renderHook(() => usePlaceCallButton())

        expect(result.current.shouldDisplayButton).toBe(false)
    })

    it('returns shouldDisplayButton=true when hasPhone and on desktop', () => {
        const { result } = renderHook(() => usePlaceCallButton())

        expect(result.current.shouldDisplayButton).toBe(true)
    })

    it('returns isButtonDisabled=true when device is not ready', () => {
        isDeviceReadyMock.mockReturnValue(false)

        const { result } = renderHook(() => usePlaceCallButton())

        expect(result.current.isButtonDisabled).toBe(true)
    })

    it('returns isButtonDisabled=true when microphone permission is denied', () => {
        useMicrophonePermissionsMock.mockReturnValue({ permissionDenied: true })

        const { result } = renderHook(() => usePlaceCallButton())

        expect(result.current.isButtonDisabled).toBe(true)
    })

    it('returns isButtonDisabled=false when device is ready and permission granted', () => {
        const { result } = renderHook(() => usePlaceCallButton())

        expect(result.current.isButtonDisabled).toBe(false)
    })

    it('sets isDeviceVisible to false when device becomes null', () => {
        const { result, rerender } = renderHook(() => usePlaceCallButton())

        act(() => {
            result.current.setIsDeviceVisible(true)
        })
        expect(result.current.isDeviceVisible).toBe(true)

        useVoiceDeviceMock.mockReturnValue({ device: null } as any)
        rerender()

        expect(result.current.isDeviceVisible).toBe(false)
    })
})
