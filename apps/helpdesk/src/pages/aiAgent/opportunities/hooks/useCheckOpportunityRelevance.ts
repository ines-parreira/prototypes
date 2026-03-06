import { useMemo } from 'react'

import { useQueries } from '@tanstack/react-query'

import { helpCenterArticleKeys } from 'models/helpCenter/queries'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { validLocaleCode } from 'models/helpCenter/utils'
import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

interface UseCheckOpportunityRelevanceResult {
    isRelevant: boolean
    isLoading: boolean
}

/**
 * Custom hook to check if a RESOLVE_CONFLICT opportunity is still relevant
 * by comparing article versions from help-center API with versions in the opportunity.
 *
 * Only runs checks for RESOLVE_CONFLICT opportunities.
 * For non-RESOLVE_CONFLICT opportunities, returns isRelevant: true immediately.
 * Returns isRelevant: false if any resource version differs or if API call fails.
 * Returns isRelevant: true if all resource versions match or while loading.
 */
export const useCheckOpportunityRelevance = (
    opportunity: Opportunity | undefined,
): UseCheckOpportunityRelevanceResult => {
    const { client } = useHelpCenterApi()

    const shouldCheck = opportunity?.type === OpportunityType.RESOLVE_CONFLICT
    const resources =
        shouldCheck && opportunity?.resources
            ? opportunity.resources.filter((resource) => resource.identifiers)
            : []

    const articleQueries = useQueries({
        queries: resources.map((resource) => {
            const locale = validLocaleCode(
                resource.identifiers?.resourceLocale || 'en-US',
            )
            return {
                queryKey: helpCenterArticleKeys(
                    Number(resource.identifiers?.resourceSetId),
                    Number(resource.identifiers?.resourceId),
                    locale,
                    'current',
                ),
                queryFn: async () => {
                    if (!resource.identifiers) return null

                    try {
                        const article = await getHelpCenterArticle(
                            client,
                            {
                                help_center_id: Number(
                                    resource.identifiers.resourceSetId,
                                ),
                                id: Number(resource.identifiers.resourceId),
                            },
                            {
                                locale,
                                version_status: 'current',
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

    const result = useMemo(() => {
        const isLoading = articleQueries.some((query) => query.isLoading)

        if (!opportunity) {
            return { isRelevant: true, isLoading }
        }

        const shouldCheck =
            opportunity.type === OpportunityType.RESOLVE_CONFLICT

        if (!shouldCheck) {
            return { isRelevant: true, isLoading }
        }

        const resources =
            opportunity.resources?.filter((resource) => resource.identifiers) ||
            []

        if (isLoading || resources.length === 0) {
            return { isRelevant: true, isLoading }
        }

        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i]
            const articleQuery = articleQueries[i]

            if (!articleQuery.data || !resource.identifiers?.resourceVersion) {
                return { isRelevant: false, isLoading }
            }

            const article = articleQuery.data
            const version = article.translation?.version

            const matchesVersion =
                version !== null &&
                String(version) === resource.identifiers.resourceVersion

            if (!matchesVersion) {
                return { isRelevant: false, isLoading }
            }
        }

        return { isRelevant: true, isLoading }
    }, [opportunity, articleQueries])

    return result
}
