import * as constants from '../constants/ticket'
import Immutable from 'immutable'

const initialState = Immutable.List([])

export function tickets(state = initialState, action) {
    switch (action.type) {
        case constants.NEW_TICKET:
            return state
        case constants.FETCH_VIEW_START:
            // here we should probably set the state as fetching (display that something is happening in the UI)
            return state
        case constants.FETCH_VIEW_FINISH:
            console.log(state);
            return state
        default:
            return state
    }
}
