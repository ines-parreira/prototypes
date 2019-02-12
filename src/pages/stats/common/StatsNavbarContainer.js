import React from 'react'

import Navbar from '../../common/components/Navbar'

import StatsNavbarView from './components/StatsNavbarView'

export default class StatsNavbarContainer extends React.Component {
    render() {
        return (
            <Navbar activeContent="statistics">
                <StatsNavbarView />
            </Navbar>
        )
    }
}
