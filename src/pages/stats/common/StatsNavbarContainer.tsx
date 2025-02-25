import React from 'react'

import { ActiveContent, Navbar } from 'common/navigation'

import StatsNavbarView from './components/StatsNavbarView'

export default function StatsNavbarContainer() {
    return (
        <Navbar activeContent={ActiveContent.Statistics} title="Statistics">
            <StatsNavbarView />
        </Navbar>
    )
}
