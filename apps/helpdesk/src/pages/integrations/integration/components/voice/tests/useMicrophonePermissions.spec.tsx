import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useMicrophonePermissions from '../useMicrophonePermissions'

const render = (time?: number) =>
    renderHook(() => useMicrophonePermissions(time), {
        wrapper: ({ children }) => (
            <QueryClientProvider client={mockQueryClient()}>
                {children}
            </QueryClientProvider>
        ),
    })

jest.useFakeTimers()

describe('useMicrophonePermissions', () => {
    it('should check microphone permissions every 5 seconds by default', async () => {
        const queryPermissionsMock = jest
            .fn()
            .mockReturnValue(Promise.resolve({ state: 'prompt' }))
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: queryPermissionsMock,
            },
            writable: true,
        })

        render()

        await waitFor(() => {
            expect(queryPermissionsMock).toHaveBeenCalledTimes(1)
        })

        await act(async () => {
            jest.advanceTimersByTime(5000)
        })

        await waitFor(() => {
            expect(queryPermissionsMock).toHaveBeenCalledTimes(2)
        })
    })

    it('should support custom refetch interval', async () => {
        const queryPermissionsMock = jest
            .fn()
            .mockReturnValue(Promise.resolve({ state: 'prompt' }))
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: queryPermissionsMock,
            },
            writable: true,
        })

        render(1000)

        await waitFor(() => {
            expect(queryPermissionsMock).toHaveBeenCalledTimes(1)
        })

        await act(async () => {
            jest.advanceTimersByTime(1000)
        })

        await waitFor(() => {
            expect(queryPermissionsMock).toHaveBeenCalledTimes(2)
        })
    })

    it('should return permissionDenied when permission is denied', async () => {
        const queryPermissionsMock = jest
            .fn()
            .mockReturnValue(Promise.resolve({ state: 'denied' }))
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: queryPermissionsMock,
            },
            writable: true,
        })

        const { result } = render()

        await waitFor(() => {
            expect(result.current.permissionDenied).toBe(true)
        })
    })

    it('should not recheck permissions when permission is granted', async () => {
        const queryPermissionsMock = jest
            .fn()
            .mockReturnValue(Promise.resolve({ state: 'granted' }))
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: queryPermissionsMock,
            },
            writable: true,
        })

        render()

        await act(async () => {
            jest.advanceTimersByTime(5000)
        })

        await waitFor(() => {
            expect(queryPermissionsMock).toHaveBeenCalledTimes(1)
        })
    })

    it.each(['granted', 'prompt'])(
        'should return permissionDenied: false when permission is %s',
        async (state) => {
            const queryPermissionsMock = jest
                .fn()
                .mockReturnValue(Promise.resolve({ state }))
            Object.defineProperty(navigator, 'permissions', {
                value: {
                    query: queryPermissionsMock,
                },
                writable: true,
            })

            const { result } = render()

            await waitFor(() => {
                expect(result.current.permissionDenied).toBe(false)
            })
        },
    )
})
