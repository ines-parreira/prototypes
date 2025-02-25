import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { Paths } from '../../../rest_api/help_center_api/client.generated'
import { MutationOverrides } from '../../../types/query'
import {
    createPageEmbedment,
    deletePageEmbedment,
    getAIGeneratedArticles,
    getAIGeneratedArticlesByHelpCenterAndStore,
    getArticleTemplate,
    getArticleTemplates,
    getPageEmbedments,
    getShopifyPages,
    updatePageEmbedment,
    upsertArticleTemplateReview,
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
 * RQ Key Factory for Help Center Article Templates
 */
export const articleTemplateKeys = {
    all: () => ['articleTemplate'] as const,
    lists: () => [...articleTemplateKeys.all(), 'list'] as const,
    list: (locale: Paths.ListArticleTemplates.Parameters.Locale) =>
        [...articleTemplateKeys.lists(), locale] as const,
    details: (locale: Paths.ListArticleTemplates.Parameters.Locale) =>
        [...articleTemplateKeys.list(locale), 'detail'] as const,
    detail: (
        locale: Paths.ListArticleTemplates.Parameters.Locale,
        key: Paths.GetArticleTemplate.Parameters.TemplateKey | null,
    ) => [...articleTemplateKeys.details(locale), key] as const,
}

/**
 * RQ Key Factory for Help Center AI Articles
 */
export const aiArticleKeys = {
    all: () => ['aiArticle'] as const,
    lists: () => [...aiArticleKeys.all(), 'list'],
    listWithStore: (
        helpCenterId: number | null,
        storeIntegrationId: number | null,
    ) => [...aiArticleKeys.list(helpCenterId), 'store', storeIntegrationId],
    list: (helpCenterId: number | null) => [
        ...aiArticleKeys.lists(),
        helpCenterId,
    ],
    listAll: (locale: string) => [...aiArticleKeys.lists(), 'all', locale],
}

/**
 * queries
 */

export const useGetShopifyPages = <
    TData = Awaited<ReturnType<typeof getShopifyPages>>,
>(
    helpCenterId: Paths.ListHelpCenterShopifyPageEmbedments.Parameters.HelpCenterId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getShopifyPages>>,
        unknown,
        TData
    >,
) => {
    const { client } = useHelpCenterApi()

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
    TData = Awaited<ReturnType<typeof getPageEmbedments>>,
>(
    helpCenterId: Paths.ListContactFormShopifyPageEmbedments.Parameters.ContactFormId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getPageEmbedments>>,
        unknown,
        TData
    >,
) => {
    const { client } = useHelpCenterApi()

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

export const useGetArticleTemplates = <
    TData = Awaited<ReturnType<typeof getArticleTemplates>>,
>(
    locale: Paths.ListArticleTemplates.Parameters.Locale,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getArticleTemplates>>,
        unknown,
        TData
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: articleTemplateKeys.list(locale),
        queryFn: async () =>
            getArticleTemplates(client, {
                locale,
            }),
        enabled: !!client,
        ...overrides,
    })
}

export const useGetArticleTemplate = <
    TData = Awaited<ReturnType<typeof getArticleTemplate>>,
>(
    key: Paths.GetArticleTemplate.Parameters.TemplateKey | null,
    locale: Paths.GetArticleTemplate.Parameters.Locale,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getArticleTemplate>>,
        unknown,
        TData
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: articleTemplateKeys.detail(locale, key),
        queryFn: async () =>
            getArticleTemplate(
                client,
                {
                    template_key: key,
                },
                {
                    locale,
                },
            ),
        enabled: !!client,
        ...overrides,
    })
}

export const useGetAIArticles = <
    TData = Awaited<ReturnType<typeof getAIGeneratedArticles>>,
>(
    locale: Paths.ListArticleTemplates.Parameters.Locale,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAIGeneratedArticles>>,
        unknown,
        TData
    >,
) => {
    const { client } = useHelpCenterApi()
    const isAIArticlesEnabled =
        useFlags()[FeatureFlagKey.ObservabilityAIArticles] || false

    return useQuery({
        queryKey: aiArticleKeys.listAll(locale),
        queryFn: async () => {
            return getAIGeneratedArticles(client)
        },
        enabled: !!client && isAIArticlesEnabled && locale === 'en-US',
        ...overrides,
    })
}

export const useGetAIArticlesByHelpCenterAndStore = <
    TData = Awaited<
        ReturnType<typeof getAIGeneratedArticlesByHelpCenterAndStore>
    >,
>(
    helpCenterId: Paths.ListAIArticleTemplatesByHelpCenterAndStore.Parameters.HelpCenterId | null,
    storeIntegrationId: Paths.ListAIArticleTemplatesByHelpCenterAndStore.Parameters.StoreIntegrationId | null,
    locale: Paths.ListArticleTemplates.Parameters.Locale,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAIGeneratedArticlesByHelpCenterAndStore>>,
        unknown,
        TData
    >,
) => {
    const { client } = useHelpCenterApi()

    return useQuery({
        queryKey: aiArticleKeys.listWithStore(helpCenterId, storeIntegrationId),
        queryFn: async () => {
            if (storeIntegrationId === null || helpCenterId === null) {
                return Promise.resolve(null)
            }
            return getAIGeneratedArticlesByHelpCenterAndStore(client, {
                help_center_id: helpCenterId,
                store_integration_id: storeIntegrationId,
            })
        },
        enabled:
            !!client &&
            locale === 'en-US' &&
            storeIntegrationId !== null &&
            helpCenterId !== null,
        ...overrides,
    })
}

/**
 * Mutations
 */
export const useCreatePageEmbedment = (
    overrides?: MutationOverrides<typeof createPageEmbedment>,
) => {
    const { client } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters, newPageEmbedment]) =>
            createPageEmbedment(client, pathParameters, newPageEmbedment),
        ...overrides,
    })
}

export const useUpdatePageEmbedment = (
    overrides?: MutationOverrides<typeof updatePageEmbedment>,
) => {
    const { client } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters, newPageEmbedment]) =>
            updatePageEmbedment(client, pathParameters, newPageEmbedment),
        ...overrides,
    })
}

export const useDeletePageEmbedment = (
    overrides?: MutationOverrides<typeof deletePageEmbedment>,
) => {
    const { client } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters]) =>
            deletePageEmbedment(client, pathParameters),
        ...overrides,
    })
}

export const useUpsertArticleTemplateReview = (
    overrides?: MutationOverrides<typeof upsertArticleTemplateReview>,
) => {
    const { client } = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters, body]) =>
            upsertArticleTemplateReview(client, pathParameters, body),
        ...overrides,
    })
}
