import {fromJS} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants.js'
import {TeamsState, Team} from './types'

export const initialState: TeamsState = fromJS({
    all: {},
})

export default function reducer(
    state: TeamsState = initialState,
    action: GorgiasAction
): TeamsState {
    switch (action.type) {
        case constants.CREATE_TEAM_SUCCESS:
        case constants.UPDATE_TEAM_SUCCESS:
        case constants.FETCH_TEAM_SUCCESS:
            return state.setIn(
                ['all', (action.payload as Team).id.toString()],
                fromJS(action.payload)
            )
        case constants.DELETE_TEAM_SUCCESS:
            return state.deleteIn([
                'all',
                (action.payload as number).toString(),
            ])
        default:
            return state
    }
}
