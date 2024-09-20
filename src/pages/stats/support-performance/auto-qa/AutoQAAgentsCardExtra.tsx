import React from 'react'
import {AutoQAAgentPerformanceHeatmapSwitch} from 'pages/stats/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
import css from 'pages/stats/support-performance/auto-qa/AutoQAAgentsCardExtra.less'

export const AutoQAAgentsCardExtra = () => {
    return (
        <div className={css.wrapper}>
            <AutoQAAgentPerformanceHeatmapSwitch />
        </div>
    )
}
