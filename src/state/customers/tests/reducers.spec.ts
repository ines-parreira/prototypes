import {fromJS} from 'immutable'

import {TicketStatus} from 'business/types/ticket'
import {ViewType} from 'models/view/types'
import * as types from 'state/customers/constants'
import reducer, {initialState} from 'state/customers/reducers'
import * as newMessageTypes from 'state/newMessage/constants'
import * as ticketTypes from 'state/ticket/constants'
import {GorgiasAction} from 'state/types'
import * as viewTypes from 'state/views/constants'

describe('customers reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState
        )
    })

    it('fetch list', () => {
        const respWithHighlight = {
            data: [
                {
                    name: 'Alex',
                    highlights: {
                        id: ['1'],
                    },
                },
                {
                    name: 'Romain',
                    highlights: {
                        id: ['2'],
                    },
                },
            ],
        }

        expect(
            reducer(initialState, {
                type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                viewType: ViewType.CustomerList,
                fetched: respWithHighlight,
            })
        ).toEqualImmutable(
            initialState.set('items', fromJS(respWithHighlight.data))
        )

        // wrong view type
        expect(
            reducer(initialState, {
                type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                viewType: ViewType.TicketList,
                data: respWithHighlight,
            })
        ).toEqualImmutable(initialState)
    })

    it('fetch customer', () => {
        const restDataWithHighlights = {
            data: {
                data: [
                    {
                        entity: {id: 1, name: 'Pam'},
                        highlights: {name: ['Pam']},
                    },
                ],
            },
        }
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

        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_SUCCESS,
                resp: restDataWithHighlights,
                withHighlight: true,
            }).toJS()
        ).toEqual(expect.objectContaining({active: restDataWithHighlights}))

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
                {
                    id: 1,
                    excerpt: 'OK',
                    messages_count: 1,
                    status: TicketStatus.Open,
                },
                {
                    id: 2,
                    excerpt: 'Alright',
                    messages_count: 3,
                    status: TicketStatus.Open,
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
                {id: 1, excerpt: 'OK', status: TicketStatus.Open},
                {id: 2, excerpt: 'Alright', status: TicketStatus.Open},
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
                    status: TicketStatus.Closed,
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
                    viewType: ViewType.CustomerList,
                    ids: [1, 2],
                }
            )
        ).toEqualImmutable(
            initialState.mergeDeep({
                items: [
                    {
                        id: 3,
                        name: 'Julien',
                    },
                ],
            })
        )
    })

    it('should ignore payloads with non ticket viewType on bulk delete', () => {
        const state = initialState.mergeDeep({
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
        })

        expect(
            reducer(state, {
                type: viewTypes.BULK_DELETE_SUCCESS,
                viewType: ViewType.TicketList,
                ids: [1, 2],
            })
        ).toEqualImmutable(state)
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
