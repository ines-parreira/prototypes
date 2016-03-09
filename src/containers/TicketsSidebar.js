import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as ViewActions from '../actions/view'
import Sidebar from '../components/Sidebar'

class TicketsSidebarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        this.props.actions.fetchViews(`/api/views/`, {
            type: "ticket-list"
        })
    }

    render() {
        return (
            <Sidebar views={this.props.views}
                     currentUser={this.props.currentUser}/>
        )
    }
}

TicketsSidebarContainer.propTypes = {
    views: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
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

export default connect(mapStateToProps, mapDispatchToProps)(TicketsSidebarContainer)
