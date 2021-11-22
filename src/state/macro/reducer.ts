import {fromJS, Map} from 'immutable'

import {GorgiasAction} from '../types'

import {UPSERT_MACRO, UPSERT_MACROS, DELETE_MACRO} from './constants.js'
import type {State, Macro} from './types'

export default function reducer(
    state: State = fromJS({}),
    action: GorgiasAction
): State {
    const {type, payload} = action as {type: string; payload: Map<any, any>}
    switch (type) {
        case UPSERT_MACRO:
            return state.set(payload.get('id'), payload)

        case UPSERT_MACROS:
            return payload.reduce((acc: State = state, macro: Macro) => {
                return acc.set(macro.get('id'), macro)
            }, state)

        case DELETE_MACRO:
            return state.delete(payload as unknown as number)
    }
    return state
}
