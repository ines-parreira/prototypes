import { fromJS, Map } from 'immutable'

import { GorgiasAction } from '../types'
import {
    DELETE_MACRO,
    MACRO_PARAMS_UPDATED,
    UPSERT_MACRO,
    UPSERT_MACROS,
} from './constants'
import type { Macro, State } from './types'

export default function reducer(
    state: State = fromJS({}),
    action: GorgiasAction,
): State {
    const { type, payload } = action as { type: string; payload: Map<any, any> }
    switch (type) {
        case UPSERT_MACRO:
            return state.setIn(['items', payload.get('id')], payload)

        case UPSERT_MACROS:
            return payload.reduce((acc: State = state, macro: Macro) => {
                return acc.setIn(['items', macro.get('id')], macro)
            }, state)

        case DELETE_MACRO:
            return state.deleteIn(['items', payload as unknown as number])

        case MACRO_PARAMS_UPDATED:
            return state.set('parameters_options', payload)
    }
    return state
}
