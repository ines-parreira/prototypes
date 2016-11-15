import React from 'react'
import StatsNavbarView from './components/StatsNavbarView'
import Navbar from '../../common/components/Navbar'

export default class StatsNavbarContainer extends React.Component {
    render() {
        return (
            <Navbar activeContent="statistics">
                <StatsNavbarView />
            </Navbar>
        )
    }
}
