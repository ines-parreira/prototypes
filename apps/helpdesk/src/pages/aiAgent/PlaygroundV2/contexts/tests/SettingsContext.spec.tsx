import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { CoreProvider } from '../CoreContext'
import {
    DEFAULT_STATE,
    SettingsProvider,
    useSettingsContext,
} from '../SettingsContext'

const mockResetToDefaultChannel = jest.fn()
const mockResetToDefaultActionsEnabled = jest.fn()
const mockOnChannelChange = jest.fn()

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useTestSession', () => ({
    useTestSession: () => ({
        testSessionId: 'test-session-id',
        isTestSessionLoading: false,
        createTestSession: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling', () => ({
    usePlaygroundPolling: () => ({
        testSessionLogs: undefined,
        isPolling: false,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: () => ({
        baseUrl: 'http://test.com',
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundChannel', () => ({
    usePlaygroundChannel: () => ({
        channel: 'chat',
        channelAvailability: 'online',
        onChannelChange: mockOnChannelChange,
        onChannelAvailabilityChange: jest.fn(),
        resetToDefaultChannel: mockResetToDefaultChannel,
    }),
}))

jest.mock('../CoreContext', () => {
    const actualModule = jest.requireActual('../CoreContext')
    return {
        ...actualModule,
        useCoreContext: jest.fn(() => ({
            testSessionId: 'test-session-id',
            isTestSessionLoading: false,
            createTestSession: jest.fn(),
            testSessionLogs: undefined,
            isPolling: false,
            startPolling: jest.fn(),
            stopPolling: jest.fn(),
            channel: 'chat',
            channelAvailability: 'online',
            onChannelChange: mockOnChannelChange,
            onChannelAvailabilityChange: jest.fn(),
            resetToDefaultChannel: mockResetToDefaultChannel,
            areActionsEnabled: false,
            setAreActionsEnabled: jest.fn(),
            resetToDefaultActionsEnabled: mockResetToDefaultActionsEnabled,
        })),
    }
})

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider>
        <SettingsProvider>{children}</SettingsProvider>
    </CoreProvider>
)

describe('SettingsContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockResetToDefaultChannel.mockClear()
        mockResetToDefaultActionsEnabled.mockClear()
        mockOnChannelChange.mockClear()
    })
    describe('useSettingsContext', () => {
        it('should throw error when used outside provider', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderHook(() => useSettingsContext())
            }).toThrow(
                'useSettingsContext must be used within a SettingsProvider',
            )

            consoleErrorSpy.mockRestore()
        })

        it('should return context value with default state when used inside provider', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper,
            })

            expect(result.current).toMatchObject(DEFAULT_STATE)
        })
    })

    describe('SettingsProvider', () => {
        it('should update settings', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper,
            })

            expect([
                result.current.mode,
                result.current.chatAvailability,
            ]).toEqual(['inbound', 'online'])

            act(() => {
                result.current.setSettings({
                    chatAvailability: 'offline',
                })
            })

            expect([
                result.current.mode,
                result.current.chatAvailability,
            ]).toEqual(['inbound', 'offline'])
        })

        it('should reset settings to default values', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper,
            })

            act(() => {
                result.current.setSettings({
                    mode: 'outbound',
                    chatAvailability: 'offline',
                })
            })

            expect([
                result.current.mode,
                result.current.chatAvailability,
            ]).toEqual(['outbound', 'offline'])

            act(() => {
                result.current.resetSettings()
            })

            expect(result.current).toMatchObject(DEFAULT_STATE)
        })

        it('should call resetToDefaultChannel when resetSettings is called', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper,
            })

            act(() => {
                result.current.resetSettings()
            })

            expect(mockResetToDefaultChannel).toHaveBeenCalledTimes(1)
        })

        it('should call resetToDefaultActionsEnabled when resetSettings is called', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper,
            })

            act(() => {
                result.current.resetSettings()
            })

            expect(mockResetToDefaultActionsEnabled).toHaveBeenCalledTimes(1)
        })

        it('should update partial settings without affecting other values', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper,
            })

            const initialMode = result.current.mode

            act(() => {
                result.current.setSettings({
                    chatAvailability: 'offline',
                })
            })

            expect(result.current.chatAvailability).toBe('offline')
            expect(result.current.mode).toBe(initialMode)
        })

        it('should call onChannelChange with sms when mode is set to outbound', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper,
            })

            // Should start in inbound mode
            expect(result.current.mode).toBe('inbound')

            // Change to outbound mode
            act(() => {
                result.current.setSettings({ mode: 'outbound' })
            })

            // Should call onChannelChange with 'sms'
            expect(result.current.mode).toBe('outbound')
            expect(mockOnChannelChange).toHaveBeenCalledWith('sms')
        })

        it('should initialize mode based on supportedModes prop', () => {
            const createWrapper =
                (modes: any) =>
                ({ children }: { children: ReactNode }) => (
                    <CoreProvider>
                        <SettingsProvider supportedModes={modes}>
                            {children}
                        </SettingsProvider>
                    </CoreProvider>
                )

            const { result: inbound } = renderHook(() => useSettingsContext(), {
                wrapper: createWrapper(['inbound']),
            })
            expect(inbound.current.mode).toBe('inbound')

            const { result: outbound } = renderHook(
                () => useSettingsContext(),
                { wrapper: createWrapper(['outbound', 'inbound']) },
            )
            expect(outbound.current.mode).toBe('outbound')

            const { result: defaultMode } = renderHook(
                () => useSettingsContext(),
                { wrapper: createWrapper(undefined) },
            )
            expect(defaultMode.current.mode).toBe(DEFAULT_STATE.mode)
        })
    })
})
