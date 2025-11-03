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
                result.current.chatAvailability,
            ]).toEqual(['inbound', 'chat', 'online'])

            act(() => {
                result.current.setSettings({
                    channel: 'email',
                    chatAvailability: 'offline',
                })
            })

            expect([
                result.current.mode,
                result.current.channel,
                result.current.chatAvailability,
            ]).toEqual(['inbound', 'email', 'offline'])
        })

        it('should reset settings to default values', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <SettingsProvider>{children}</SettingsProvider>
                ),
            })

            act(() => {
                result.current.setSettings({
                    mode: 'outbound',
                    channel: 'sms',
                    chatAvailability: 'offline',
                })
            })

            expect([
                result.current.mode,
                result.current.channel,
                result.current.chatAvailability,
            ]).toEqual(['outbound', 'sms', 'offline'])

            act(() => {
                result.current.resetSettings()
            })

            expect(result.current).toMatchObject(DEFAULT_STATE)
        })

        it('should automatically set channel to sms when mode is set to outbound', async () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <SettingsProvider>{children}</SettingsProvider>
                ),
            })

            expect(result.current.channel).toBe('chat')

            act(() => {
                result.current.setSettings({
                    mode: 'outbound',
                })
            })

            expect(result.current.channel).toBe('sms')
        })

        it('should update partial settings without affecting other values', () => {
            const { result } = renderHook(() => useSettingsContext(), {
                wrapper: ({ children }: { children: ReactNode }) => (
                    <SettingsProvider>{children}</SettingsProvider>
                ),
            })

            const initialMode = result.current.mode
            const initialChannel = result.current.channel

            act(() => {
                result.current.setSettings({
                    chatAvailability: 'offline',
                })
            })

            expect(result.current.chatAvailability).toBe('offline')
            expect(result.current.mode).toBe(initialMode)
            expect(result.current.channel).toBe(initialChannel)
        })
    })
})
