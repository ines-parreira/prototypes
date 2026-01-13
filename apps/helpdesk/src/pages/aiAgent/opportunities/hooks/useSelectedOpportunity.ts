import { useEffect, useMemo, useState } from 'react'

import type { Opportunity, SidebarOpportunityItem } from '../types'
import { isOpportunity } from '../types'
import { useFindOneOpportunity } from './useFindOneOpportunity'

export const useSelectedOpportunity = (
    shopIntegrationId: number,
    opportunities: SidebarOpportunityItem[],
    useKnowledgeService: boolean,
    initialOpportunityId?: string,
) => {
    const [selectedOpportunityId, setSelectedOpportunityId] = useState<
        string | null
    >(initialOpportunityId || null)

    const baseSelectedOpportunity = useMemo(
        () =>
            opportunities.find((opp) => opp.id === selectedOpportunityId) ||
            null,
        [opportunities, selectedOpportunityId],
    )

    const shouldFetchDetails =
        useKnowledgeService &&
        !!selectedOpportunityId &&
        (!baseSelectedOpportunity || !isOpportunity(baseSelectedOpportunity))

    const {
        data: opportunityDetails,
        isLoading,
        isError,
    } = useFindOneOpportunity(
        shopIntegrationId,
        selectedOpportunityId ? parseInt(selectedOpportunityId, 10) : undefined,
        {
            query: {
                enabled: shouldFetchDetails,
                refetchOnWindowFocus: false,
            },
        },
    )

    useEffect(() => {
        if (!opportunities.length) return

        if (
            (initialOpportunityId && !isLoading && isError) ||
            !selectedOpportunityId
        ) {
            setSelectedOpportunityId(opportunities[0].id)
        }
    }, [
        opportunities,
        selectedOpportunityId,
        initialOpportunityId,
        isLoading,
        isError,
    ])

    const selectedOpportunity: Opportunity | null = useMemo(() => {
        if (useKnowledgeService) {
            return opportunityDetails || null
        }

        if (baseSelectedOpportunity && isOpportunity(baseSelectedOpportunity)) {
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
