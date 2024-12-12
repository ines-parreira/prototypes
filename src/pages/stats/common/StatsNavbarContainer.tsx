import React from 'react'

import {ActiveContent} from 'common/navigation'

import Navbar from '../../common/components/Navbar'

import StatsNavbarView from './components/StatsNavbarView'

export default function StatsNavbarContainer() {
    return (
        <Navbar activeContent={ActiveContent.Statistics}>
            <StatsNavbarView />
        </Navbar>
    )
}
