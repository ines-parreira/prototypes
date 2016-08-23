import * as types from './constants'
import {Map} from 'immutable'

const initial = Map()

export function systemMessage(state = initial, action) {
    switch (action.type) {
        case types.SYSTEM_MESSAGE:
            // Note that some fields in the action message are here for debugging convenience only (e.g internalMessage)
            return Map(action.message)
        case types.DISMISS_SYSTEM_MESSAGE:
            return initial
        default:
            return state
    }
}
