import React from 'react'

import AgentsShoutout from './AgentShoutout'
import {shoutoutsConfig} from './shoutouts-config'

import css from './AgentsShoutoutsGrid.less'

export default function AgentsShoutoutsGrid() {
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
