import React from 'react'

import { Icon, LegacyIconButton as IconButton } from '@gorgias/axiom'

import { useOpportunitiesNavigation } from 'pages/aiAgent/opportunities/hooks/useOpportunitiesNavigation'
import type { Opportunity } from 'pages/aiAgent/opportunities/utils/mapAiArticlesToOpportunities'

import css from './OpportunitiesNavigation.less'

interface OpportunityNavigationProps {
    selectedOpportunity: Opportunity | null
    opportunities?: Opportunity[]
    selectCertainOpportunity?: (index: number) => void
    totalCount: number
}
export const OpportunitiesNavigation = ({
    opportunities,
    selectedOpportunity,
    selectCertainOpportunity,
    totalCount,
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

    if (!selectedOpportunity || !opportunities || opportunities.length === 0) {
        return null
    }

    return (
        <div className={css.opportunitiesNavigation}>
            <IconButton
                intent="secondary"
                fillStyle="ghost"
                icon={<Icon name="arrow-chevron-up" />}
                isDisabled={navigationData.isFirst}
                onClick={navigateBackward}
            />
            <IconButton
                intent="secondary"
                fillStyle="ghost"
                icon={<Icon name="arrow-chevron-down" />}
                isDisabled={navigationData.isLast}
                onClick={navigateForward}
            />
            <div>
                {navigationData.position + 1} of {totalCount}
            </div>
        </div>
    )
}
