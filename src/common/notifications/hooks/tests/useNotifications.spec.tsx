import React from 'react'
import type { ReactNode } from 'react'

import { renderHook } from 'utils/testing/renderHook'

import type Client from '../../Client'
import Context from '../../Context'
import useNotifications from '../useNotifications'

describe('useNotifications', () => {
    it('should throw an error if it is used outside of the provider', () => {
        const { result } = renderHook(() => useNotifications(jest.fn()))
        expect(result.error?.message).toBe(
            '`useNotifications` may not be used outside of a `ClientProvider`',
        )
    })

    it('should subscribe and unsubscribe to the client', () => {
        const unsubscribe = jest.fn()
        const subscribe = jest.fn(() => unsubscribe)
        const client = { subscribe } as unknown as Client
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <Context.Provider value={client}>{children}</Context.Provider>
        )

        const listener = jest.fn()
        const { unmount } = renderHook(() => useNotifications(listener), {
            wrapper,
        })

        expect(subscribe).toHaveBeenCalledWith(listener)

        unmount()
        expect(unsubscribe).toHaveBeenCalledWith()
    })
})
