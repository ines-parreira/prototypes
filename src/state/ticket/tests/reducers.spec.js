//@flow
import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, type Record} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as newMessageTypes from '../../newMessage/constants'
import * as customerTypes from '../../customers/constants'
import * as types from '../constants'
import * as ticketFixtures from '../../../fixtures/ticket'
import type {AuditLogEvent} from '../../../models/event'
import {TICKET_CLOSED, TICKET_CREATED, TICKET_REOPENED} from '../../../constants/event'

// mock Date object
const DATE_TO_USE = new Date('2017')
global.Date = (jest.fn(() => DATE_TO_USE): any)
global.Date.toISOString = (Date: any).toISOString

jest.mock('../../newMessage/ticketReplyCache', () => {
    //$FlowFixMe
    const Immutable = require.requireActual('immutable')

    return {
        _keys: jest.fn(),
        _id: jest.fn(),
        set: jest.fn(),
        get: jest.fn(() => Immutable.fromJS({})),
        delete: jest.fn(),
    }
})

jest.mock('../helpers', () => {
    //$FlowFixMe
    const helpers = require.requireActual('../helpers')

    return {
        ...helpers,
        shouldDeduplicateAuditLogEvents: () => false,
    }
})

jest.mock('moment', () => (date) => date)

//$FlowFixMe
jest.addMatchers(immutableMatchers)

describe('ticket reducers', () => {
    it('initial state', () => {
        //$FlowFixMe
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('should handle UPDATE_TICKET_MESSAGE_START', () => {
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

    it('should handle NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START and NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR', () => {
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

    it('should handle NEW_MESSAGE_SUBMIT_TICKET_SUCCESS', () => {
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

    it('should handle FETCH_TICKET_START', () => {
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

    it('should handle CLEAR_TICKET', () => {
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

    it('should handle ADD_TICKET_TAGS', () => {
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

    it('should handle REMOVE_TICKET_TAG', () => {
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

    it('should handle SET_TICKET_MESSAGE_REQUEST', () => {
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

    it('should handle REMOVE_TICKET_MESSAGE_REQUEST', () => {
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

    it('should handle SET_SPAM_START', () => {
        // set true
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_SPAM_START,
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
                    type: types.SET_SPAM_SUCCESS,
                    spam: false,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('should handle SET_SPAM_SUCCESS', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_SPAM_SUCCESS,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('should handle SET_TRASHED_START', () => {
        expect(
            reducer(initialState, {type: types.SET_TRASHED_START, trashed_datetime: 'trashed_datetime'})
        //$FlowFixMe
        ).toEqualImmutable(
            initialState.set('trashed_datetime', 'trashed_datetime')
                .setIn(['_internal', 'loading', 'setTrash'], true)
        )
    })

    it('should handle SET_TRASHED_SUCCESS', () => {
        expect(
            reducer(initialState.setIn(['_internal', 'loading', 'setTrash'], true), {type: types.SET_TRASHED_SUCCESS})
        //$FlowFixMe
        ).toEqualImmutable(
            initialState.setIn(['_internal', 'loading', 'setTrash'], false)
        )
    })

    it('should handle SET_SNOOZE', () => {
        const action = {
            type: types.SET_SNOOZE,
            snooze_datetime: '2017-01-21 18:20:02',
            status: 'closed'
        }
        expect(
            reducer(initialState, action)
        //$FlowFixMe
        ).toEqualImmutable(
            initialState
                .set('snooze_datetime', action.snooze_datetime)
                .set('status', action.status)
        )
    })

    it('should handle SET_AGENT', () => {
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

    it('should handle SET_TEAM', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_TEAM,
                    args: fromJS({
                        assignee_team: {id: 1},
                    })
                }
            ).toJS()
        ).toMatchSnapshot()

        // unassigned
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_TEAM,
                    args: fromJS({}),
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('should handle SET_STATUS', () => {
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

    it('should handle SET_SUBJECT', () => {
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

    it('should handle SET_CUSTOMER', () => {
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

    it('should handle APPLY_MACRO', () => {
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

    it('should handle CLEAR_APPLIED_MACRO', () => {
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

    it('should handle UPDATE_ACTION_ARGS_ON_APPLIED', () => {
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

    it('should handle DELETE_ACTION_ON_APPLIED', () => {
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

    it('should handle MARK_TICKET_DIRTY', () => {
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

    it('should handle DELETE_TICKET_MESSAGE_SUCCESS', () => {
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

    it('should handle TOGGLE_HISTORY', () => {
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

    it('should handle DISPLAY_HISTORY_ON_NEXT_PAGE', () => {
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

    it('should handle MERGE_CUSTOMERS_SUCCESS', () => {
        // success
        // should do nothing since there is no customer in state for now
        expect(
            reducer(
                initialState,
                {
                    type: customerTypes.MERGE_CUSTOMERS_SUCCESS,
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
                    type: customerTypes.MERGE_CUSTOMERS_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('should handle MERGE_TICKET', () => {
        const ticket = fromJS({
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
        })

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

        // keep audit log events
        expect(
            reducer(
                initialState
                    .set('events', fromJS([
                        {object_id: ticket.get('id'), type: TICKET_CREATED},
                        {object_id: ticket.get('id'), type: TICKET_CLOSED},
                        {object_id: ticket.get('id'), type: TICKET_REOPENED},
                    ])),
                {
                    type: types.MERGE_TICKET,
                    ticket,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('should handle MERGE_CUSTOMER', () => {
        // should do nothing since there is no customer in state for now
        expect(
            reducer(
                initialState,
                {
                    type: types.MERGE_CUSTOMER,
                    customer: {
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
                    customer: {
                        id: 1,
                        name: 'Alex',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('should handle DELETE_TICKET_PENDING_MESSAGE', () => {
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

    describe('action ADD_TICKET_AUDIT_LOG_EVENTS', () => {
        const getEvent = (id: number): Record<AuditLogEvent> => fromJS({
            id,
            account_id: 1,
            user_id: 1,
            object_type: 'Ticket',
            object_id: 1,
            data: null,
            context: 'foo',
            type: TICKET_REOPENED,
            created_datetime: '2019-11-15 19:00:00.000000',
        })

        it('should add received event when it is not in the store yet', () => {
            const action = {
                type: types.ADD_TICKET_AUDIT_LOG_EVENTS,
                payload: [getEvent(1)],
            }

            const nextState = reducer(initialState, action)
            expect(nextState.toJS()).toMatchSnapshot()
        })

        it('should update stored event when received event already exists in the store', () => {
            const initialEvent = getEvent(1)
            const updatedEvent = initialEvent.set('data', {foo: 'bar'})

            const action = {
                type: types.ADD_TICKET_AUDIT_LOG_EVENTS,
                payload: [updatedEvent],
            }

            const nextState = reducer(initialState.mergeDeep({events: [initialEvent]}), action)
            expect(nextState.toJS()).toMatchSnapshot()
        })

        it('should add new received event, and update existing one', () => {
            const initialEvent = getEvent(1)
            const updatedEvent = initialEvent.set('type', TICKET_CLOSED).set('data', {foo: 'bar'})
            const newEvent = getEvent(2)

            const action = {
                type: types.ADD_TICKET_AUDIT_LOG_EVENTS,
                payload: [updatedEvent, newEvent],
            }

            const nextState = reducer(initialState.mergeDeep({events: [initialEvent]}), action)
            expect(nextState.toJS()).toMatchSnapshot()
        })
    })

    describe('action REMOVE_TICKET_AUDIT_LOG_EVENTS', () => {
        const getEvent = (id: number, type: string): Record<AuditLogEvent> => fromJS({
            id,
            account_id: 1,
            user_id: 1,
            object_type: 'Ticket',
            object_id: 1,
            data: null,
            context: 'foo',
            type,
            created_datetime: '2019-11-15 19:00:00.000000',
        })

        it('should remove audit log events', () => {
            const auditLogEvent = getEvent(1, TICKET_REOPENED)
            const randomEvent = getEvent(2, 'foo')

            const action = {
                type: types.REMOVE_TICKET_AUDIT_LOG_EVENTS,
            }

            const nextState = reducer(initialState.mergeDeep({events: [auditLogEvent, randomEvent]}), action)
            expect(nextState.toJS()).toMatchSnapshot()
        })
    })

    describe('action TICKET_MESSAGE_DELETED', () => {
        it('should remove message', () => {
            const action = {
                type: types.TICKET_MESSAGE_DELETED,
                payload: '123',
            }
            const nextState = reducer(initialState.mergeDeep({
                _internal: {
                    pendingMessages: [{
                        _internal: {
                            id: 123,
                        },
                    }],
                },
            }), action)
            expect(nextState.toJS()).toMatchSnapshot()
        })
    })
})
