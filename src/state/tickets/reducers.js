import * as types from './constants'
import {fromJS, List} from 'immutable'

export const initialState = fromJS({
    items: [],
    _internal: {
        selectedItemsIds: [],
        loading: {
            fetchList: false
        }
    }
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_TICKET_LIST_VIEW_START: {
            return state
                .setIn(['_internal', 'currentViewId'], action.viewId)
                .setIn(['_internal', 'loading', 'fetchList'], true)
                .setIn(['_internal', 'selectedItemsIds'], fromJS([]))
        }

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

        case types.BULK_DELETE_SUCCESS: {
            const ids = action.ids

            return state
                .merge({
                    items: state.get('items').filter(item => !~ids.indexOf(item.get('id')))
                })
                .setIn(['_internal', 'selectedItemsIds'], List())
        }

        case types.SAVE_INDEX: {
            return state.setIn(['_internal', 'currentTicketIndex'], action.currentTicketIndex)
        }

        case types.SET_PAGE: {
            return state.setIn(['_internal', 'pagination', 'page'], action.page)
        }

        default:
            return state
    }
}
