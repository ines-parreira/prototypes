import { useState } from 'react'

import { OpportunityType } from '../../enums'
import { OpportunitiesContent } from '../OpportunitiesContent/OpportunitiesContent'
import { OpportunitiesSidebar } from '../OpportunitiesSidebar/OpportunitiesSidebar'

import css from './OpportunitiesLayout.less'

export interface Opportunity {
    id: string
    title: string
    type: OpportunityType
}

export const OpportunitiesLayout = () => {
    const [selectedOpportunity, setSelectedOpportunity] =
        useState<Opportunity | null>(null)

    return (
        <div
            className={css.wrapper}
            data-overflow="visible"
            data-ai-opportunities
        >
            <div className={css.layout}>
                <OpportunitiesSidebar
                    onSelectOpportunity={setSelectedOpportunity}
                />
                <OpportunitiesContent
                    selectedOpportunity={selectedOpportunity}
                />
            </div>
        </div>
    )
}
