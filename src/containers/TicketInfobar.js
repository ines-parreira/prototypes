import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as WidgetActions from '../actions/widget'
import Infobar from '../components/Infobar'
import TicketInfobar from '../components/ticket/ticketview/TicketInfobar'


class TicketsInfobarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        this.props.actions.fetchWidgets({
            ticket: this.props.ticket,
            type: 'ticket'
        })
    }

    render() {
        // TODO(@xarg): quick fix to not display the sidebar if there is no customer info
        if (!this.props.ticket.get('customer')) {
            return null
        }

        const content = (
            <TicketInfobar
                ticket={this.props.ticket}
                widgets={this.props.widgets}
            />
        )

        return (
            <Infobar content={content}/>
        )
    }
}

TicketsInfobarContainer.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(TicketsInfobarContainer)
