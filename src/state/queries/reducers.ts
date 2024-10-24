import {GorgiasAction} from 'state/types'
import {getMoment} from 'utils/date'

import * as constants from './constants'
import {QueriesState} from './types'

export const initialState: QueriesState = {
    timestamp: {},
}

export default function reducer(
    state: QueriesState = initialState,
    action: GorgiasAction
): QueriesState {
    switch (action.type) {
        case constants.UPDATE_QUERY_TIMESTAMP: {
            return action.queryKey
                ? {
                      ...state,
                      timestamp: {
                          ...state.timestamp,
                          [action.queryKey]: getMoment().unix(),
                      },
                  }
                : state
        }
        default:
            return state
    }
}
