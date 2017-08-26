import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as viewTypes from '../../views/constants'
import * as ticketTypes from '../../ticket/constants'

jest.addMatchers(immutableMatchers)

describe('tickets reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch list', () => {
        const resp = {
            data: [{
                name: 'A ticket'
            }, {
                name: 'Another ticket'
            }],
            meta: {
                nb_pages: 2,
                page: 1
            }
        }

        expect(
            reducer(
                initialState, {
                    type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                    viewType: 'ticket-list',
                    data: resp
                }
            )
        ).toMatchSnapshot()

        // wrong view type
        expect(
            reducer(
                initialState, {
                    type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                    viewType: 'unknown-list',
                    data: resp
                }
            )
        ).toMatchSnapshot()
    })

    it('bulk delete', () => {
        const tickets = [
            {
                id: 1,
                name: 'A ticket'
            },
            {
                id: 2,
                name: 'Another ticket'
            },
            {
                id: 3,
                name: 'Another nice ticket'
            }
        ]

        expect(
            reducer(
                initialState.set('items', fromJS(tickets)),
                {
                    type: viewTypes.BULK_DELETE_SUCCESS,
                    viewType: 'ticket-list',
                    ids: [1, 2]
                }
            )
        ).toMatchSnapshot()
    })

    it('fetch ticket', () => {
        const tickets = [
            {
                id: 1,
                name: 'A ticket'
            },
            {
                id: 2,
                name: 'Another ticket',
            },
        ]

        expect(
            reducer(
                initialState.set('items', fromJS(tickets)),
                {
                    type: ticketTypes.FETCH_TICKET_SUCCESS,
                    ticketId: 2,
                }
            )
        ).toMatchSnapshot()

        // non existent ticket
        expect(
            reducer(
                initialState.set('items', fromJS(tickets)),
                {
                    type: ticketTypes.FETCH_TICKET_SUCCESS,
                    ticketId: 14,
                }
            )
        ).toMatchSnapshot()
    })
})
