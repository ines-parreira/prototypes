import { useMemo, useState } from 'react'

import type { Opportunity } from '../utils/mapAiArticlesToOpportunities'
import { useFindOneOpportunity } from './useFindOneOpportunity'

export const useSelectedOpportunity = (
    opportunities: Opportunity[],
    useKnowledgeService: boolean,
) => {
    const [selectedOpportunityId, setSelectedOpportunityId] = useState<
        string | null
    >(null)

    const baseSelectedOpportunity = useMemo(
        () =>
            opportunities.find((opp) => opp.id === selectedOpportunityId) ||
            null,
        [opportunities, selectedOpportunityId],
    )

    const shouldFetchDetails = useKnowledgeService && !!baseSelectedOpportunity

    const { data: opportunityDetails, isLoading } = useFindOneOpportunity(
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

    const selectedOpportunity = useKnowledgeService
        ? opportunityDetails || baseSelectedOpportunity
        : baseSelectedOpportunity

    return {
        selectedOpportunity,
        selectedOpportunityId,
        setSelectedOpportunityId,
        isLoading: shouldFetchDetails ? isLoading : false,
    }
}
