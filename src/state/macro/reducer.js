// @flow
import {fromJS} from 'immutable'

import type {actionType} from '../types'

import {UPSERT_MACRO, UPSERT_MACROS, DELETE_MACRO} from './constants'
import type {State, Macro} from './types'

export default function reducer(state: State = fromJS({}), action: actionType) {
    const {type, payload} = action
    switch(type) {
        case UPSERT_MACRO:
            return state.set(payload.get('id'), payload)

        case UPSERT_MACROS:
            return payload.reduce((state: State, macro: Macro) => {
                return state.set(macro.get('id'), macro)
            }, state)

        case DELETE_MACRO:
            return state.delete(payload)
    }
    return state
}
