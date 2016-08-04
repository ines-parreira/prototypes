import * as types from '../constants/tickets'
import {fromJS, Map, List} from 'immutable'

const ticketsInitial = Map({
    items: List(),
    selected: List(),
    resp_meta: Map(),
    loading: false,
    search: '',
    currentTicketIndex: null,
    viewId: null
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case types.FETCH_TICKET_LIST_VIEW_START:
            return ticketsInitial.set('loading', true).set('viewId', action.viewId)

        case types.FETCH_TICKET_LIST_VIEW_SUCCESS: {
            const payload = action.data

            if (state.get('viewId') !== action.viewId) {
                return state
            }

            return state.merge({
                selected: List(),
                items: fromJS(payload.data),
                resp_meta: fromJS(payload.meta),
                loading: false,
                search: state.get('search')
            })
        }

        case types.TOGGLE_TICKET_SELECTION: {
            if (action.ticketId === 'all') {
                if (state.get('selected').size < state.get('items').size) {
                    return state.set('selected', state.get('items').map(item => item.get('id')))
                }

                return state.set('selected', List())
            }

            const idx = state.get('selected').indexOf(action.ticketId)

            if (~idx) {
                return state.set('selected', state.get('selected').delete(idx))
            }

            return state.set('selected', state.get('selected').push(action.ticketId))
        }

        case types.BULK_UPDATE_SUCCESS: {
            const updates = action.updates

            return state.set(
                'items',
                state.get('items').map(item => {
                    let newItem = item

                    // updates only tickets which are selected
                    if (~state.get('selected').indexOf(newItem.get('id'))) {
                        // for each selected ticket, apply to it all updates which were send to the backend
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
                                 * will be refetched when loading its' TicketView; in the meantime, we just want
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

            return state.merge({
                items: state.get('items').filter(item => !~ids.indexOf(item.get('id'))),
                selected: List()
            })
        }

        case types.SAVE_INDEX:
            return state.set('currentTicketIndex', action.currentTicketIndex)

        default:
            return state
    }
}
