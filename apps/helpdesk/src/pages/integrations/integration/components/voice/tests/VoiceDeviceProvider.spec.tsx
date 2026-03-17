import type React from 'react'

import { useLocalStorage } from '@repo/hooks'
import { assumeMock, renderHook } from '@repo/testing'
import { isDesktopDevice } from '@repo/utils'
import { act, render, waitFor } from '@testing-library/react'
import { Device } from '@twilio/voice-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import { connectDevice, disconnectDevice } from 'hooks/integrations/phone/utils'
import useHasPhone from 'hooks/useHasPhone'

import type { VoiceDeviceContextState } from '../VoiceDeviceContext'
import VoiceDeviceProvider from '../VoiceDeviceProvider'

jest.mock('hooks/integrations/phone/utils')
jest.mock('hooks/useHasPhone')
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useLocalStorage: jest.fn(),
}))
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    isDesktopDevice: jest.fn(),
}))

const useHasPhoneMock = assumeMock(useHasPhone)
const isDesktopDeviceMock = assumeMock(isDesktopDevice)
const connectDeviceMock = assumeMock(connectDevice)
const disconnectDeviceMock = assumeMock(disconnectDevice)
const useLocalStorageMock = assumeMock(useLocalStorage)

const mockStore = configureMockStore()

const renderComponent = () => {
    const store = mockStore({})
    return render(
        <Provider store={store}>
            <VoiceDeviceProvider>
                <div>Test Children</div>
            </VoiceDeviceProvider>
        </Provider>,
    )
}

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <Provider store={mockStore({} as any)}>
        <VoiceDeviceProvider>{children}</VoiceDeviceProvider>
    </Provider>
)

describe('VoiceDeviceProvider', () => {
    const setLastUsedIntegrationMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useLocalStorageMock.mockReturnValue([
            '',
            setLastUsedIntegrationMock,
            jest.fn(),
        ])
    })

    it('should render children', () => {
        const { getByText } = renderComponent()

        expect(getByText('Test Children')).toBeInTheDocument()
    })

    it('should attempt to connect device if not connected', () => {
        useHasPhoneMock.mockReturnValue(true)
        isDesktopDeviceMock.mockReturnValue(true)

        renderComponent()
        expect(connectDevice).toHaveBeenCalled()
    })

    it('should not attempt to connect device if account has no voice integrations', () => {
        useHasPhoneMock.mockReturnValue(false)
        isDesktopDeviceMock.mockReturnValue(true)

        renderComponent()
        expect(connectDevice).not.toHaveBeenCalled()
    })

    it('should not attempt to connect device if not on desktop', () => {
        useHasPhoneMock.mockReturnValue(true)
        isDesktopDeviceMock.mockReturnValue(false)

        renderComponent()
        expect(connectDevice).not.toHaveBeenCalled()
    })

    it(`should only attempt to connect device when it's not already connecting`, async () => {
        useHasPhoneMock.mockReturnValue(true)
        isDesktopDeviceMock.mockReturnValue(true)
        let result: { current: VoiceDeviceContextState }

        act(() => {
            const hookResult = renderHook(useVoiceDevice, {
                wrapper,
            })

            result = hookResult.result
        })

        const connectDeviceCalls = connectDeviceMock.mock.calls.length
        act(() => {
            result.current.actions.setIsConnecting(true)
        })
        expect(connectDeviceMock.mock.calls.length).toBe(connectDeviceCalls)
        act(() => {
            result.current.actions.setIsConnecting(false)
        })
        await waitFor(() =>
            expect(connectDeviceMock.mock.calls.length).toBe(
                connectDeviceCalls + 1,
            ),
        )
    })

    it('should not attempt to connect device if there is a non-recoverable error', () => {
        useHasPhoneMock.mockReturnValue(true)
        isDesktopDeviceMock.mockReturnValue(true)

        let result: { current: VoiceDeviceContextState }

        act(() => {
            const hookResult = renderHook(useVoiceDevice, {
                wrapper,
            })

            result = hookResult.result
        })

        const connectDeviceCalls = connectDeviceMock.mock.calls.length
        act(() => {
            result.current.actions.setError(new Error('Test Error'))
        })

        expect(connectDeviceMock.mock.calls.length).toBe(connectDeviceCalls)
    })

    it(`should disconnect device only when it's in "destroyed" state`, async () => {
        useHasPhoneMock.mockReturnValue(true)
        isDesktopDeviceMock.mockReturnValue(true)

        let result: { current: VoiceDeviceContextState }

        act(() => {
            const hookResult = renderHook(useVoiceDevice, {
                wrapper,
            })

            result = hookResult.result
        })

        const disconnectDeviceCalls = disconnectDeviceMock.mock.calls.length
        act(() => {
            result.current.actions.setDevice({
                state: Device.State.Registering,
            } as any)
            result.current.actions.setDevice({
                state: Device.State.Registered,
            } as any)
            result.current.actions.setDevice({
                state: Device.State.Unregistered,
            } as any)
        })
        expect(disconnectDeviceMock.mock.calls.length).toBe(
            disconnectDeviceCalls,
        )

        act(() => {
            result.current.actions.setDevice({
                state: Device.State.Destroyed,
            } as any)
        })

        await waitFor(() =>
            expect(disconnectDeviceMock.mock.calls.length).toBe(
                disconnectDeviceCalls + 1,
            ),
        )
    })

    describe('Last used integration tracking', () => {
        beforeEach(() => {
            useHasPhoneMock.mockReturnValue(true)
            isDesktopDeviceMock.mockReturnValue(true)
        })

        it('should save integration_id to localStorage when call is set', async () => {
            let result: { current: VoiceDeviceContextState }

            act(() => {
                const hookResult = renderHook(useVoiceDevice, {
                    wrapper,
                })
                result = hookResult.result
            })

            const mockCall = {
                customParameters: new Map([
                    ['integration_id', 'test-integration-123'],
                ]),
            } as any

            act(() => {
                result.current.actions.setCall(mockCall)
            })

            await waitFor(() => {
                expect(setLastUsedIntegrationMock).toHaveBeenCalledWith(
                    'test-integration-123',
                )
            })
        })
    })
})
