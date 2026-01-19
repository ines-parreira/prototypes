import { useCallback, useMemo } from 'react'

import { Button, Text } from '@gorgias/axiom'

import { useOpportunitiesNavigation } from 'pages/aiAgent/opportunities/hooks/useOpportunitiesNavigation'
import type {
    Opportunity,
    SidebarOpportunityItem,
} from 'pages/aiAgent/opportunities/types'

import css from './OpportunitiesNavigation.less'

interface OpportunityNavigationProps {
    selectedOpportunity: Opportunity | null
    opportunities?: SidebarOpportunityItem[]
    selectCertainOpportunity?: (index: number) => void
    totalCount: number
    allowedOpportunityIds?: number[]
    hideCount?: boolean
}

export const OpportunitiesNavigation = ({
    opportunities,
    selectedOpportunity,
    selectCertainOpportunity,
    totalCount,
    allowedOpportunityIds,
    hideCount = false,
}: OpportunityNavigationProps) => {
    const {
        isFirst,
        isLast,
        position,
        totalNavigable,
        getNextIndex,
        getPrevIndex,
    } = useOpportunitiesNavigation({
        selectedOpportunity,
        opportunities: opportunities || [],
        allowedOpportunityIds,
    })

    const navigateForward = useCallback(() => {
        const nextIndex = getNextIndex()
        if (nextIndex !== undefined && selectCertainOpportunity) {
            selectCertainOpportunity(nextIndex)
        }
    }, [getNextIndex, selectCertainOpportunity])

    const navigateBackward = useCallback(() => {
        const prevIndex = getPrevIndex()
        if (prevIndex !== undefined && selectCertainOpportunity) {
            selectCertainOpportunity(prevIndex)
        }
    }, [getPrevIndex, selectCertainOpportunity])

    const isSidebarOpportunityLoaded = useMemo(() => {
        return opportunities?.some(
            (opportunity) => opportunity.id === selectedOpportunity?.id,
        )
    }, [opportunities, selectedOpportunity])

    if (
        !selectedOpportunity ||
        !opportunities ||
        opportunities.length === 0 ||
        !isSidebarOpportunityLoaded ||
        totalNavigable === 0
    ) {
        return null
    }

    return (
        <div className={css.opportunitiesNavigation}>
            <Button
                intent="regular"
                variant="tertiary"
                icon="arrow-chevron-left"
                isDisabled={isFirst}
                onClick={navigateBackward}
            >
                Left navigation button
            </Button>
            <Button
                intent="regular"
                variant="tertiary"
                icon="arrow-chevron-right"
                isDisabled={isLast}
                onClick={navigateForward}
            >
                Right navigation button
            </Button>
            {!hideCount && (
                <Text size="md" variant="regular">
                    {position + 1} of {totalCount}
                </Text>
            )}
        </div>
    )
}
