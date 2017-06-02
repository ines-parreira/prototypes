import React, {PropTypes} from 'react'
import {connect} from 'react-redux'

import Navbar from '../../common/components/Navbar'
import SettingsNavbar from './components/SettingsNavbar'

class SettingsNavbarContainer extends React.Component {
    render() {
        return (
            <Navbar activeContent="settings">
                <SettingsNavbar {...this.props} />
            </Navbar>
        )
    }
}

SettingsNavbarContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser
    }
}

export default connect(mapStateToProps)(SettingsNavbarContainer)
