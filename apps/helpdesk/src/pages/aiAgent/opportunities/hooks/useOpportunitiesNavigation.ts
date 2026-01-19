import { useCallback, useMemo } from 'react'

import type { Opportunity, SidebarOpportunityItem } from '../types'

export const useOpportunitiesNavigation = ({
    selectedOpportunity,
    opportunities,
    allowedOpportunityIds,
}: {
    selectedOpportunity: Opportunity | null
    opportunities: SidebarOpportunityItem[]
    allowedOpportunityIds?: number[]
}) => {
    const navigableOpportunities = useMemo(() => {
        if (allowedOpportunityIds === undefined) {
            return opportunities
        }
        return opportunities.filter((o) =>
            allowedOpportunityIds.includes(Number(o.id)),
        )
    }, [opportunities, allowedOpportunityIds])

    const position = useMemo(() => {
        if (!selectedOpportunity || navigableOpportunities.length === 0) {
            return -1
        }
        return navigableOpportunities.findIndex(
            (o) => o.id === selectedOpportunity.id,
        )
    }, [selectedOpportunity, navigableOpportunities])

    const isFirst = position <= 0
    const isLast =
        position === -1 || position === navigableOpportunities.length - 1

    const getNextIndex = useCallback((): number | undefined => {
        if (isLast || position === -1) {
            return undefined
        }
        const nextOpportunity = navigableOpportunities[position + 1]
        if (!nextOpportunity) {
            return undefined
        }
        return opportunities.findIndex((o) => o.id === nextOpportunity.id)
    }, [isLast, position, navigableOpportunities, opportunities])

    const getPrevIndex = useCallback((): number | undefined => {
        if (isFirst || position === -1) {
            return undefined
        }
        const prevOpportunity = navigableOpportunities[position - 1]
        if (!prevOpportunity) {
            return undefined
        }
        return opportunities.findIndex((o) => o.id === prevOpportunity.id)
    }, [isFirst, position, navigableOpportunities, opportunities])

    const displayPosition = position === -1 ? 0 : position
    const totalNavigable = navigableOpportunities.length

    return {
        isFirst,
        isLast,
        position: displayPosition,
        totalNavigable,
        getNextIndex,
        getPrevIndex,
    }
}
