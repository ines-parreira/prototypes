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
            return state.set('selected', List()).set('items', state.get('items').map(item => {
                if (action.key !== 'tags') {
                    if (state.get('selected').indexOf(item.get('id')) !== -1) {
                        return item.set(action.key, action.value)
                    }
                } else {
                    if (state.get('selected').indexOf(item.get('id')) !== -1) {
                        return item.set(
                            'tags',
                            item.get('tags').concat(fromJS(action.value))
                        )
                    }
                }

                return item
            }))

        default:
            return state
    }
}
