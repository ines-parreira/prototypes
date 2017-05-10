import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _assign from 'lodash/assign'
import _some from 'lodash/some'
import {fromJS} from 'immutable'
import usageLimitNotifier from '../usageLimitNotifier'
import {NOTIFICATION_UIDS as UIDS} from '../../../config'
import * as currentAccountTypes from '../../../state/currentAccount/constants'
import * as billingTypes from '../../../state/billing/constants'
import * as ticketTypes from '../../../state/ticket/constants'
import * as notifs from '../../../fixtures/notifications'
import plan from '../../../fixtures/plan'
import moment from 'moment'

const middlewares = [thunk, usageLimitNotifier]
const mockStore = configureMockStore(middlewares)

const ticketsMaxLimit = plan.limits.max
const ticketsMinLimit = plan.limits.min
// base state, similar state as the one when a user used app for the first time
const baseState = {
    billing: fromJS({
        plan,
        currentUsage: {
            data: {
                tickets: 0
            }
        }
    }),
    currentAccount: fromJS({
        // init this date after effective date of plan which is equal to `now`
        created_datetime: moment().add(5, 'minute'),
        deactivated_datetime: null,
        meta: null
    })
}

describe('middlewares', () => {
    describe('usageLimitNotifier', () => {
        let store

        beforeEach(() => {
            store = mockStore(baseState)
        })

        it('should not do anything (action not tracked)', () => {
            const unknownAction = {
                type: 'UNKNOWN_ACTION_TYPE'
            }
            store.dispatch(unknownAction)

            expect(store.getActions()).toEqual([unknownAction])
        })

        it('should notify when user try to send a message (account deactivated)', (done) => {
            const expectedAction = _assign({}, notifs.accountDeactivatedModal, {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    deactivated_datetime: '2016-11-23T05:11:17.765655+00:00'
                })
            }))
            store.dispatch({
                type: ticketTypes.SUBMIT_TICKET_SUCCESS
            })

            setTimeout(() => {
                expect(_some(store.getActions(), expectedAction)).toEqual(true)
                done()
            }, 900)
        })

        it('should not notify when user try to send a message (account activated)', () => {
            store.dispatch({
                type: ticketTypes.SUBMIT_TICKET_SUCCESS
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })

        it('should notify when user try to send a message (usage default limit reached)', (done) => {
            const expectedAction = _assign({}, notifs.usageMaxLimitReachedModal(plan.free_tickets), {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // increase usage at default limit
            store = mockStore(_assign({}, baseState, {
                billing: baseState.billing.setIn(['currentUsage', 'data', 'tickets'], plan.free_tickets)
            }))

            store.dispatch({
                type: ticketTypes.SUBMIT_TICKET_SUCCESS
            })

            setTimeout(() => {
                expect(_some(store.getActions(), expectedAction)).toEqual(true)
                done()
            }, 900)
        })

        it('should not notify when user try to send a message (usage default limit not reached)', () => {
            // increase usage just below default limit
            store = mockStore(_assign({}, baseState, {
                billing: baseState.billing.setIn(['currentUsage', 'data', 'tickets'], plan.free_tickets - 1)
            }))

            store.dispatch({
                type: ticketTypes.SUBMIT_TICKET_SUCCESS
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })

        it('should notify when user try to open a ticket (account deactivated)', () => {
            const expectedAction = _assign({}, notifs.accountDeactivatedModal, {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    deactivated_datetime: '2016-11-23T05:11:17.765655'
                })
            }))

            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START,
                displayLoading: true
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should not notify when user try to send a message (account activated)', () => {
            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })

        it('should notify when user open a ticket (usage max limit reached)', () => {
            const expectedAction = _assign({}, notifs.usageMaxLimitReachedModal(plan.free_tickets), {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // increase usage at max limit
            store = mockStore(_assign({}, baseState, {
                billing: baseState.billing.setIn(['currentUsage', 'data', 'tickets'], ticketsMaxLimit)
            }))

            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START,
                displayLoading: true
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should not notify when user open a ticket (usage max limit not reached)', () => {
            // set usage just below the max limit
            store = mockStore(_assign({}, baseState, {
                billing: baseState.billing.setIn(['currentUsage', 'data', 'tickets'], ticketsMaxLimit - 1)
            }))

            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START,
                displayLoading: true
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })

        it('should notify when account has been deactivated', () => {
            const expectedAction = _assign({}, notifs.accountDeactivatedBanner, {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // deactivate account
            store.dispatch({
                type: currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
                resp: {
                    deactivated_datetime: '2016-11-23T05:11:17.765655'
                }
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should notify if account is deactivated', () => {
            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    deactivated_datetime: '2016-11-23T05:11:17.765655+00:00'
                })
            }))
            // account is still deactivated
            store.dispatch({
                type: currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
                resp: {
                    deactivated_datetime: '2016-11-23T05:11:17.765655+00:00'
                }
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(true)
        })

        it('should remove notification when account has been re-activated', () => {
            const expectedAction = {
                type: 'RNS_HIDE_NOTIFICATION',
                uid: UIDS.accountDeactivated
            }
            const expectedAction2 = {
                type: 'RNS_HIDE_NOTIFICATION',
                uid: UIDS.accountDeactivatedCardUpdated
            }
            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    deactivated_datetime: '2016-11-23T05:11:17.765655+00:00'
                })
            }))
            // re-activate account
            store.dispatch({
                type: currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
                resp: {
                    deactivated_datetime: null
                }
            })

            const actions = store.getActions()

            expect(_some(actions, expectedAction)).toEqual(true)
            expect(_some(actions, expectedAction2)).toEqual(true)
        })

        it('should not notify if account is already activated', () => {
            store.dispatch({
                type: currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
                resp: {
                    deactivated_datetime: null
                }
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })

        it('should remove usage notifications when user registered a credit card', () => {
            const expectedAction1 = {
                type: 'RNS_HIDE_NOTIFICATION',
                uid: UIDS.freeDefaultLimitReached
            }
            const expectedAction2 = {
                type: 'RNS_HIDE_NOTIFICATION',
                uid: UIDS.freeMinLimitReached
            }

            // user registered credit card
            store.dispatch({
                type: currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
                resp: {
                    meta: {
                        hasCreditCard: true
                    }
                }
            })

            expect(_some(store.getActions(), expectedAction1)).toEqual(true)
            expect(_some(store.getActions(), expectedAction2)).toEqual(true)
        })

        it('should notify when account has reached min limit of free tickets', () => {
            const expectedAction = _assign({}, notifs.usageMinLimitReachedBanner(plan.free_tickets), {
                type: 'RNS_SHOW_NOTIFICATION'
            })

            // account has reached min limit
            store.dispatch({
                type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                resp: {
                    data: {
                        tickets: ticketsMinLimit
                    }
                }
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should not notify if account has already reached min limit of free tickets', () => {
            // set usage at min limit
            store = mockStore(_assign({}, baseState, {
                billing: baseState.billing.setIn(['currentUsage', 'data', 'tickets'], ticketsMinLimit)
            }))

            // account has already reached min limit
            store.dispatch({
                type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                resp: {
                    data: {
                        tickets: ticketsMinLimit
                    }
                }
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })

        it('should remove usage notification and notify when account has reached default limit of free tickets', () => {
            const expectedAction1 = {
                type: 'RNS_HIDE_NOTIFICATION',
                uid: UIDS.freeMinLimitReached
            }
            const expectedAction2 = _assign({}, notifs.usageDefaultLimitReachedBanner(plan.free_tickets), {
                type: 'RNS_SHOW_NOTIFICATION'
            })

            // set usage at min limit
            store = mockStore(_assign({}, baseState, {
                billing: baseState.billing.setIn(['currentUsage', 'data', 'tickets'], ticketsMinLimit)
            }))
            // account has reached default limit
            store.dispatch({
                type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                resp: {
                    data: {
                        tickets: plan.free_tickets
                    }
                }
            })

            expect(_some(store.getActions(), expectedAction1)).toEqual(true)
            expect(_some(store.getActions(), expectedAction2)).toEqual(true)
        })

        it('should notify when account has reached default limit of free tickets', () => {
            const expectedAction = _assign({}, notifs.usageDefaultLimitReachedBanner(plan.free_tickets), {
                type: 'RNS_SHOW_NOTIFICATION'
            })

            // account has reached min limit
            store.dispatch({
                type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                resp: {
                    data: {
                        tickets: plan.free_tickets
                    }
                }
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should not notify if account reach any limit of free tickets (credit card registered)', () => {
            const expectedAction = {
                type: 'RNS_SHOW_NOTIFICATION'
            }
            store = mockStore(_assign({}, baseState, {
                currentAccount: baseState.currentAccount.merge({meta: {hasCreditCard: true}})
            }))

            // account has reached min limit
            store.dispatch({
                type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                resp: {
                    data: {
                        tickets: ticketsMinLimit
                    }
                }
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(false)

            // account has reached default limit
            store.dispatch({
                type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                resp: {
                    data: {
                        tickets: plan.free_tickets
                    }
                }
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(false)

            // account has reached max limit
            store.dispatch({
                type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                resp: {
                    data: {
                        tickets: ticketsMaxLimit + 99999
                    }
                }
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(false)
        })

        it('should notify when account has new credit card (account deactivated)', () => {
            const expectedAction = _assign({}, notifs.accountDeactivatedCardUpdatedBanner, {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    deactivated_datetime: '2016-11-23T05:11:17.765655+00:00'
                })
            }))

            // user updated credit card
            store.dispatch({
                type: billingTypes.UPDATE_CREDIT_CARD_SUCCESS,
                resp: {}
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should notify when account has new credit card (account activated)', () => {
            const expectedAction = _assign({}, notifs.accountDeactivatedCardUpdatedBanner, {
                type: 'RNS_SHOW_NOTIFICATION'
            })

            // user updated credit card
            store.dispatch({
                type: billingTypes.UPDATE_CREDIT_CARD_SUCCESS,
                resp: {}
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(false)
        })
    })
})
