import axios, {AxiosError} from 'axios'
import type {Map, Set} from 'immutable'

import {ApiListResponsePagination} from '../../models/api/types'
import {toImmutable, toJS} from '../../utils.js'
import {NotificationStatus} from '../notifications/types'
import * as constants from '../teams/constants.js'
import {notify} from '../notifications/actions'
import {StoreDispatch} from '../types'

import {Team, TeamUser, MemberAddedTeam} from './types'

/**
 * Get paginated teams
 */
export const fetchTeamsPagination = (page = 1) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .get<ApiListResponsePagination<Team[]>>('/api/teams/', {
            params: {
                page: page.toString(),
            },
        })
        .then((json) => json?.data)
        .then(
            (resp) => {
                return toImmutable(resp) as Map<any, any>
            },
            (error: AxiosError) => {
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
 */
export const fetchTeamMembersPagination = (
    teamId: number,
    page = 1,
    search = ''
) => (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .get<ApiListResponsePagination<TeamUser[]>>(
            `/api/teams/${teamId}/members/`,
            {
                params: {
                    page: page.toString(),
                    search,
                },
            }
        )
        .then((json) => json?.data)
        .then(
            (resp) => {
                return toImmutable(resp) as Map<any, any>
            },
            (error: AxiosError) => {
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
 */
export const addTeamMember = (teamId: number, userId: number) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .post<MemberAddedTeam>(`/api/teams/${teamId}/members/`, {id: userId})
        .then((json) => json?.data)
        .then(
            (resp) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Team member added',
                    })
                )

                return toImmutable(resp) as Map<any, any>
            },
            (error: AxiosError) => {
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
 */
export const deleteTeamMember = (teamId: number, userId: number) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios.delete(`/api/teams/${teamId}/members/${userId}/`).then(
        () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Team member removed',
                })
            )

            return null
        },
        (error: AxiosError) => {
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
 */
export const deleteTeamMemberList = (teamId: number, userIds: Set<number>) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .delete(`/api/teams/${teamId}/members/`, {data: {ids: userIds.toJS()}})
        .then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Team members removed',
                    })
                )

                return null
            },
            (error: AxiosError) => {
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
 */
export const fetchTeam = (teamId: number) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .get<Team>(`/api/teams/${teamId}/`)
        .then((json) => json?.data)
        .then(
            (resp) => {
                dispatch({
                    type: constants.FETCH_TEAM_SUCCESS,
                    payload: resp,
                })

                return toImmutable(resp) as Map<any, any>
            },
            (error: AxiosError) => {
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
 */
export const updateTeam = (team: Map<any, any>) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    const teamId = team.get('id') as number
    return axios
        .put<Team>(`/api/teams/${teamId}/`, toJS(team))
        .then((json) => json?.data)
        .then(
            (resp) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Team updated',
                    })
                )

                dispatch({
                    type: constants.UPDATE_TEAM_SUCCESS,
                    payload: resp,
                })

                return toImmutable(resp) as Map<any, any>
            },
            (error: AxiosError) => {
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
 */
export const createTeam = (team: Map<any, any>) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .post<Team>('/api/teams/', toJS(team))
        .then((json) => json?.data)
        .then(
            (resp) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Team created',
                    })
                )

                dispatch({
                    type: constants.CREATE_TEAM_SUCCESS,
                    payload: resp,
                })

                return toImmutable(resp) as Map<any, any>
            },
            (error: AxiosError) => {
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
 */
export const deleteTeam = (teamId: number) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios.delete(`/api/teams/${teamId}/`).then(
        () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Team deleted',
                })
            )

            dispatch({
                type: constants.DELETE_TEAM_SUCCESS,
                payload: teamId,
            })

            return true
        },
        (error: AxiosError) => {
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
