import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import {
    advancedMonthlyHelpdeskPrice,
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import reducer, {initialState} from '../reducers'
import * as types from '../constants'
import {GorgiasAction} from '../../types'

jest.addMatchers(immutableMatchers)

describe('current account reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState
        )
    })

    it('update account', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_START,
            }).toJS()
        ).toMatchSnapshot()
        // success
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_SUCCESS,
                resp: fromJS({
                    settings: [
                        {
                            id: 10,
                        },
                    ],
                }),
            }).toJS()
        ).toMatchSnapshot()
        // fail
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_ERROR,
            }).toJS()
        ).toMatchSnapshot()
    })

    it('update setting', () => {
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_SETTING,
                setting: {
                    hello: 'world',
                } as any,
            }).toJS()
        ).toMatchSnapshot()
        // update
        expect(
            reducer(
                initialState.mergeDeep({
                    settings: [
                        {
                            id: 1,
                            hello: 'goodbye',
                        },
                    ],
                }),
                {
                    type: types.UPDATE_ACCOUNT_SETTING,
                    setting: {
                        id: 1,
                        hello: 'world',
                    } as any,
                    isUpdate: true,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('update account owner', (done) => {
        // success
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_OWNER_SUCCESS,
                userId: 1,
            }).toJS()
        ).toMatchSnapshot()
        done()
    })

    describe('update subscription', () => {
        it('without any existing subscription', () => {
            const state = initialState.set('current_subscription', null)
            expect(
                reducer(state, {
                    type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                    subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                basicMonthlyHelpdeskPrice.price_id,
                        },
                    },
                }).toJS()
            ).toMatchSnapshot()
        })

        it('with an existing subscription', () => {
            const state = initialState.set(
                'current_subscription',
                fromJS({
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPrice.price_id,
                    },
                })
            )
            expect(
                reducer(state, {
                    type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                    subscription: {
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                advancedMonthlyHelpdeskPrice.price_id,
                        },
                    },
                }).toJS()
            ).toMatchSnapshot()
        })
    })

    describe('SET_CURRENT_SUBSCRIPTION', () => {
        const subscription = fromJS({
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
            },
            status: 'active',
        })

        it('should set the credit card (initial state).', () => {
            const action = {
                type: types.SET_CURRENT_SUBSCRIPTION,
                subscription,
            }
            expect(reducer(initialState, action)).toMatchSnapshot()
        })

        it('should set the credit card and override the previous one.', () => {
            const action = {
                type: types.SET_CURRENT_SUBSCRIPTION,
                subscription,
            }
            const state = reducer(initialState, action)
            const newSubscription = {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
                },
                staus: 'past_due',
            }
            const newAction = {
                type: types.SET_CURRENT_SUBSCRIPTION,
                subscription: newSubscription,
            }
            expect(reducer(state, newAction as GorgiasAction)).toMatchSnapshot()
        })
    })
})
