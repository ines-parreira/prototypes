import * as types from './constants'
import {fromJS, Map, List} from 'immutable'

export const initialState = fromJS({
    items: [],
    _internal: {
        selectedItemsIds: [],
        loading: {}
    }
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_TICKET_LIST_VIEW_START:
            return state
                .setIn(['_internal', 'currentViewId'], action.viewId)
                .setIn(['_internal', 'loading', 'fetchList'], true)

        case types.FETCH_TICKET_LIST_VIEW_SUCCESS: {
            // make sure the incoming ticket list is the one the current user is looking at
            if (state.getIn(['_internal', 'currentViewId']) !== action.viewId) {
                return state
            }

            const payload = action.data

            return state
                .merge({
                    items: payload.data
                })
                .setIn(['_internal', 'selectedItemsIds'], List())
                .setIn(['_internal', 'pagination'], fromJS(payload.meta))
                .setIn(['_internal', 'loading', 'fetchList'], false)
        }

        case types.TOGGLE_TICKET_SELECTION: {
            if (action.ticketId === 'all') {
                if (state.getIn(['_internal', 'selectedItemsIds']).size < state.get('items').size) {
                    return state.setIn(
                        ['_internal', 'selectedItemsIds'],
                        state.get('items').map(item => item.get('id'))
                    )
                }

                return state.setIn(['_internal', 'selectedItemsIds'], List())
            }

            const idx = state
                .getIn(['_internal', 'selectedItemsIds'])
                .indexOf(action.ticketId)

            if (~idx) {
                return state.setIn(
                    ['_internal', 'selectedItemsIds'],
                    state.getIn(['_internal', 'selectedItemsIds']).delete(idx)
                )
            }

            return state.setIn(
                ['_internal', 'selectedItemsIds'],
                state.getIn(['_internal', 'selectedItemsIds']).push(action.ticketId)
            )
        }

        case types.BULK_UPDATE_SUCCESS: {
            const updates = action.updates

            return state.set(
                'items',
                state.get('items').map(item => {
                    let newItem = item

                    // updates only tickets which are selectedItemsIds
                    if (~state.getIn(['_internal', 'selectedItemsIds']).indexOf(newItem.get('id'))) {
                        // for each selectedItemsIds ticket, apply to it all updates which were send to the backend
                        for (const key of Object.keys(updates)) {
                            if (key === 'tag') {
                                newItem = newItem.set(
                                    'tags',
                                    newItem.get('tags').push(fromJS(updates[key]))
                                )
                            } else if (key === 'tags') {
                                newItem = newItem.set(
                                    'tags',
                                    newItem.get('tags').concat(fromJS(updates[key]))
                                )
                            } else if (key === 'macro') {
                                /**
                                 * We can push an empty Map instead of rebuilding the message because the ticket
                                 * will be refetched when loading its' TicketView in the meantime, we just want
                                 * the number of messages in the ticket to be updated, for display on the TicketList.
                                 */
                                newItem = newItem.set('messages', newItem.get('messages').push(Map()))
                            } else {
                                newItem = newItem.set(key, fromJS(updates[key]))
                            }
                        }
                    }

                    return newItem
                })
            )
        }

        case types.BULK_DELETE_SUCCESS: {
            const ids = action.ids

            return state
                .merge({
                    items: state.get('items').filter(item => !~ids.indexOf(item.get('id')))
                })
                .setIn(['_internal', 'selectedItemsIds'], List())
        }

        case types.SAVE_INDEX:
            return state
                .setIn(['_internal', 'currentTicketIndex'], action.currentTicketIndex)

        default:
            return state
    }
}
