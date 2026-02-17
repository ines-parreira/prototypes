import { useMemo } from 'react'

import { useFindOpportunitiesByTicketIdOpportunity } from '@gorgias/knowledge-service-queries'

import { OpportunityType } from '../enums'
import type { Opportunity } from '../types'
import { mapOpportunityDetailToOpportunity } from '../utils/mapOpportunityDetailToOpportunity'

export const useFindTopOpportunityByTicketId = (
    shopIntegrationId: number,
    ticketId: string,
    options?: {
        query?: {
            enabled?: boolean
            refetchOnWindowFocus?: boolean
        }
    },
) => {
    const { data, isLoading, isError, refetch } =
        useFindOpportunitiesByTicketIdOpportunity(shopIntegrationId, ticketId, {
            query: {
                enabled: options?.query?.enabled ?? true,
                refetchOnWindowFocus:
                    options?.query?.refetchOnWindowFocus ?? false,
                select: (response): Opportunity[] => {
                    return response.data.map(mapOpportunityDetailToOpportunity)
                },
            },
        })

    const topOpportunity = useMemo(() => {
        if (!data || data.length === 0) return null

        return data.reduce((top, current) => {
            const topIsConflict = top.type === OpportunityType.RESOLVE_CONFLICT
            const currentIsConflict =
                current.type === OpportunityType.RESOLVE_CONFLICT

            if (topIsConflict && !currentIsConflict) {
                return top
            }

            if (!topIsConflict && currentIsConflict) {
                return current
            }

            const topTicketCount = top.ticketCount ?? 0
            const currentTicketCount = current.ticketCount ?? 0

            return currentTicketCount > topTicketCount ? current : top
        })
    }, [data])

    return {
        topOpportunity,
        isLoading,
        isError,
        refetch,
    }
}
