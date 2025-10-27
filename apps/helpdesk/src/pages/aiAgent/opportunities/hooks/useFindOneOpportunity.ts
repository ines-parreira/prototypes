import { useFindOpportunityByIdOpportunity } from '@gorgias/knowledge-service-queries'

import { Opportunity } from '../utils/mapAiArticlesToOpportunities'
import { mapOpportunityDetailToOpportunity } from '../utils/mapOpportunityDetailToOpportunity'

export const useFindOneOpportunity = (
    opportunityId: number | undefined,
    options?: {
        query?: {
            enabled?: boolean
            refetchOnWindowFocus?: boolean
        }
    },
) => {
    return useFindOpportunityByIdOpportunity(opportunityId || 0, {
        query: {
            enabled: options?.query?.enabled ?? true,
            refetchOnWindowFocus: options?.query?.refetchOnWindowFocus ?? false,
            select: (response): Opportunity => {
                return mapOpportunityDetailToOpportunity(response.data)
            },
        },
    })
}
