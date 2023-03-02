import {fromJS} from 'immutable'

import {Team} from 'models/team/types'
import {GorgiasAction} from 'state/types'

import * as constants from './constants'
import {TeamsState} from './types'

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
        case constants.FETCH_TEAMS_SUCCESS: {
            const teams = (action.payload as Team[]).reduce(
                (teams, team) => ({
                    ...teams,
                    [team.id]: team,
                }),
                {}
            )
            return state.mergeIn(['all', fromJS(teams)])
        }
        case constants.FETCH_TEAM_MEMBERS_SUCCESS: {
            return state.setIn(
                ['all', (action.payload as Team).id.toString(), 'members'],
                fromJS((action.payload as Team).members)
            )
        }
        default:
            return state
    }
}
