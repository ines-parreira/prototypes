import * as actions from '../actions/systemMessage'
import {Map} from 'immutable'

const initial = Map()

export function systemMessage(state = initial, action) {
    switch (action.type) {
        case actions.SYSTEM_MESSAGE:
            return Map(action.message)
        case actions.DISMISS_SYSTEM_MESSAGE:
            return initial
        default:
            return state
    }
}
