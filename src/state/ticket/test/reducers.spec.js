import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as newMessageTypes from '../../newMessage/constants'
import * as userTypes from '../../users/constants'
import * as types from '../constants'
import * as ticketFixtures from '../../../fixtures/ticket'

// mock Date object
const DATE_TO_USE = new Date('2017')
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.toISOString = Date.toISOString

jest.mock('../../newMessage/ticketReplyCache', () => {
    const Immutable = require.requireActual('immutable')

    return {
        _keys: jest.fn(),
        _id: jest.fn(),
        set: jest.fn(),
        get: jest.fn(() => Immutable.fromJS({})),
        delete: jest.fn(),
    }
})

jest.addMatchers(immutableMatchers)

describe('ticket reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('update message', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.UPDATE_TICKET_MESSAGE_START,
                    messageId: 1,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('submit new message', () => {
        const newMessage = {
            source: {
                type: 'email',
                from: {},
                to: [{address: 'alex@gorgias.io'}],
                cc: [],
                bcc: [],
            },
            body_text: 'hello',
            body_html: '<div>hello</div>',
            channel: 'email',
        }

        // start
        expect(
            reducer(
                initialState,
                {
                    type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                    message: newMessage,
                    messageId: '123', // fake message id attributed in submit action,
                    retry: false,
                    status: 'open',
                }
            ).toJS()
        ).toMatchSnapshot()

        const retryMessage = {
            ...newMessage,
            _internal: {
                id: 1,
                status: 'open',
            },
            originalMessage: newMessage,
            created_datetime: '2017-07-29T22:00:00',
        }

        // error
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        _internal: {
                            pendingMessages: [retryMessage]
                        }
                    }),
                {
                    type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                    message: newMessage,
                    messageId: 1,
                }
            ).toJS()
        ).toMatchSnapshot()

        // start retry
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        _internal: {
                            pendingMessages: [{
                                ...retryMessage,
                                failed_datetime: '2017-07-29T22:01:00',
                            }]
                        }
                    }),
                {
                    type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                    message: retryMessage.originalMessage,
                    messageId: 1,
                    retry: true,
                    status: 'open',
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('submit ticket', () => {
        // success
        expect(
            reducer(
                initialState,
                {
                    type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                    resp: {
                        id: 12,
                        subject: 'title',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('fetch ticket', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_TICKET_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        const ticket = {
            id: 1,
            subject: 'title',
            messages: [{
                id: 1,
                body_text: 'hello',
                body_html: '<div>hello</div>',
                channel: 'email',
            }],
            customer: {
                id: 1,
                data: {hello: 'world!'},
            },
        }

        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_TICKET_SUCCESS,
                    resp: ticket,
                }
            ).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_TICKET_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('clear ticket', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep(ticketFixtures.ticket),
                {
                    type: types.CLEAR_TICKET,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('add tags', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.ADD_TICKET_TAGS,
                    args: fromJS({
                        tags: 'billing, refund',
                    })
                }
            ).toJS()
        ).toMatchSnapshot()

        // already existing
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        tags: [{name: 'billing'}],
                    }),
                {
                    type: types.ADD_TICKET_TAGS,
                    args: fromJS({
                        tags: 'billing, refund',
                    })
                }
            ).toJS()
        ).toMatchSnapshot()

        // empty tags
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        tags: [{name: 'billing'}],
                    }),
                {
                    type: types.ADD_TICKET_TAGS,
                    args: fromJS({
                        tags: '',
                    })
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('remove tag', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        tags: [{name: 'billing'}, {name: 'refund'}],
                    }),
                {
                    type: types.REMOVE_TICKET_TAG,
                    args: fromJS({
                        tag: 'billing',
                    })
                }
            ).toJS()
        ).toMatchSnapshot()

        // empty tags
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        tags: [{name: 'billing'}],
                    }),
                {
                    type: types.REMOVE_TICKET_TAG,
                    args: fromJS({
                        tag: '',
                    })
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set request', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        messages: [{
                            id: 1,
                            request_id: 1,
                        }]
                    }),
                {
                    type: types.SET_TICKET_MESSAGE_REQUEST,
                    messageId: 1,
                    requestId: 2
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('remove request', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        messages: [{
                            id: 1,
                            request_id: 1,
                        }]
                    }),
                {
                    type: types.REMOVE_TICKET_MESSAGE_REQUEST,
                    messageId: 1
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set spam', () => {
        // set true
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_SPAM,
                    spam: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // set false
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        spam: true,
                    }),
                {
                    type: types.SET_SPAM,
                    spam: false,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set trash', () => {
        expect(
            reducer(initialState, {type: types.SET_TRASHED, trashed_datetime: 'trashed_datetime'})
        ).toEqualImmutable(
            initialState.set('trashed_datetime', 'trashed_datetime')
        )
    })

    it('set snooze', () => {
        const action = {
            type: types.SET_SNOOZE,
            snooze_datetime: '2017-01-21 18:20:02',
            status: 'closed'
        }
        expect(
            reducer(initialState, action)
        ).toEqualImmutable(
            initialState
                .set('snooze_datetime', action.snooze_datetime)
                .set('status', action.status)
        )
    })

    it('set agent', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_AGENT,
                    args: fromJS({
                        assignee_user: {id: 1},
                    })
                }
            ).toJS()
        ).toMatchSnapshot()

        // unassigned
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_AGENT,
                    args: fromJS({}),
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set status', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_STATUS,
                    args: fromJS({
                        status: 'closed',
                    })
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set subject', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_SUBJECT,
                    args: fromJS({
                        subject: 'another title',
                    })
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set customer', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_CUSTOMER,
                    args: fromJS({
                        customer: {
                            id: 1,
                            data: {hello: 'world!'},
                        },
                    })
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('apply macro', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.APPLY_MACRO,
                    macro: fromJS({id: 1})
                }
            ).toJS()
        ).toMatchSnapshot()

        // replace previous macro
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        state: {
                            appliedMacro: {id: 1},
                        },
                    }),
                {
                    type: types.APPLY_MACRO,
                    macro: fromJS({id: 2})
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('clear applied macro', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        state: {
                            appliedMacro: {id: 1},
                        },
                    }),
                {
                    type: types.CLEAR_APPLIED_MACRO,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('update macro action args on applied', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        state: {
                            appliedMacro: {id: 1},
                        },
                    }),
                {
                    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
                    actionIndex: 0,
                    value: {
                        hello: 'world',
                    },
                    ticketId: 1,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('delete macro action args on applied', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        state: {
                            appliedMacro: {
                                id: 1,
                                actions: {
                                    '0': {
                                        arguments: {
                                            hello: 'world',
                                        }
                                    },
                                    '1': {
                                        arguments: {
                                            foo: 'bar',
                                        }
                                    }
                                }
                            },
                        },
                    }),
                {
                    type: types.DELETE_ACTION_ON_APPLIED,
                    actionIndex: 0,
                    ticketId: 1,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('mark dirty', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.MARK_TICKET_DIRTY,
                    dirty: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // set false
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        state: {
                            dirty: true,
                        },
                    }),
                {
                    type: types.MARK_TICKET_DIRTY,
                    dirty: false,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('delete message', () => {
        // success
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        messages: [{
                            id: 1,
                        }, {
                            id: 2,
                        }]
                    }),
                {
                    type: types.DELETE_TICKET_MESSAGE_SUCCESS,
                    messageId: 2,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('toggle history', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.TOGGLE_HISTORY,
                    state: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // set false
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        _internal: {
                            displayHistory: true,
                        },
                    }),
                {
                    type: types.TOGGLE_HISTORY,
                    state: false,
                }
            ).toJS()
        ).toMatchSnapshot()

        // invert previous value if no passed state
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        _internal: {
                            displayHistory: false,
                        },
                    }),
                {
                    type: types.TOGGLE_HISTORY,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('display history on next page', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.DISPLAY_HISTORY_ON_NEXT_PAGE,
                    state: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // set false
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        _internal: {
                            shouldDisplayHistoryOnNextPage: true,
                        },
                    }),
                {
                    type: types.DISPLAY_HISTORY_ON_NEXT_PAGE,
                    state: false,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('merge users', () => {
        // success
        // should do nothing since there is no customer in state for now
        expect(
            reducer(
                initialState,
                {
                    type: userTypes.MERGE_USERS_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // should replace customer
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        customer: {
                            id: 1,
                            name: 'Romain',
                        },
                    }),
                {
                    type: userTypes.MERGE_USERS_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('merge ticket', () => {
        const ticket = {
            id: 1,
            subject: 'title',
            messages: [{ // deliberately not ordered
                id: 2,
                body_text: 'hello',
                body_html: '<div>hello</div>',
                channel: 'email',
                created_datetime: '2017-07-29T22:00:00',
            }, {
                id: 1,
                body_text: 'hi',
                body_html: '<div>hi</div>',
                channel: 'email',
                created_datetime: '2017-07-28T22:00:00',
            }],
            customer: {
                id: 1,
                data: {hello: 'world!'},
            },
        }

        // merge ticket and order messages
        expect(
            reducer(
                initialState,
                {
                    type: types.MERGE_TICKET,
                    ticket,
                }
            ).toJS()
        ).toMatchSnapshot()

        // remove pending message
        expect(
            reducer(
                initialState
                    .mergeDeep(ticket)
                    .mergeDeep({
                        _internal: {
                            pendingMessages: [{
                                body_text: 'hello',
                                body_html: '<div>hello</div>',
                                channel: 'email',
                            }],
                        },
                    }),
                {
                    type: types.MERGE_TICKET,
                    ticket,
                    messagesDifference: 1,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('merge customer', () => {
        // should do nothing since there is no customer in state for now
        expect(
            reducer(
                initialState,
                {
                    type: types.MERGE_CUSTOMER,
                    user: {
                        id: 1,
                        name: 'Alex',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // should replace customer
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        customer: {
                            id: 1,
                            name: 'Romain',
                        },
                    }),
                {
                    type: types.MERGE_CUSTOMER,
                    user: {
                        id: 1,
                        name: 'Alex',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('delete pending message', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        _internal: {
                            pendingMessages: [{
                                _internal: {
                                    id: 1,
                                },
                                body_text: 'hello',
                                body_html: '<div>hello</div>',
                                channel: 'email',
                            }, {
                                _internal: {
                                    id: 2,
                                },
                                body_text: 'hello',
                                body_html: '<div>hello</div>',
                                channel: 'email',
                            }],
                        },
                    }),
                {
                    type: types.DELETE_TICKET_PENDING_MESSAGE,
                    message: fromJS({
                        _internal: {
                            id: 1,
                        },
                        body_text: 'hello',
                        body_html: '<div>hello</div>',
                        channel: 'email',
                    }),
                }
            ).toJS()
        ).toMatchSnapshot()
    })
})
