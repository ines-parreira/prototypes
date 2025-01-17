import React from 'react'

import AgentsShoutOut from 'pages/stats/support-performance/agents/AgentsShoutOut'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'

export const TopClosedTicketsPerformers = () => {
    const config =
        AgentsShoutOutsConfig[TopPerformersChart.TopClosedTicketsPerformers]
    return <AgentsShoutOut {...config} />
}
