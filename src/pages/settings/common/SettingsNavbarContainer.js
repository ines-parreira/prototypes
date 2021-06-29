// @flow
import React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'

import Navbar from '../../common/components/Navbar.tsx'

import SettingsNavbar from './components/SettingsNavbar'

type Props = {
    currentUser: Object,
    currentAccount: Object,
    location: Object,
}

class SettingsNavbarContainer extends React.Component<Props> {
    render() {
        return (
            <Navbar activeContent="settings">
                <SettingsNavbar {...this.props} />
            </Navbar>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        currentAccount: state.currentAccount,
    }
}

export default withRouter(connect(mapStateToProps)(SettingsNavbarContainer))
