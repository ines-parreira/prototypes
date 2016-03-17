import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WidgetActions from '../actions/widget'
import Sidebar from '../components/Sidebar'

class TicketsSidebarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        this.props.actions.fetchWidgets({
            ticket: this.props.ticket,
            type: 'ticket'
        })
    }

    render() {
        return (
            <Sidebar widgets={this.props.widgets}
                     currentUser={this.props.currentUser}
            />
        )
    }
}

TicketsSidebarContainer.propTypes = {
    widgets: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        widgets: state.widgets,
        ticket: state.ticket
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(WidgetActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsSidebarContainer)
