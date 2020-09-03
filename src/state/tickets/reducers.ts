import {fromJS, Map, List} from 'immutable'

import * as ticketTypes from '../ticket/constants'
import * as viewsTypes from '../views/constants.js'
import {GorgiasAction} from '../types'

import * as types from './constants.js'
import {TicketsState} from './types'

export const initialState: TicketsState = fromJS({
    // The cursor contains the value of an attribute of a ticket used to sort tickets in a view.
    // E.g: if the current view is ordered by `updated_datetime`,
    // the value will be the `updated_datetime` of the current ticket.
    cursor: null,
    items: [],
})

export default function reducer(
    state: TicketsState = initialState,
    action: GorgiasAction
): TicketsState {
    switch (action.type) {
        case types.UPDATE_CURSOR: {
            return state.set('cursor', action.cursor)
        }

        case viewsTypes.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== 'ticket-list') {
                return state
            }

            return state.set(
                'items',
                fromJS((action.data as {data: unknown[]}).data)
            )
        }

        case viewsTypes.BULK_DELETE_SUCCESS: {
            if (action.viewType !== 'ticket-list') {
                return state
            }

            const newItems = (state.get('items', fromJS([])) as List<
                any
            >).filter(
                (item: Map<any, any>) => !action.ids?.includes(item.get('id'))
            )

            return state.set('items', newItems)
        }

        case ticketTypes.FETCH_TICKET_SUCCESS: {
            // if a ticket is fetched, mark it as "read" in the list of tickets, so that it does not appear as having
            // "something new"
            const ticketIndex = (state.get('items', fromJS([])) as List<
                any
            >).findIndex(
                (item: Map<any, any>) => item.get('id') === action.ticketId
            )

            // if ticket is not found in view, don't do anything
            if (!~ticketIndex) {
                return state
            }

            return state.setIn(['items', ticketIndex, 'is_unread'], false)
        }

        default:
            return state
    }
}
