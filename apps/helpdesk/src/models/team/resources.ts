import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Set } from 'immutable'

import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import { deepMapKeysToSnakeCase } from 'models/api/utils'

import type {
    FetchTeamMembersOptions,
    FetchTeamsOptions,
    Member,
    MemberAddedTeam,
    Team,
    TeamDraft,
} from './types'

export const fetchTeams = async (
    options: FetchTeamsOptions = {},
    config: AxiosRequestConfig = {},
) => {
    const params: Record<string, unknown> = deepMapKeysToSnakeCase({
        ...options,
        ...(!options.limit ? { limit: 30 } : {}),
    })

    return await client.get<ApiListResponseCursorPagination<Team[]>>(
        '/api/teams/',
        {
            params,
            ...config,
        },
    )
}

export const fetchTeam = async (id: number): Promise<Team> => {
    const res = await client.get<Team>(`/api/teams/${id}/`)
    return res.data
}

export const createTeam = async (team: TeamDraft): Promise<Team> => {
    const res = await client.post<Team>('/api/teams/', team)
    return res.data
}

export const updateTeam = async (team: Team): Promise<Team> => {
    const res = await client.put<Team>(`/api/teams/${team.id}/`, team)
    return res.data
}

export const deleteTeam = async (id: number): Promise<AxiosResponse> => {
    const res = await client.delete(`/api/teams/${id}/`)
    return res
}

export const fetchTeamMembers = async (
    options: FetchTeamMembersOptions,
    config: AxiosRequestConfig = {},
) => {
    const { id, ...params } = deepMapKeysToSnakeCase({
        ...options,
        ...(!options.limit ? { limit: 30 } : {}),
    })

    return await client.get<ApiListResponseCursorPagination<Member[]>>(
        `/api/teams/${id}/members`,
        {
            params,
            ...config,
        },
    )
}

export const addTeamMember = async (teamId: number, memberId: number) => {
    const res = await client.post<MemberAddedTeam>(
        `/api/teams/${teamId}/members/`,
        {
            id: memberId,
        },
    )
    return res.data
}

export const deleteTeamMember = async (teamId: number, memberId: number) => {
    const res = await client.delete<MemberAddedTeam>(
        `/api/teams/${teamId}/members/${memberId}/`,
    )
    return res.data
}

export const deleteTeamMembers = async (
    teamId: number,
    membersIds: Set<number>,
) => {
    const res = await client.delete<MemberAddedTeam>(
        `/api/teams/${teamId}/members/`,
        {
            data: { ids: membersIds },
        },
    )
    return res.data
}
