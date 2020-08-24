import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {OPEN_STATUS, CLOSED_STATUS} from '../../../config/ticket'
import reducer, {initialState} from '../reducers.ts'
import * as newMessageTypes from '../../newMessage/constants.ts'
import * as viewTypes from '../../views/constants'
import * as ticketTypes from '../../ticket/constants'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('customers reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch list', () => {
        const resp = {
            data: [
                {
                    name: 'Alex',
                },
                {
                    name: 'Romain',
                },
            ],
            meta: {
                nb_pages: 2,
                page: 1,
            },
        }

        expect(
            reducer(initialState, {
                type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                viewType: 'customer-list',
                data: resp,
            })
        ).toMatchSnapshot()

        // wrong view type
        expect(
            reducer(initialState, {
                type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                viewType: 'unknown-list',
                data: resp,
            })
        ).toMatchSnapshot()
    })

    it('fetch customer', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_START,
            }).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_SUCCESS,
                resp: {id: 1},
            }).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_ERROR,
            }).toJS()
        ).toMatchSnapshot()
    })

    it('submit customer', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.SUBMIT_CUSTOMER_START,
            }).toJS()
        ).toMatchSnapshot()

        // success
        // update customer
        expect(
            reducer(
                initialState.mergeDeep({
                    items: [{id: 1, name: 'Romain'}],
                    active: {id: 1, name: 'Romain'},
                }),
                {
                    type: types.SUBMIT_CUSTOMER_START,
                    resp: {
                        id: 1,
                        name: 'Alex',
                    },
                    isUpdate: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // create customer
        expect(
            reducer(
                initialState.mergeDeep({
                    items: [{id: 1, name: 'Romain'}],
                    active: {id: 1, name: 'Romain'},
                }),
                {
                    type: types.SUBMIT_CUSTOMER_START,
                    resp: {
                        name: 'Alex',
                    },
                    isUpdate: false,
                }
            ).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(initialState, {
                type: types.SUBMIT_CUSTOMER_ERROR,
            }).toJS()
        ).toMatchSnapshot()
    })

    it('delete customer', () => {
        expect(
            reducer(
                initialState.mergeDeep({
                    items: [{id: 1}, {id: 2}],
                }),
                {
                    type: types.DELETE_CUSTOMER_SUCCESS,
                    customerId: 2,
                }
            )
        ).toMatchSnapshot()
    })

    it('fetch customer history', () => {
        const fetchCustomerHistoryStartState = reducer(initialState, {
            type: types.FETCH_CUSTOMER_HISTORY_START,
        })
        // start
        expect(fetchCustomerHistoryStartState.toJS()).toMatchSnapshot()

        // success
        expect(
            reducer(fetchCustomerHistoryStartState, {
                type: types.FETCH_CUSTOMER_HISTORY_SUCCESS,
                resp: {
                    meta: {
                        item_count: 2,
                    },
                    data: [
                        {id: 1, created_datetime: '2018-01-01'},
                        {id: 2, created_datetime: '2018-01-02'},
                        {id: 3, created_datetime: '2018-01-05'},
                        {id: 4, created_datetime: '2018-01-04'},
                        {id: 5, created_datetime: '2018-01-03'},
                    ],
                },
            }).toJS()
        ).toMatchSnapshot()

        // success but no history
        expect(
            reducer(fetchCustomerHistoryStartState, {
                type: types.FETCH_CUSTOMER_HISTORY_SUCCESS,
                resp: {
                    meta: {
                        item_count: 1,
                    },
                    data: [{id: 1}],
                },
            }).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(fetchCustomerHistoryStartState, {
                type: types.FETCH_CUSTOMER_HISTORY_ERROR,
            }).toJS()
        ).toMatchSnapshot()
    })

    it('clear ticket', () => {
        expect(
            reducer(initialState, {
                type: ticketTypes.CLEAR_TICKET,
            }).toJS()
        ).toMatchSnapshot()
    })

    it('should update history on new message', () => {
        const state = initialState.setIn(
            ['customerHistory', 'tickets'],
            fromJS([
                {id: 1, excerpt: 'OK', messages_count: 1, status: OPEN_STATUS},
                {
                    id: 2,
                    excerpt: 'Alright',
                    messages_count: 3,
                    status: OPEN_STATUS,
                },
            ])
        )

        expect(
            reducer(state, {
                type: newMessageTypes.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_SUCCESS,
                resp: {
                    body_text: 'Glad to have helped you!',
                    ticket_id: 2,
                },
            }).toJS()
        ).toMatchSnapshot()
    })

    it('should update history ticket on partial update', () => {
        const state = initialState.setIn(
            ['customerHistory', 'tickets'],
            fromJS([
                {id: 1, excerpt: 'OK', status: OPEN_STATUS},
                {id: 2, excerpt: 'Alright', status: OPEN_STATUS},
            ])
        )

        expect(
            reducer(state, {
                type: ticketTypes.TICKET_PARTIAL_UPDATE_SUCCESS,
                resp: {
                    id: 1,
                    assignee_user: {
                        name: 'New Assignee',
                    },
                    subject: 'New subject',
                    status: CLOSED_STATUS,
                },
            }).toJS()
        ).toMatchSnapshot()
    })

    it('bulk delete', () => {
        // success
        expect(
            reducer(
                initialState.mergeDeep({
                    items: [
                        {
                            id: 1,
                            name: 'Alex',
                        },
                        {
                            id: 2,
                            name: 'Romain',
                        },
                        {
                            id: 3,
                            name: 'Julien',
                        },
                    ],
                }),
                {
                    type: viewTypes.BULK_DELETE_SUCCESS,
                    viewType: 'customer-list',
                    ids: [1, 2],
                }
            )
        ).toMatchSnapshot()
    })

    it('merge customers', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.MERGE_CUSTOMERS_START,
            }).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState.mergeDeep({
                    active: {id: 1, name: 'Romain'},
                }),
                {
                    type: types.MERGE_CUSTOMERS_SUCCESS,
                    resp: {id: 1, name: 'Alex'},
                }
            ).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(
                initialState.mergeDeep({
                    active: {id: 1, name: 'Romain'},
                }),
                {
                    type: types.MERGE_CUSTOMERS_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })
})
