import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import {ticket} from 'fixtures/ticket'
import {mergeEntitiesWithHighlights} from 'models/search/utils'
import {PickedTicket} from 'pages/common/components/Spotlight/SpotlightTicketRow'

import {GorgiasAction} from 'state/types'
import * as viewTypes from 'state/views/constants'
import * as ticketTypes from 'state/ticket/constants'
import * as types from 'state/tickets/constants'
import reducer, {initialState} from 'state/tickets/reducers'

describe('tickets reducers', () => {
    beforeEach(() => {
        expect.extend(immutableMatchers)
    })

    it('initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState
        )
    })

    it('fetch list', () => {
        const resp = {
            data: [
                {
                    name: 'A ticket',
                },
                {
                    name: 'Another ticket',
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
                viewType: 'ticket-list',
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

    it('fetch list with highlights', () => {
        const resp = {
            data: [
                {
                    type: 'Ticket' as const,
                    entity: {
                        name: 'A ticket',
                        ...ticket,
                    } as unknown as PickedTicket,
                    highlights: {},
                },
                {
                    type: 'Ticket' as const,
                    entity: {name: 'Another ticket'} as unknown as PickedTicket,
                    highlights: {},
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
                viewType: 'ticket-list',
                data: resp,
                withHighlight: true,
            })
        ).toEqualImmutable(
            initialState.set(
                'items',
                fromJS(resp.data.map(mergeEntitiesWithHighlights))
            )
        )
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
                viewType: 'ticket-list',
                ids: [1, 2],
            })
        ).toMatchSnapshot()
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

        expect(
            reducer(initialState.set('items', fromJS(tickets)), {
                type: ticketTypes.FETCH_TICKET_SUCCESS,
                ticketId: 2,
            })
        ).toMatchSnapshot()

        // non existent ticket
        expect(
            reducer(initialState.set('items', fromJS(tickets)), {
                type: ticketTypes.FETCH_TICKET_SUCCESS,
                ticketId: 14,
            })
        ).toMatchSnapshot()
    })

    it('should update cursor', () => {
        const action = {
            type: types.UPDATE_CURSOR,
            cursor: 'new',
        }
        expect(reducer(initialState, action)).toEqualImmutable(
            initialState.set('cursor', action.cursor)
        )
    })
})
