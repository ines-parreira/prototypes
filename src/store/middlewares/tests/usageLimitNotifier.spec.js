import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _assign from 'lodash/assign'
import _some from 'lodash/some'
import {fromJS} from 'immutable'
import usageLimitNotifier, {PAYMENT_MODAL} from '../usageLimitNotifier'
import * as ticketTypes from '../../../state/ticket/constants'
import * as newMessageTypes from '../../../state/newMessage/constants'
import plan from '../../../fixtures/plan'
import moment from 'moment'

const middlewares = [thunk, usageLimitNotifier]
const mockStore = configureMockStore(middlewares)

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
        status: {
            status: 'active'
        },
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

        it('should notify when the user tries to send a message (account deactivated)', () => {
            const expectedAction = _assign({}, PAYMENT_MODAL, {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    status: {
                        status: 'deactivated',
                    }
                })
            }))
            store.dispatch({
                type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START
            })
            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should not notify when the user tries to send a message (account activated)', () => {
            store.dispatch({
                type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })

        it('should notify when the user try to send a message (account inactive)', () => {
            const expectedAction = _assign({}, PAYMENT_MODAL, {
                type: 'RNS_SHOW_NOTIFICATION'
            })
            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    status: {
                        status: 'deactivated',
                    }
                })
            }))
            store.dispatch({
                type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should notify when the user tries to open a ticket (account deactivated)', () => {
            const expectedAction = _assign({}, PAYMENT_MODAL, {
                type: 'RNS_SHOW_NOTIFICATION'
            })

            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    status: {
                        status: 'deactivated',
                    }
                })
            }))

            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START,
                displayLoading: true
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should notify (with message) when the user tries to open a ticket (account deactivated)', () => {
            const expectedAction = _assign({}, PAYMENT_MODAL, {
                type: 'RNS_SHOW_NOTIFICATION'
            })

            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    status: {
                        status: 'deactivated',
                        notification: {
                            type: 'error',
                            message: 'Limit reached'
                        }
                    }
                })
            }))

            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START,
                displayLoading: true
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(true)
        })

        it('should not notify (with message) when the user tries to open a ticket (account active)', () => {
            const expectedAction = _assign({}, PAYMENT_MODAL, {
                type: 'RNS_SHOW_NOTIFICATION'
            })

            // deactivate account
            store = mockStore(_assign({}, baseState, {
                currentAccount: fromJS({
                    status: {
                        status: 'active',
                        notification: {
                            type: 'info',
                            message: 'Limit reached'
                        }
                    }
                })
            }))

            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START,
                displayLoading: true
            })

            expect(_some(store.getActions(), expectedAction)).toEqual(false)
        })

        it('should not notify when the user tries to open a ticket (account activated)', () => {
            store.dispatch({
                type: ticketTypes.FETCH_TICKET_START
            })

            expect(_some(store.getActions(), {
                type: 'RNS_SHOW_NOTIFICATION'
            })).toEqual(false)
        })
    })
})
