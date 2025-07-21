import { Team } from 'models/team/types'
import { StoreDispatch } from 'state/types'

import {
    DELETE_TEAM_SUCCESS,
    FETCH_TEAM_MEMBERS_SUCCESS,
    FETCH_TEAM_SUCCESS,
    UPDATE_TEAM_SUCCESS,
} from './constants'

export const fetchTeamMembersSuccess =
    (team: Pick<Team, 'id' | 'members'>) => (dispatch: StoreDispatch) =>
        dispatch({
            type: FETCH_TEAM_MEMBERS_SUCCESS,
            payload: team,
        })

export const deleteTeamSuccess = (id: number) => (dispatch: StoreDispatch) =>
    dispatch({
        type: DELETE_TEAM_SUCCESS,
        payload: id,
    })

export const fetchTeamSuccess = (team: Team) => (dispatch: StoreDispatch) =>
    dispatch({
        type: FETCH_TEAM_SUCCESS,
        payload: team,
    })

export const updateTeamSuccess = (team: Team) => (dispatch: StoreDispatch) =>
    dispatch({
        type: UPDATE_TEAM_SUCCESS,
        payload: team,
    })
