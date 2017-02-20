import * as ticketTypes from '../ticket/constants'
import * as viewsTypes from '../views/constants'
import * as tagsTypes from '../tags/constants'
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

            // if ticket is not found in view, don't do anything
            if (!~ticketIndex) {
                return state
            }

            return state.setIn(['items', ticketIndex, 'is_unread'], false)
        }

        case tagsTypes.SAVE_TAG: {
            // update tags in cached tickets
            let tagIndex = -1
            const ticketIndex = state
                .get('items', fromJS([]))
                .findIndex(item => {
                    tagIndex = item
                    .get('tags', fromJS([]))
                    .findIndex(tag => tag.get('id') === action.tag.id)

                    return ~tagIndex
                })

            // if ticket or tag not found
            if (!~ticketIndex || !~tagIndex) {
                return state
            }

            return state.setIn(['items', ticketIndex, 'tags', tagIndex], fromJS(action.tag))
        }

        case tagsTypes.REMOVE_TAG: {
            // remove deleted tag from cached tickets
            let tagIndex = -1
            const ticketIndex = state
                .get('items', fromJS([]))
                .findIndex(item => {
                    tagIndex = item
                    .get('tags', fromJS([]))
                    .findIndex(tag => tag.get('id') === action.id)

                    return ~tagIndex
                })

            // if ticket or tag not found
            if (!~ticketIndex || !~tagIndex) {
                return state
            }

            return state.setIn(['items', ticketIndex, 'tags'],
                state
                .getIn(['items', ticketIndex, 'tags'])
                .splice(tagIndex, 1)
            )
        }

        default:
            return state
    }
}
