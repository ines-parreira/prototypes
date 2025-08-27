import { ComponentType, ReactNode } from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import { initialState } from 'state/billing/reducers'
import { RootState } from 'state/types'

import { useIsConvertSubscriber } from '../useIsConvertSubscriber'

const defaultState = {
    currentAccount: fromJS(account),
    billing: initialState.mergeDeep(billingFixtures.billingState),
} as RootState
const store = createStore((state) => state as RootState, defaultState)
const hookOptions = {
    wrapper: (({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )) as ComponentType,
}

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('useIsConvertSubscriber()', () => {
    describe('flag is undefined', () => {
        it('returns false', () => {
            mockUseFlag.mockImplementation((key, defaultValue) => {
                return defaultValue
            })

            const { result } = renderHook(
                () => useIsConvertSubscriber(),
                hookOptions,
            )
            expect(result.current).toEqual(false)
        })
    })

    describe('flag is defined', () => {
        it('returns the value of the flag', () => {
            mockUseFlag.mockImplementation((key, defaultValue) => {
                if (key === FeatureFlagKey.RevenueBetaTesters) {
                    return true
                }
                return defaultValue
            })

            const { result } = renderHook(
                () => useIsConvertSubscriber(),
                hookOptions,
            )
            expect(result.current).toEqual(true)
        })
    })
})
