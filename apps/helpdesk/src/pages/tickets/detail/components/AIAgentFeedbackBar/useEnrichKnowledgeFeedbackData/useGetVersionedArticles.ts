import { useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { helpCenterKeys } from 'models/helpCenter/queries'
import { listArticleTranslationVersions } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import { DEFAULT_CACHE_TIME, DEFAULT_STALE_TIME } from './utils'

type VersionedArticleData = {
    title: string
    content: string
    helpCenterId: number
    updatedDatetime: string | null
    versionId: number
}

const VERSIONABLE_TYPES = new Set([
    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
    AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
])

type VersionedResource = KnowledgeReasoningResource & {
    resourceVersion: string
    resourceLocale: string
    resourceSetId: string
}

const isVersionedResource = (
    resource: KnowledgeReasoningResource,
): resource is VersionedResource =>
    !!resource.resourceVersion &&
    !isNaN(Number(resource.resourceVersion)) &&
    Number(resource.resourceVersion) > 0 &&
    !!resource.resourceLocale &&
    !!resource.resourceSetId &&
    VERSIONABLE_TYPES.has(resource.resourceType)

export const useGetVersionedArticles = (
    resources: KnowledgeReasoningResource[],
    enabled: boolean,
) => {
    const { client } = useHelpCenterApi()

    const versionedResources = useMemo(
        () => resources.filter(isVersionedResource),
        [resources],
    )

    const queries = useQueries({
        queries: versionedResources.map((resource) => ({
            queryKey: helpCenterKeys.articleTranslationVersions(
                Number(resource.resourceSetId),
                Number(resource.resourceId),
                resource.resourceLocale,
                { number: Number(resource.resourceVersion) },
            ),
            queryFn: async () => {
                if (!client) return null
                return listArticleTranslationVersions(
                    client,
                    {
                        help_center_id: Number(resource.resourceSetId),
                        article_id: Number(resource.resourceId),
                        locale: resource.resourceLocale,
                    },
                    { number: Number(resource.resourceVersion) },
                )
            },
            enabled: enabled && !!client,
            staleTime: DEFAULT_STALE_TIME,
            cacheTime: DEFAULT_CACHE_TIME,
            refetchOnWindowFocus: false,
            retry: 1,
        })),
    })

    const isLoading = queries.some((query) => query.isLoading) && enabled

    const versionedArticlesMap = useMemo(() => {
        const map = new Map<string, VersionedArticleData>()

        versionedResources.forEach((resource, index) => {
            const query = queries[index]
            const responseData = query?.data
            const version = responseData?.data?.[0]

            if (version) {
                map.set(resource.resourceId, {
                    title: version.title,
                    content: version.content,
                    helpCenterId: Number(resource.resourceSetId),
                    updatedDatetime: version.published_datetime ?? null,
                    versionId: version.id,
                })
            }
        })

        return map
    }, [versionedResources, queries])

    return {
        isLoading,
        versionedArticlesMap,
    }
}
