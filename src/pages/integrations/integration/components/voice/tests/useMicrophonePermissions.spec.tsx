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
    it('should check microphone permissions every 5 seconds', async () => {
        const queryPermissionsMock = jest
            .fn()
            .mockReturnValueOnce(Promise.resolve({state: 'denied'}))
        Object.defineProperty(navigator, 'permissions', {
            value: {
                query: queryPermissionsMock,
            },
            writable: true,
        })

        const {result, waitFor} = render()
        queryPermissionsMock.mockReturnValue(
            Promise.resolve({state: 'granted'})
        )
        jest.advanceTimersByTime(5000)

        await waitFor(() => result.current.permissionDenied === true)

        expect(queryPermissionsMock).toHaveBeenCalledWith({name: 'microphone'})
        expect(queryPermissionsMock).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(5000)
        expect(queryPermissionsMock).toHaveBeenCalledTimes(2)
        await waitFor(() => result.current.permissionDenied === false)
    })
})
