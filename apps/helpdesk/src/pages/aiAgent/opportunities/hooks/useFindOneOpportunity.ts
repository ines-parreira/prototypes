import { useFindOpportunityByIdForShopOpportunity } from '@gorgias/knowledge-service-queries'

import type { Opportunity } from '../types'
import { mapOpportunityDetailToOpportunity } from '../utils/mapOpportunityDetailToOpportunity'

export const useFindOneOpportunity = (
    shopIntegrationId: number,
    opportunityId: number | undefined,
    options?: {
        query?: {
            enabled?: boolean
            refetchOnWindowFocus?: boolean
        }
    },
) => {
    return useFindOpportunityByIdForShopOpportunity(
        shopIntegrationId,
        opportunityId || 0,
        {
            query: {
                enabled: options?.query?.enabled ?? true,
                refetchOnWindowFocus:
                    options?.query?.refetchOnWindowFocus ?? false,
                select: (response): Opportunity => {
                    return mapOpportunityDetailToOpportunity(response.data)
                },
            },
        },
    )
}
