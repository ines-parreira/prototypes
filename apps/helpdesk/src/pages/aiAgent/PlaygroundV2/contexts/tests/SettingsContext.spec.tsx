import { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { CoreProvider, useCoreContext } from '../CoreContext'
import {
    DEFAULT_STATE,
    SettingsProvider,
    useSettingsContext,
} from '../SettingsContext'

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

jest.mock('core/flags/hooks/useFlag', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <CoreProvider>
        <SettingsProvider>{children}</SettingsProvider>
    </CoreProvider>
)

describe('SettingsContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

        it('should automatically change channel to sms when mode is set to outbound', () => {
            const { result } = renderHook(
                () => ({
                    settings: useSettingsContext(),
                    core: useCoreContext(),
                }),
                { wrapper },
            )

            // Should start in inbound mode with chat channel
            expect(result.current.settings.mode).toBe('inbound')
            expect(result.current.core.channel).toBe('chat')

            // Change to outbound mode
            act(() => {
                result.current.settings.setSettings({ mode: 'outbound' })
            })

            // Should automatically change to sms channel
            expect(result.current.settings.mode).toBe('outbound')
            expect(result.current.core.channel).toBe('sms')
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
