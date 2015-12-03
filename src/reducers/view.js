import * as actions from '../actions/view'
import {List} from 'immutable'

export function views(state = List([]), action) {
    switch (action.type) {
        case actions.NEW_VIEW:
            return state
        case actions.FETCH_VIEW_LIST_START:
            // here we should probably set the state as fetching (display that something is happening in the UI)
            return state
        case actions.FETCH_VIEW_LIST_SUCCESS:
            return List(action.resp.data)
        default:
            return state
    }
}
