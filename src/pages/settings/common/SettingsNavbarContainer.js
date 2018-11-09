import React from 'react'
import {connect} from 'react-redux'

import Navbar from '../../common/components/Navbar'
import SettingsNavbar from './components/SettingsNavbar'

type Props = {
    currentUser: Object,
    currentAccount: Object
}

class SettingsNavbarContainer extends React.Component<Props>{
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
        currentAccount: state.currentAccount
    }
}

export default connect(mapStateToProps)(SettingsNavbarContainer)
