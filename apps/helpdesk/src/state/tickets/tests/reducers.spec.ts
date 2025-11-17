import { fromJS } from 'immutable'

import { ViewType } from 'models/view/types'
import * as ticketTypes from 'state/ticket/constants'
import * as types from 'state/tickets/constants'
import reducer, { initialState } from 'state/tickets/reducers'
import type { GorgiasAction } from 'state/types'
import * as viewTypes from 'state/views/constants'

describe('tickets reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState,
        )
    })

    it('fetch list with highlights', () => {
        const resp = {
            data: [
                {
                    name: 'A ticket',
                    highlights: {},
                },
                {
                    name: 'Another ticket',
                    highlights: {},
                },
            ],
        }

        expect(
            reducer(initialState, {
                type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                viewType: ViewType.TicketList,
                fetched: resp,
            }),
        ).toEqualImmutable(initialState.set('items', fromJS(resp.data)))
    })

    it('should ignore payloads with non ticket viewType on fetch list with highlights', () => {
        expect(
            reducer(initialState, {
                type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                viewType: ViewType.CustomerList,
                data: {},
                withHighlight: true,
            }),
        ).toEqualImmutable(initialState)
    })

    it('bulk delete', () => {
        const tickets = [
            {
                id: 1,
                name: 'A ticket',
            },
            {
                id: 2,
                name: 'Another ticket',
            },
            {
                id: 3,
                name: 'Another nice ticket',
            },
        ]

        expect(
            reducer(initialState.set('items', fromJS(tickets)), {
                type: viewTypes.BULK_DELETE_SUCCESS,
                viewType: ViewType.TicketList,
                ids: [1, 2],
            }),
        ).toEqualImmutable(initialState.set('items', fromJS([tickets[2]])))
    })

    it('should ignore payloads with non ticket viewType on bulk delete', () => {
        const tickets = [
            {
                id: 1,
                name: 'A ticket',
            },
            {
                id: 2,
                name: 'Another ticket',
            },
            {
                id: 3,
                name: 'Another nice ticket',
            },
        ]
        const state = initialState.set('items', fromJS(tickets))

        expect(
            reducer(state, {
                type: viewTypes.BULK_DELETE_SUCCESS,
                viewType: ViewType.CustomerList,
                ids: [1, 2],
            }),
        ).toEqualImmutable(state)
    })

    it('fetch ticket', () => {
        const tickets = [
            {
                id: 1,
                name: 'A ticket',
            },
            {
                id: 2,
                name: 'Another ticket',
            },
        ]
        const state = initialState.set('items', fromJS(tickets))

        expect(
            reducer(state, {
                type: ticketTypes.FETCH_TICKET_SUCCESS,
                ticketId: 2,
            }),
        ).toEqualImmutable(
            initialState.set(
                'items',
                fromJS([tickets[0], { ...tickets[1], is_unread: false }]),
            ),
        )

        // non existent ticket
        expect(
            reducer(state, {
                type: ticketTypes.FETCH_TICKET_SUCCESS,
                ticketId: 14,
            }),
        ).toEqualImmutable(state)
    })

    it('should update cursor', () => {
        const action = {
            type: types.UPDATE_CURSOR,
            cursor: 'new',
        }
        expect(reducer(initialState, action)).toEqualImmutable(
            initialState.set('cursor', action.cursor),
        )
    })
})
