import React from 'react'

import AgentsShoutOut from 'pages/stats/support-performance/agents/AgentsShoutOut'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'

export const TopResponseTimePerformers = () => {
    const config =
        AgentsShoutOutsConfig[TopPerformersChart.TopResponseTimePerformers]
    return <AgentsShoutOut {...config} />
}
