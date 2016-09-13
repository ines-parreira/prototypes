import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import Navbar from '../../common/components/Navbar'

class StatsNavbarContainer extends React.Component {
    render() {
        return (
            <Navbar currentUser={this.props.currentUser} activeContent="stats">
                <div></div>
            </Navbar>
        )
    }
}

StatsNavbarContainer.propTypes = {
    currentUser: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser
    }
}

export default connect(mapStateToProps)(StatsNavbarContainer)
