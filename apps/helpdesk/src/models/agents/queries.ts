import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'

import { MutationOverrides } from 'types/query'

import { FeatureFlagKey } from '../../config/featureFlags'
import { useFlag } from '../../core/flags'
import {
    createAgent,
    deleteAgent,
    fetchAgent,
    fetchAgents,
    inviteAgent,
    updateAgent,
} from './resources'
import { FetchAgentsOptions } from './types'

export const agentsKeys = {
    all: () => ['agents'] as const,
    lists: () => [...agentsKeys.all(), 'list'] as const,
    list: (params?: FetchAgentsOptions) => [...agentsKeys.lists(), params],
    details: () => [...agentsKeys.all(), 'detail'] as const,
    detail: (id: number) => [...agentsKeys.details(), id] as const,
}

export const useListAgent = (
    params?: FetchAgentsOptions,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof fetchAgents>>>,
) => {
    const displayBotUsers: boolean = useFlag(
        FeatureFlagKey.BotUserEdition,
        false,
    )

    return useQuery({
        queryKey: agentsKeys.list({ ...params, displayBotUsers }),
        queryFn: () => fetchAgents({ ...params, displayBotUsers }),
        ...overrides,
    })
}

export const useGetAgent = (
    id: number,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof fetchAgent>>>,
) => {
    return useQuery({
        queryKey: agentsKeys.detail(id),
        queryFn: () => fetchAgent(id),
        ...overrides,
    })
}

export const useCreateAgent = (
    overrides?: MutationOverrides<typeof createAgent>,
) => {
    return useMutation({
        mutationFn: (params) => createAgent(...params),
        ...overrides,
    })
}

export const useUpdateAgent = (
    overrides?: MutationOverrides<typeof updateAgent>,
) => {
    return useMutation({
        mutationFn: (params) => updateAgent(...params),
        ...overrides,
    })
}

export const useDeleteAgent = (
    overrides?: MutationOverrides<typeof deleteAgent>,
) => {
    return useMutation({
        mutationFn: (params) => deleteAgent(...params),
        ...overrides,
    })
}

export const useInviteAgent = (
    overrides?: MutationOverrides<typeof inviteAgent>,
) => {
    return useMutation({
        mutationFn: (params) => inviteAgent(...params),
        ...overrides,
    })
}
