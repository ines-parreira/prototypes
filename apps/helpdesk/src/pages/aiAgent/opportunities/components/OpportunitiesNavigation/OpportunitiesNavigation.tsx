import React, { useMemo } from 'react'

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
    hideCount?: boolean
}
export const OpportunitiesNavigation = ({
    opportunities,
    selectedOpportunity,
    selectCertainOpportunity,
    totalCount,
    hideCount = false,
}: OpportunityNavigationProps) => {
    const navigationData = useOpportunitiesNavigation({
        selectedOpportunity,
        opportunities: opportunities || [],
    })
    const navigateForward = () => {
        if (selectCertainOpportunity) {
            selectCertainOpportunity(navigationData.position + 1)
        }
    }

    const navigateBackward = () => {
        if (selectCertainOpportunity) {
            selectCertainOpportunity(navigationData.position - 1)
        }
    }

    const isSidebarOpportunityLoaded = useMemo(() => {
        return opportunities?.some(
            (opportunity) => opportunity.id === selectedOpportunity?.id,
        )
    }, [opportunities, selectedOpportunity])

    if (
        !selectedOpportunity ||
        !opportunities ||
        opportunities.length === 0 ||
        !isSidebarOpportunityLoaded
    ) {
        return null
    }

    return (
        <div className={css.opportunitiesNavigation}>
            <Button
                intent="regular"
                variant="tertiary"
                icon="arrow-chevron-left"
                isDisabled={navigationData.isFirst}
                onClick={navigateBackward}
            >
                Left navigation button
            </Button>
            <Button
                intent="regular"
                variant="tertiary"
                icon="arrow-chevron-right"
                isDisabled={navigationData.isLast}
                onClick={navigateForward}
            >
                Right navigation button
            </Button>
            {!hideCount && (
                <Text size="md" variant="regular">
                    {navigationData.position + 1} of {totalCount}
                </Text>
            )}
        </div>
    )
}
