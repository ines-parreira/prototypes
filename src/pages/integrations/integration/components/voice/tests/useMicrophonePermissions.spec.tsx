import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import React from 'react'

import useMicrophonePermissions from '../useMicrophonePermissions'

const queryClient = new QueryClient()

const render = () =>
    renderHook(() => useMicrophonePermissions(), {
        wrapper: ({children}) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })

jest.useFakeTimers()

describe('useMicrophonePermissions', () => {
    it.skip('should check microphone permissions every 5 seconds', async () => {
        const queryPermissionsMock = jest
            .fn()
            .mockReturnValue(Promise.resolve({state: 'denied'}))
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: queryPermissionsMock,
            },
            writable: true,
        })

        const {result, waitFor} = render()
        jest.advanceTimersByTime(5000)

        await waitFor(() => result.current.permissionDenied === true)
        queryPermissionsMock.mockReturnValue(
            Promise.resolve({state: 'granted'})
        )

        expect(queryPermissionsMock).toHaveBeenCalledWith({name: 'microphone'})
        expect(queryPermissionsMock).toHaveBeenCalledTimes(2)

        jest.advanceTimersByTime(5000)
        expect(queryPermissionsMock).toHaveBeenCalledTimes(3)
        await waitFor(() => result.current.permissionDenied === false)
    })

    it('should return permissionDenied: false every time', () => {
        const queryPermissionsMock = jest
            .fn()
            .mockReturnValue(Promise.resolve({state: 'denied'}))
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: queryPermissionsMock,
            },
            writable: true,
        })

        const {result} = render()
        jest.advanceTimersByTime(5000)

        expect(result.current.permissionDenied).toBe(false)
    })
})
