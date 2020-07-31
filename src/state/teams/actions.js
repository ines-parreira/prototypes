// @flow
import axios from 'axios'
import type {Map, Set} from 'immutable'

import {toImmutable, toJS} from '../../utils'
import * as constants from '../teams/constants'
import {notify} from '../notifications/actions'
import type {Dispatch} from '../types'

import {type teamType} from './types'

/**
 * Get paginated teams
 * @param page
 */
export const fetchTeamsPagination = (page: number = 1) => (
    dispatch: Dispatch
): Promise<Dispatch> => {
    return axios
        .get('/api/teams/', {
            params: {
                page: page.toString(),
            },
        })
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                return toImmutable(resp)
            },
            (error) => {
                dispatch({
                    type: constants.FETCH_TEAMS_PAGINATION_ERROR,
                    error,
                    reason:
                        'Failed to fetch teams. Please refresh the page and try again.',
                })
            }
        )
}

/**
 * Get paginated team members
 * @param teamId
 * @param page
 * @param search
 */
export const fetchTeamMembersPagination = (
    teamId: number,
    page: number = 1,
    search: string = ''
) => (dispatch: Dispatch): Promise<Dispatch> => {
    return axios
        .get(`/api/teams/${teamId}/members/`, {
            params: {
                page: page.toString(),
                search,
            },
        })
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                return toImmutable(resp)
            },
            (error) => {
                dispatch({
                    type: constants.FETCH_TEAM_MEMBERS_PAGINATION_ERROR,
                    error,
                    reason:
                        'Failed to fetch team members. Please refresh the page and try again.',
                })
            }
        )
}

/**
 * Add a team member
 * @param teamId
 * @param userId
 */
export const addTeamMember = (teamId: number, userId: number) => (
    dispatch: Dispatch
): Promise<Dispatch | Map<*, *>> => {
    return axios
        .post(`/api/teams/${teamId}/members/`, {id: userId})
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Team member added',
                    })
                )

                return toImmutable(resp)
            },
            (error) => {
                dispatch({
                    type: constants.ADD_TEAM_MEMBER_ERROR,
                    error,
                    reason: `Failed to add team member #${userId} to team #${teamId}. Please try again.`,
                })
            }
        )
}

/**
 * Remove a team member
 * @param teamId
 * @param userId
 */
export const deleteTeamMember = (teamId: number, userId: number) => (
    dispatch: Dispatch
): Promise<Dispatch | Map<*, *>> => {
    return axios
        .delete(`/api/teams/${teamId}/members/${userId}/`)
        .then((json = {}) => json.data)
        .then(
            () => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Team member removed',
                    })
                )

                return null
            },
            (error) => {
                dispatch({
                    type: constants.DELETE_TEAM_MEMBER_ERROR,
                    error,
                    reason: `Failed to delete team member #${userId}. Please try again.`,
                })
            }
        )
}

/**
 * Remove a list of team members
 * @param teamId
 * @param userIds
 */
export const deleteTeamMemberList = (teamId: number, userIds: Set<number>) => (
    dispatch: Dispatch
): Promise<Dispatch | Map<*, *>> => {
    return axios
        .delete(`/api/teams/${teamId}/members/`, {data: {ids: userIds.toJS()}})
        .then((json = {}) => json.data)
        .then(
            () => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Team members removed',
                    })
                )

                return null
            },
            (error) => {
                dispatch({
                    type: constants.DELETE_TEAM_MEMBER_LIST_ERROR,
                    error,
                    reason: 'Failed to delete team members. Please try again.',
                })
            }
        )
}

/**
 * Get a team
 * @param teamId
 */
export const fetchTeam = (teamId: number) => (
    dispatch: Dispatch
): Promise<Dispatch | Map<*, *>> => {
    return axios
        .get(`/api/teams/${teamId}/`)
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch({
                    type: constants.FETCH_TEAM_SUCCESS,
                    payload: resp,
                })

                return toImmutable(resp)
            },
            (error) => {
                dispatch({
                    type: constants.FETCH_TEAM_ERROR,
                    error,
                    reason: `Failed to fetch team #${teamId}. Please refresh the page and try again.`,
                })
            }
        )
}

/**
 * Update a team
 * @param team
 */
export const updateTeam = (team: teamType) => (
    dispatch: Dispatch
): Promise<Dispatch | Map<*, *>> => {
    const teamId = team.get('id')
    return axios
        .put(`/api/teams/${teamId}/`, toJS(team))
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Team updated',
                    })
                )

                dispatch({
                    type: constants.UPDATE_TEAM_SUCCESS,
                    payload: resp,
                })

                return toImmutable(resp)
            },
            (error) => {
                dispatch({
                    type: constants.UPDATE_TEAM_ERROR,
                    error,
                    reason: `Failed to update team #${teamId}. Please try again.`,
                })
            }
        )
}

/**
 * Create a team
 * @param team
 */
export const createTeam = (team: teamType) => (
    dispatch: Dispatch
): Promise<Dispatch | Map<*, *>> => {
    return axios
        .post('/api/teams/', toJS(team))
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Team created',
                    })
                )

                dispatch({
                    type: constants.CREATE_TEAM_SUCCESS,
                    payload: resp,
                })

                return toImmutable(resp)
            },
            (error) => {
                dispatch({
                    type: constants.CREATE_TEAM_ERROR,
                    error,
                    reason: 'Failed to create team. Please try again.',
                })
            }
        )
}

/**
 * Delete a team
 * @param teamId
 * @return {boolean} success
 */
export const deleteTeam = (teamId: number) => (
    dispatch: Dispatch
): Promise<Dispatch | Map<*, *>> => {
    return axios
        .delete(`/api/teams/${teamId}/`)
        .then((json = {}) => json.data)
        .then(
            () => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Team deleted',
                    })
                )

                dispatch({
                    type: constants.DELETE_TEAM_SUCCESS,
                    payload: teamId,
                })

                return true
            },
            (error) => {
                dispatch({
                    type: constants.DELETE_TEAM_ERROR,
                    error,
                    reason: `Failed to delete team #${teamId}. Please try again.`,
                    verbose: true,
                })

                return false
            }
        )
}
