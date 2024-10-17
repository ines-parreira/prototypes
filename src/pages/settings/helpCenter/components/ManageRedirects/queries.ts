/**
 * I couldn't resolve the
 * "Object literal may only specify known properties, and 'mutationFn' does not exist in type 'readonly unknown[]'"
 * error on the useDeleteHelpCenterRedirect function
 */
// @ts-nocheck

/**
 * These queries are used only in the maintenance view for now.
 * They're not tested since they're not used in merchant's facing features
 */

/**
 * RQ Key Factory for Help Center redirects
 */

import {UseQueryOptions, useQuery, useMutation} from '@tanstack/react-query'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {MutationOverrides} from 'types/query'
import {Paths} from '../../../../../rest_api/help_center_api/client.generated'

import {
    createHelpCenterRedirect,
    deleteHelpCenterRedirect,
    getHelpCenterRedirects,
} from './resources'

export const helpCenterRedirectsKey = {
    all: (helpCenterId: number) =>
        ['help-center', helpCenterId, 'redirect'] as const,
    lists: (helpCenterId: number) =>
        [...helpCenterRedirectsKey.all(helpCenterId), 'list'] as const,
    details: (helpCenterId: number) =>
        [...helpCenterRedirectsKey.all(helpCenterId), 'detail'] as const,
    detail: (helpCenterId: number, redirectId: number) =>
        [...helpCenterRedirectsKey.details(helpCenterId), redirectId] as const,
}

/**
 * Queries
 */

export const useGetHelpCenterRedirectList = <
    TData = Awaited<ReturnType<typeof getHelpCenterRedirects>>,
>(
    helpCenterId: Paths.ListRedirects.Parameters.HelpCenterId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getHelpCenterRedirects>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterRedirectsKey.lists(helpCenterId),
        queryFn: async () =>
            getHelpCenterRedirects(client, {help_center_id: helpCenterId}),
        enabled: !!client,
        ...overrides,
    })
}

export const useCreateHelpCenterRedirect = (
    overrides?: MutationOverrides<typeof createHelpCenterRedirect>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParams, newRedirect]) =>
            createHelpCenterRedirect(client, pathParams, newRedirect),
        ...overrides,
    })
}

export const useDeleteHelpCenterRedirect = (
    overrides?: MutationOverrides<typeof deleteHelpCenterRedirect>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParams, queryParams]) =>
            deleteHelpCenterRedirect(client, pathParams, queryParams),
        ...overrides,
    })
}
