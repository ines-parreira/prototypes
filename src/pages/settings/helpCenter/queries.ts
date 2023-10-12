import {UseQueryOptions, useQuery, useMutation} from '@tanstack/react-query'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {Paths} from '../../../rest_api/help_center_api/client.generated'
import {MutationOverrides} from '../../../types/query'

import {
    getShopifyPages,
    getPageEmbedments,
    createPageEmbedment,
    updatePageEmbedment,
    deletePageEmbedment,
} from './resources'

/**
 * RQ Key Factory for Help Centers
 */
export const helpCenterKeys = {
    all: () => ['helpCenter'] as const,
    lists: () => [...helpCenterKeys.all(), 'list'] as const,
    list: (params: Paths.ListHelpCenters.QueryParameters) => [
        ...helpCenterKeys.lists(),
        params,
    ],
    details: () => [...helpCenterKeys.all(), 'detail'] as const,
    detail: (id: number) => [...helpCenterKeys.details(), id] as const,
}

/**
 * RQ Key Factory for Help Center Shopify Pages
 */
export const embeddablePageKeys = {
    all: () => ['embeddablePage'] as const,
    lists: () => [...embeddablePageKeys.all(), 'list'] as const,
}

/**
 * RQ Key Factory for Help Center Embeddable Pages /help-center/{id1}/pages/{id2}
 */
export const helpCenterEmbeddablePageKeys = {
    all: (helpCenterId: number) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            ...embeddablePageKeys.all(),
        ] as const,
    lists: (helpCenterId: number) =>
        [
            ...helpCenterEmbeddablePageKeys.all(helpCenterId),
            ...embeddablePageKeys.lists(),
        ] as const,
}

/**
 * RQ Key Factory for Help Center Page Embedments
 */
export const pageEmbedmentsKeys = {
    all: () => ['pageEmbedments'] as const,
    lists: () => [...pageEmbedmentsKeys.all(), 'list'] as const,
}

/**
 * RQ Key Factory for Help Center Page Embedments /help-center/{id1}/pages/{id2}/embedments
 */
export const helpCenterPageEmbedmentsKeys = {
    all: (helpCenterId: number) =>
        [
            ...helpCenterKeys.detail(helpCenterId),
            ...pageEmbedmentsKeys.all(),
        ] as const,
    lists: (helpCenterId: number) =>
        [
            ...helpCenterPageEmbedmentsKeys.all(helpCenterId),
            ...pageEmbedmentsKeys.lists(),
        ] as const,
}

/**
 * queries
 */

export const useGetShopifyPages = <
    TData = Awaited<ReturnType<typeof getShopifyPages>>
>(
    helpCenterId: Paths.ListHelpCenterShopifyPageEmbedments.Parameters.HelpCenterId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getShopifyPages>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterEmbeddablePageKeys.lists(helpCenterId),
        queryFn: async () =>
            getShopifyPages(client, {
                help_center_id: helpCenterId,
            }),
        enabled: !!client,
        ...overrides,
    })
}

export const useGetPageEmbedments = <
    TData = Awaited<ReturnType<typeof getPageEmbedments>>
>(
    helpCenterId: Paths.ListContactFormShopifyPageEmbedments.Parameters.ContactFormId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getPageEmbedments>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: helpCenterPageEmbedmentsKeys.lists(helpCenterId),
        queryFn: async () =>
            getPageEmbedments(client, {
                help_center_id: helpCenterId,
            }),
        enabled: !!client,
        ...overrides,
    })
}

/**
 * Mutations
 */
export const useCreatePageEmbedment = (
    overrides?: MutationOverrides<typeof createPageEmbedment>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters, newPageEmbedment]) =>
            createPageEmbedment(client, pathParameters, newPageEmbedment),
        ...overrides,
    })
}

export const useUpdatePageEmbedment = (
    overrides?: MutationOverrides<typeof updatePageEmbedment>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters, newPageEmbedment]) =>
            updatePageEmbedment(client, pathParameters, newPageEmbedment),
        ...overrides,
    })
}

export const useDeletePageEmbedment = (
    overrides?: MutationOverrides<typeof deletePageEmbedment>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters]) =>
            deletePageEmbedment(client, pathParameters),
        ...overrides,
    })
}
