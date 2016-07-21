import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import Navbar from '../components/Navbar'

class UsersNavbarContainer extends React.Component {
    render() {
        return (
            <Navbar currentUser={this.props.currentUser} activeContent="users">
                <div></div>
            </Navbar>
        )
    }
}

UsersNavbarContainer.propTypes = {
    currentUser: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
    }
}

export default connect(mapStateToProps)(UsersNavbarContainer)
