import React, {PropTypes} from 'react'
import {connect} from 'react-redux'

import Navbar from '../../common/components/Navbar'

class IntegrationNavbarContainer extends React.Component {
    render() {
        // For now we have only integrations so we put them at top level, they'll move one level down eventually.
        return (
            <Navbar currentUser={this.props.currentUser} activeContent="integrations">
                <div></div>
            </Navbar>
        )
    }
}

IntegrationNavbarContainer.propTypes = {
    currentUser: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser
    }
}

export default connect(mapStateToProps)(IntegrationNavbarContainer)
