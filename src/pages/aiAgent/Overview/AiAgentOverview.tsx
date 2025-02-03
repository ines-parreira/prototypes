import React from 'react'

import {KpiSection} from 'pages/aiAgent/Overview/components/KpiSection/KpiSection'
import {PendingTasksSection} from 'pages/aiAgent/Overview/components/PendingTasksSection/PendingTasksSection'
import {ResourcesSection} from 'pages/aiAgent/Overview/components/ResourcesSection/ResourcesSection'
import {Separator} from 'pages/aiAgent/Overview/components/Separator/Separator'
import {Title} from 'pages/aiAgent/Overview/components/Title/Title'
import {AiAgentOverviewLayout} from 'pages/aiAgent/Overview/layout/AiAgentOverviewLayout'

export const AiAgentOverview = () => {
    return (
        <AiAgentOverviewLayout>
            <Title firstName="Taylor" />
            <KpiSection />
            <PendingTasksSection />
            <Separator />
            <ResourcesSection />
        </AiAgentOverviewLayout>
    )
}
