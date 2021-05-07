import React from 'react'

import Stats from './Stats.js'
import StatsFilters from './StatsFilters.js'

export default function StatsComponentContainer() {
    return (
        <div className="stats full-width">
            <StatsFilters />
            <Stats />
        </div>
    )
}
