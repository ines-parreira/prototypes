import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as ViewActions from '../actions/view'
import Navbar from '../components/Navbar'

class TicketsNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        this.props.actions.fetchViews()
    }

    render() {
        return (
            <Navbar views={this.props.views}
                    currentViewSlug={this.props.views.get('active')}
                    currentUser={this.props.currentUser}
                    applyView={this.props.actions.applyView}
            />
        )
    }
}

TicketsNavbarContainer.propTypes = {
    views: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        views: state.views,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ViewActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsNavbarContainer)
