import React from 'react'

import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'
import css from 'pages/stats/support-performance/agents/AgentsShoutouts.less'
import {agentsShoutoutsConfig} from 'pages/stats/support-performance/agents/AgentsShoutoutsConfig'

import AgentsShoutout from './AgentsShoutout'

export default function AgentsShoutouts() {
    const isMobileResolution = useIsMobileResolution()
    return (
        <div
            className={css.grid}
            style={
                {
                    '--agents-shoutouts-columns': isMobileResolution
                        ? 0
                        : agentsShoutoutsConfig.length,
                } as React.CSSProperties
            }
        >
            {agentsShoutoutsConfig.map((config) => (
                <AgentsShoutout {...config} key={config.metricName} />
            ))}
        </div>
    )
}
