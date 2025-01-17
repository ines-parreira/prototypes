import React from 'react'

import AgentsShoutOut from 'pages/stats/support-performance/agents/AgentsShoutOut'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'

export const TopCsatPerformers = () => {
    const config = AgentsShoutOutsConfig[TopPerformersChart.TopCSATPerformers]
    return <AgentsShoutOut {...config} />
}
