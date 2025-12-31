import { useEffect, useMemo, useState } from 'react'

import type { Opportunity, SidebarOpportunityItem } from '../types'
import { isOpportunity } from '../types'
import { useFindOneOpportunity } from './useFindOneOpportunity'

export const useSelectedOpportunity = (
    shopIntegrationId: number,
    opportunities: SidebarOpportunityItem[],
    useKnowledgeService: boolean,
) => {
    const [selectedOpportunityId, setSelectedOpportunityId] = useState<
        string | null
    >(null)

    useEffect(() => {
        if (!selectedOpportunityId && opportunities.length) {
            setSelectedOpportunityId(opportunities[0].id)
        }
    }, [opportunities, selectedOpportunityId])

    const baseSelectedOpportunity = useMemo(
        () =>
            opportunities.find((opp) => opp.id === selectedOpportunityId) ||
            null,
        [opportunities, selectedOpportunityId],
    )

    const shouldFetchDetails =
        useKnowledgeService &&
        !!baseSelectedOpportunity &&
        !isOpportunity(baseSelectedOpportunity)

    const { data: opportunityDetails, isLoading } = useFindOneOpportunity(
        shopIntegrationId,
        baseSelectedOpportunity
            ? parseInt(baseSelectedOpportunity.id, 10)
            : undefined,
        {
            query: {
                enabled: shouldFetchDetails,
                refetchOnWindowFocus: false,
            },
        },
    )

    const selectedOpportunity: Opportunity | null = useMemo(() => {
        if (!baseSelectedOpportunity) {
            return null
        }

        if (useKnowledgeService) {
            return opportunityDetails || null
        }

        if (isOpportunity(baseSelectedOpportunity)) {
            return baseSelectedOpportunity
        }

        return null
    }, [baseSelectedOpportunity, opportunityDetails, useKnowledgeService])

    return {
        selectedOpportunity,
        selectedOpportunityId,
        setSelectedOpportunityId,
        isLoading: shouldFetchDetails ? isLoading : false,
    }
}
