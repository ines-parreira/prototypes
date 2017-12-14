import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('current account reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('update account', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.UPDATE_ACCOUNT_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.UPDATE_ACCOUNT_SUCCESS,
                    resp: fromJS({settings: [{id: 10}]}),
                }
            ).toJS()
        ).toMatchSnapshot()

        // fail
        expect(
            reducer(
                initialState,
                {
                    type: types.UPDATE_ACCOUNT_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('update setting', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.UPDATE_ACCOUNT_SETTING,
                    setting: {hello: 'world'},
                }
            ).toJS()
        ).toMatchSnapshot()

        // update
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        settings: [{id: 1, hello: 'goodbye'}],
                    }),
                {
                    type: types.UPDATE_ACCOUNT_SETTING,
                    setting: {id: 1, hello: 'world'},
                    isUpdate: true,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    describe('update subscription', () => {
        it('without any existing subscription', () => {
            const state = initialState.set('current_subscription', null)
            expect(
                reducer(state, {
                    type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                    subscription: {plan: 'basic-usd-1'},
                }).toJS()
            ).toMatchSnapshot()
        })

        it('with an existing subscription', () => {
            const state = initialState.set('current_subscription', fromJS({plan: 'advanced-usd-1'}))
            expect(
                reducer(state, {
                    type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                    subscription: {plan: 'basic-usd-1'},
                }).toJS()
            ).toMatchSnapshot()
        })
    })

})
