import React, { ComponentType } from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { FeatureFlagKey } from 'config/featureFlags'
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
    wrapper: (({ children }) => (
        <Provider store={store}>{children}</Provider>
    )) as ComponentType,
}

describe('useIsConvertSubscriber()', () => {
    describe('flag is undefined', () => {
        it('returns false', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

            const { result } = renderHook(
                () => useIsConvertSubscriber(),
                hookOptions,
            )
            expect(result.current).toEqual(false)
        })
    })

    describe('flag is defined', () => {
        it('returns the value of the flag', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.RevenueBetaTesters]: true,
            }))

            const { result } = renderHook(
                () => useIsConvertSubscriber(),
                hookOptions,
            )
            expect(result.current).toEqual(true)
        })
    })
})
