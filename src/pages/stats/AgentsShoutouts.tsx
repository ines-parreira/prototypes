import React from 'react'

import css from 'pages/stats/AgentsShoutouts.less'
import AgentsShoutout from './AgentShoutout'
import {shoutoutsConfig} from './shoutouts-config'

export default function AgentsShoutouts() {
    return (
        <div
            className={css.grid}
            style={
                {
                    '--agents-shoutouts-columns': shoutoutsConfig.length,
                } as React.CSSProperties
            }
        >
            {shoutoutsConfig.map((config) => (
                <AgentsShoutout {...config} key={config.metricName} />
            ))}
        </div>
    )
}
