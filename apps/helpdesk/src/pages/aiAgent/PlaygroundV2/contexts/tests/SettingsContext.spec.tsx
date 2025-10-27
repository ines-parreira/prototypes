import { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import {
    DEFAULT_STATE,
    SettingsProvider,
    useSettingsContext,
} from '../SettingsContext'

describe('SettingsContext', () => {
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
                wrapper: ({ children }: { children: ReactNode }) => (
                    <SettingsProvider>{children}</SettingsProvider>
                ),
            })

            expect(result.current).toMatchObject(DEFAULT_STATE)
        })
    })

    describe('SettingsProvider', () => {
        it('should update settings', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <SettingsProvider>{children}</SettingsProvider>
                ),
            })

            expect([
                result.current.mode,
                result.current.channel,
                result.current.totalFollowUp,
            ]).toEqual(['inbound', 'chat', 1])

            act(() => {
                result.current.setSettings((prev) => ({
                    ...prev,
                    mode: 'outbound',
                    channel: 'email',
                    totalFollowUp: 5,
                }))
            })

            expect([
                result.current.mode,
                result.current.channel,
                result.current.totalFollowUp,
            ]).toEqual(['outbound', 'email', 5])
        })

        it('should reset settings to default values', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <SettingsProvider>{children}</SettingsProvider>
                ),
            })

            act(() => {
                result.current.setSettings((prev) => ({
                    ...prev,
                    mode: 'outbound',
                    channel: 'sms',
                    totalFollowUp: 10,
                }))
            })

            expect([
                result.current.mode,
                result.current.channel,
                result.current.totalFollowUp,
            ]).toEqual(['outbound', 'sms', 10])

            act(() => {
                result.current.resetSettings()
            })

            expect(result.current).toMatchObject(DEFAULT_STATE)
        })
    })
})
