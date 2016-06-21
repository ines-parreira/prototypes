import * as actions from '../actions/tickets'
import {fromJS, Map, List} from 'immutable'


const ticketsInitial = Map({
    items: List(),
    selected: List(),
    resp_meta: Map(),
    loading: false,
    search: '',
    currentTicketIndex: null
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.FETCH_TICKET_LIST_VIEW_START:
            return state.set('loading', true)

        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return state.merge({
                selected: List(),
                items: fromJS(action.resp.data),
                resp_meta: fromJS(action.resp.meta),
                loading: false,
                search: state.get('search')
            })

        case actions.TOGGLE_TICKET_SELECTION: {
            if (action.ticketId === 'all') {
                if (state.get('selected').size < state.get('items').size) {
                    return state.set('selected', state.get('items').map(item => item.get('id')))
                }

                return state.set('selected', List())
            }

            const idx = state.get('selected').indexOf(action.ticketId)

            if (idx !== -1) {
                return state.set('selected', state.get('selected').delete(idx))
            }

            return state.set('selected', state.get('selected').push(action.ticketId))
        }

        case actions.BULK_UPDATE_SUCCESS:
            return state.set(
                'items',
                state.get('items').map(item => {
                    let newItem = item

                    // updates only tickets which are selected
                    if (state.get('selected').indexOf(newItem.get('id')) !== -1) {
                        // for each selected ticket, apply to it all updates which were send to the backend
                        for (const key of Object.keys(action.updates)) {
                            if (key === 'tag') {
                                newItem = newItem.set(
                                    'tags',
                                    newItem.get('tags').push(fromJS(action.updates[key]))
                                )
                            } else if (key === 'tags') {
                                newItem = newItem.set(
                                    'tags',
                                    newItem.get('tags').concat(fromJS(action.updates[key]))
                                )
                            } else if (key === 'macro') {
                                /**
                                 * We can push an empty Map instead of rebuilding the message because the ticket
                                 * will be refetched when loading its' TicketView; in the meantime, we just want
                                 * the number of messages in the ticket to be updated, for display on the TicketList.
                                 */
                                newItem = newItem.set('messages', newItem.get('messages').push(Map()))
                            } else {
                                newItem = newItem.set(key, fromJS(action.updates[key]))
                            }
                        }
                    }

                    return newItem
                })
            )

        case actions.BULK_DELETE_SUCCESS:
            return state.merge({
                items: state.get('items').filter(item => action.ids.indexOf(item.get('id')) === -1),
                selected: List()
            })

        case actions.SAVE_INDEX:
            return state.set('currentTicketIndex', action.currentTicketIndex)

        default:
            return state
    }
}
