import { useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import { useFindOpportunityByIdForShopOpportunity } from '@gorgias/knowledge-service-queries'

import { helpCenterArticleKeys } from 'models/helpCenter/queries'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { validLocaleCode } from 'models/helpCenter/utils'
import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

interface UseCheckOpportunityRelevanceResult {
    isRelevant: boolean | undefined
    isLoading: boolean
}

/**
 * Custom hook to check if a RESOLVE_CONFLICT opportunity is still relevant
 * by comparing article versions from help-center API with versions in the opportunity.
 *
 * Only runs checks for RESOLVE_CONFLICT opportunities.
 * Returns isRelevant: false if any resource version differs or if API call fails.
 * Returns isRelevant: true if all resource versions match.
 */
export const useCheckOpportunityRelevance = (
    shopIntegrationId: number,
    opportunityId: number,
): UseCheckOpportunityRelevanceResult => {
    const { client } = useHelpCenterApi()

    const { data: opportunityResponse, isLoading: isLoadingOpportunity } =
        useFindOpportunityByIdForShopOpportunity(
            shopIntegrationId,
            opportunityId,
            {
                query: {
                    enabled: !!shopIntegrationId && !!opportunityId,
                    refetchOnWindowFocus: false,
                },
            },
        )

    const opportunity = opportunityResponse?.data

    const shouldCheck = useMemo(() => {
        if (!opportunity) return false

        return opportunity.opportunityType === OpportunityType.RESOLVE_CONFLICT
    }, [opportunity])

    const resources = useMemo(() => {
        if (!shouldCheck || !opportunity || !opportunity.resources) return []

        return opportunity.resources || []
    }, [shouldCheck, opportunity])

    const articleQueries = useQueries({
        queries: resources.map((resource) => {
            const locale = validLocaleCode(resource.resourceLocale || 'en-US')
            return {
                queryKey: helpCenterArticleKeys(
                    Number(resource.resourceSetId),
                    Number(resource.resourceId),
                    locale,
                    'latest_draft',
                ),
                queryFn: async () => {
                    try {
                        const article = await getHelpCenterArticle(
                            client,
                            {
                                help_center_id: Number(resource.resourceSetId),
                                id: Number(resource.resourceId),
                            },
                            {
                                locale,
                                version_status: 'latest_draft',
                            },
                        )
                        return article
                    } catch {
                        return null
                    }
                },
                enabled: shouldCheck && !!client,
                retry: false,
            }
        }),
    })

    const isLoading =
        isLoadingOpportunity || articleQueries.some((query) => query.isLoading)

    const isRelevant = useMemo(() => {
        if (!shouldCheck || isLoading || resources.length === 0)
            return undefined

        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i]
            const articleQuery = articleQueries[i]

            if (!articleQuery.data || !resource.resourceVersion) {
                return false
            }

            const article = articleQuery.data

            const draftVersionId = article.translation?.draft_version_id

            const matchesDraft =
                draftVersionId !== null &&
                String(draftVersionId) === resource.resourceVersion

            if (!matchesDraft) {
                return false
            }
        }

        return true
    }, [shouldCheck, isLoading, resources, articleQueries])

    return {
        isRelevant,
        isLoading,
    }
}
