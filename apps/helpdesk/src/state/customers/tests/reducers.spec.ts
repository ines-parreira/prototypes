import { fromJS } from 'immutable'

import { ViewType } from 'models/view/types'
import * as types from 'state/customers/constants'
import reducer, { initialState } from 'state/customers/reducers'
import type { GorgiasAction } from 'state/types'
import * as viewTypes from 'state/views/constants'

describe('customers reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState,
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
            }),
        ).toEqualImmutable(
            initialState.set('items', fromJS(respWithHighlight.data)),
        )

        // wrong view type
        expect(
            reducer(initialState, {
                type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                viewType: ViewType.TicketList,
                data: respWithHighlight,
            }),
        ).toEqualImmutable(initialState)
    })

    it('fetch customer', () => {
        const restDataWithHighlights = {
            data: {
                data: [
                    {
                        entity: { id: 1, name: 'Pam' },
                        highlights: { name: ['Pam'] },
                    },
                ],
            },
        }
        // start
        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_START,
            }).toJS(),
        ).toMatchSnapshot()

        // success
        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_SUCCESS,
                resp: { id: 1 },
            }).toJS(),
        ).toMatchSnapshot()

        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_SUCCESS,
                resp: restDataWithHighlights,
                withHighlight: true,
            }).toJS(),
        ).toEqual(expect.objectContaining({ active: restDataWithHighlights }))

        // error
        expect(
            reducer(initialState, {
                type: types.FETCH_CUSTOMER_ERROR,
            }).toJS(),
        ).toMatchSnapshot()
    })

    it('submit customer', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.SUBMIT_CUSTOMER_START,
            }).toJS(),
        ).toMatchSnapshot()

        // success
        // update customer
        expect(
            reducer(
                initialState.mergeDeep({
                    items: [{ id: 1, name: 'Romain' }],
                    active: { id: 1, name: 'Romain' },
                }),
                {
                    type: types.SUBMIT_CUSTOMER_START,
                    resp: {
                        id: 1,
                        name: 'Alex',
                    },
                    isUpdate: true,
                },
            ).toJS(),
        ).toMatchSnapshot()

        // create customer
        expect(
            reducer(
                initialState.mergeDeep({
                    items: [{ id: 1, name: 'Romain' }],
                    active: { id: 1, name: 'Romain' },
                }),
                {
                    type: types.SUBMIT_CUSTOMER_START,
                    resp: {
                        name: 'Alex',
                    },
                    isUpdate: false,
                },
            ).toJS(),
        ).toMatchSnapshot()

        // error
        expect(
            reducer(initialState, {
                type: types.SUBMIT_CUSTOMER_ERROR,
            }).toJS(),
        ).toMatchSnapshot()
    })

    it('delete customer', () => {
        expect(
            reducer(
                initialState.mergeDeep({
                    items: [{ id: 1 }, { id: 2 }],
                }),
                {
                    type: types.DELETE_CUSTOMER_SUCCESS,
                    customerId: 2,
                },
            ),
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
                },
            ),
        ).toEqualImmutable(
            initialState.mergeDeep({
                items: [
                    {
                        id: 3,
                        name: 'Julien',
                    },
                ],
            }),
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
            }),
        ).toEqualImmutable(state)
    })

    it('merge customers', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.MERGE_CUSTOMERS_START,
            }).toJS(),
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState.mergeDeep({
                    active: { id: 1, name: 'Romain' },
                }),
                {
                    type: types.MERGE_CUSTOMERS_SUCCESS,
                    resp: { id: 1, name: 'Alex' },
                },
            ).toJS(),
        ).toMatchSnapshot()

        // error
        expect(
            reducer(
                initialState.mergeDeep({
                    active: { id: 1, name: 'Romain' },
                }),
                {
                    type: types.MERGE_CUSTOMERS_ERROR,
                },
            ).toJS(),
        ).toMatchSnapshot()
    })
})
