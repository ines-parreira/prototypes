import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useFindOpportunitiesByTicketIdOpportunity } from '@gorgias/knowledge-service-queries'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentPlansByProduct } from 'state/billing/selectors'

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
    const currentPlansByProduct = useAppSelector(getCurrentPlansByProduct)
    const hasFullAccess =
        currentPlansByProduct?.automation?.plan_id.includes('usd-6')

    const isTopOpportunitiesEnabled = useFlag(
        FeatureFlagKey.IncreaseVisibilityOfOpportunity,
        false,
    )
    const isUseKnowledgeServiceEnabled = useFlag(
        FeatureFlagKey.OpportunitiesMilestone2,
        false,
    )

    const isOpportunitiesEnabled = useMemo(
        () => isTopOpportunitiesEnabled && isUseKnowledgeServiceEnabled,
        [isTopOpportunitiesEnabled, isUseKnowledgeServiceEnabled],
    )

    const shouldFetch =
        isOpportunitiesEnabled &&
        !!hasFullAccess &&
        !!ticketId &&
        !!shopIntegrationId

    const { data, isLoading, isError, refetch } =
        useFindOpportunitiesByTicketIdOpportunity(shopIntegrationId, ticketId, {
            query: {
                enabled: !!shouldFetch && (options?.query?.enabled ?? true),
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
