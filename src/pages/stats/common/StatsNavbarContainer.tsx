import React from 'react'

import Navbar from '../../common/components/Navbar'

import StatsNavbarView from './components/StatsNavbarView'

export default function StatsNavbarContainer() {
    return (
        <Navbar activeContent="statistics">
            <StatsNavbarView />
        </Navbar>
    )
}
