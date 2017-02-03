import * as ticketTypes from '../ticket/constants'
import * as viewsTypes from '../views/constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    items: [],
})

export default (state = initialState, action) => {
    switch (action.type) {
        case viewsTypes.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== 'ticket-list') {
                return state
            }

            const payload = action.data

            return state.set('items', fromJS(payload.data))
        }

        case viewsTypes.BULK_DELETE_SUCCESS: {
            if (action.viewType !== 'ticket-list') {
                return state
            }

            const newItems = state
                .get('items', fromJS([]))
                .filter(item => !action.ids.includes(item.get('id')))

            return state.set('items', newItems)
        }

        case ticketTypes.FETCH_TICKET_SUCCESS: {
            // if a ticket is fetched, mark it as "read" in the list of tickets, so that it does not appear as having
            // "something new"
            const ticketIndex = state
                .get('items', fromJS([]))
                .findIndex(item => item.get('id') === action.ticketId)

            return state.setIn(['items', ticketIndex, 'is_unread'], false)
        }

        default:
            return state
    }
}
