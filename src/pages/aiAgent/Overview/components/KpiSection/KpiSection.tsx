import React from 'react'

import {CardTitle} from 'pages/aiAgent/Onboarding/components/Card'
import {Subtitle} from 'pages/aiAgent/Onboarding/components/Subtitle/Subtitle'
import {OverviewCard} from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'

export const KpiSection = () => {
    return (
        <OverviewCard>
            <div>
                <CardTitle>AI Agent Performance</CardTitle>
                <Subtitle>Data from last 28 days</Subtitle>
            </div>
        </OverviewCard>
    )
}
