import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { useIsAccountDeactivated } from 'hooks/useIsAccountDeactivated'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

const renderUseIsAccountDeactivated = (
    accountOverrides: Partial<typeof account> = {},
) => {
    const defaultState = {
        currentAccount: fromJS({ ...account, ...accountOverrides }),
    } as RootState

    return renderHook(() => useIsAccountDeactivated(), {
        wrapper: ({ children }) => (
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        ),
    })
}

describe('useIsAccountDeactivated', () => {
    describe('when account is not deactivated', () => {
        it('should return false when deactivated_datetime is null', () => {
            const { result } = renderUseIsAccountDeactivated({
                deactivated_datetime: null,
            })
            expect(result.current).toBe(false)
        })

        it('should return false when deactivated_datetime is undefined', () => {
            const { result } = renderUseIsAccountDeactivated({
                deactivated_datetime: undefined,
            })
            expect(result.current).toBe(false)
        })

        it('should return false when deactivated_datetime is an empty string', () => {
            const { result } = renderUseIsAccountDeactivated({
                deactivated_datetime: '',
            })
            expect(result.current).toBe(false)
        })
    })

    describe('when account is deactivated', () => {
        it('should return true when deactivated_datetime is a valid ISO string', () => {
            const { result } = renderUseIsAccountDeactivated({
                deactivated_datetime: '2025-01-01T00:00:00Z',
            })
            expect(result.current).toBe(true)
        })
    })

    describe('edge cases', () => {
        it('should handle missing deactivated_datetime property', () => {
            const { result } = renderUseIsAccountDeactivated({})
            expect(result.current).toBe(false)
        })
    })
})
