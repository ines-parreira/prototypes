import { fromJS } from 'immutable'

import {
    advancedMonthlyHelpdeskPlan,
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import type { AccountSetting } from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'
import type { GorgiasAction } from 'state/types'

import * as types from '../constants'
import reducer, { initialState } from '../reducers'

describe('current account reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState,
        )
    })

    it('update account', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_START,
            }).toJS(),
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
            }).toJS(),
        ).toMatchSnapshot()
        // fail
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_ERROR,
            }).toJS(),
        ).toMatchSnapshot()
    })

    it('update setting', () => {
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_SETTING,
                setting: {
                    hello: 'world',
                } as any,
            }).toJS(),
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
                },
            ).toJS(),
        ).toMatchSnapshot()
    })

    it('update account owner', (done) => {
        // success
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNT_OWNER_SUCCESS,
                userId: 1,
            }).toJS(),
        ).toMatchSnapshot()
        done()
    })

    describe('UPDATE_SUBSCRIPTION_SUCCESS', () => {
        const basicSubscription = {
            start_datetime: '2024-03-01T11:33:41+00:00',
            trial_end_datetime: '2024-03-01T11:33:41+00:00',
            trial_start_datetime: '2024-03-03T11:33:41+00:00',
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            },
            status: 'past_due',
            scheduled_to_cancel_at: '2024-03-04T11:33:41+00:00',
        }

        it('should update when previous subscription is null', () => {
            const state = initialState.set('current_subscription', null)

            expect(
                reducer(state, {
                    type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                    subscription: basicSubscription,
                }).get('current_subscription'),
            ).toEqual(fromJS(basicSubscription))
        })

        it('should update the status and scheduled_to_cancel_at', () => {
            const state = initialState.set(
                'current_subscription',
                fromJS(basicSubscription),
            )
            const updatedSubscription = {
                ...basicSubscription,
                status: 'active',
                scheduled_to_cancel_at: null,
            }
            expect(
                reducer(state, {
                    type: types.UPDATE_SUBSCRIPTION_SUCCESS,
                    subscription: updatedSubscription,
                }).get('current_subscription'),
            ).toEqual(fromJS(updatedSubscription))
        })
    })

    describe('SET_CURRENT_SUBSCRIPTION', () => {
        const subscription = {
            start_datetime: '2024-03-01T11:33:41+00:00',
            trial_end_datetime: '2024-03-01T11:33:41+00:00',
            trial_start_datetime: '2024-03-03T11:33:41+00:00',
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            },
            status: 'past_due',
            scheduled_to_cancel_at: '2024-03-04T11:33:41+00:00',
        }

        it('should set a subscription when before subscription was null', () => {
            const state = initialState.set('current_subscription', null)
            const action = {
                type: types.SET_CURRENT_SUBSCRIPTION,
                subscription: subscription,
            }
            expect(reducer(state, action).get('current_subscription')).toEqual(
                fromJS(subscription),
            )
        })

        it('should reset a subscription when previous one existed already', () => {
            const action = {
                type: types.SET_CURRENT_SUBSCRIPTION,
                subscription,
            }
            const state = reducer(initialState, action)

            const newSubscription = {
                ...subscription,
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.plan_id,
                },
                status: 'active',
            }
            const newAction = {
                type: types.SET_CURRENT_SUBSCRIPTION,
                subscription: newSubscription,
            }
            expect(
                reducer(state, newAction).get('current_subscription'),
            ).toEqual(fromJS(newSubscription))
        })
    })

    describe('UPDATE_SUBSCRIPTION_PRODUCTS', () => {
        const subscription = {
            start_datetime: '2024-03-01T11:33:41+00:00',
            trial_end_datetime: '2024-03-01T11:33:41+00:00',
            trial_start_datetime: '2024-03-03T11:33:41+00:00',
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            },
            status: 'past_due',
            scheduled_to_cancel_at: '2024-03-04T11:33:41+00:00',
        }

        it('should return the same state if current subscription is null', () => {
            const state = initialState.set('current_subscription', null)
            const action = {
                type: types.UPDATE_SUBSCRIPTION_PRODUCTS,
                products: fromJS({
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                }),
            }
            expect(
                reducer(state, action).get('current_subscription'),
            ).toBeNull()
        })

        it('should update the products of the subscription', () => {
            const state = initialState.set(
                'current_subscription',
                fromJS(subscription),
            )
            const action = {
                type: types.UPDATE_SUBSCRIPTION_PRODUCTS,
                products: fromJS({
                    [HELPDESK_PRODUCT_ID]: advancedMonthlyHelpdeskPlan.plan_id,
                }),
            }
            expect(reducer(state, action).get('current_subscription')).toEqual(
                fromJS({
                    ...subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            advancedMonthlyHelpdeskPlan.plan_id,
                    },
                }),
            )
        })
    })

    describe('FETCH_ACCOUNT_SETTINGS_SUCCESS', () => {
        const initial_settings = [
            {
                id: 1,
                type: AccountSettingType.DefaultIntegration,
                data: { email: 1 },
            },
            {
                id: 2,
                type: 'business-hours',
                data: { dummy: 'test' },
            },
        ]
        it('should update the settings', () => {
            const state = initialState.set('settings', fromJS(initial_settings))
            const action = {
                type: types.FETCH_ACCOUNT_SETTINGS_SUCCESS,
                accountSettings: [
                    {
                        id: 1,
                        type: AccountSettingType.DefaultIntegration,
                        data: { email: 2 },
                    } as AccountSetting,
                ],
            }
            const expected_settings = [
                {
                    id: 1,
                    type: AccountSettingType.DefaultIntegration,
                    data: { email: 2 },
                },
                {
                    id: 2,
                    type: 'business-hours',
                    data: { dummy: 'test' },
                },
            ]
            expect(reducer(state, action).get('settings')).toEqual(
                fromJS(expected_settings),
            )
        })

        it('should ignore missing setting type', () => {
            const state = initialState.set('settings', fromJS(initial_settings))
            const action = {
                type: types.FETCH_ACCOUNT_SETTINGS_SUCCESS,
                accountSettings: [
                    {
                        id: 1,
                        type: AccountSettingType.ViewsVisibility,
                        data: { hidden_views: [] },
                    } as AccountSetting,
                ],
            }
            expect(reducer(state, action).get('settings')).toEqual(
                fromJS(initial_settings),
            )
        })

        it('shouldnt modify initial state on empty response', () => {
            const state = initialState.set('settings', fromJS(initial_settings))
            const action = {
                type: types.FETCH_ACCOUNT_SETTINGS_SUCCESS,
            }
            expect(reducer(state, action).get('settings')).toEqual(
                fromJS(initial_settings),
            )
        })
    })
})
