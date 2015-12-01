import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'

import TicketView from '../components/ticket/TicketView'

import * as TicketActions from '../actions/ticket'

class TicketContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchView(`/api/tickets/${this.props.params.ticketId}/?view=${this.props.view}`, 'item')
    }

    render() {
        return (
            <div className="TicketContainer">
                <TicketView
                    view={this.props.view}
                    ticket={this.props.ticket} />
            </div>
        )
    }
}

TicketContainer.propTypes = {
    params: PropTypes.shape({
        ticketId: PropTypes.string
    }).isRequired,

    view: PropTypes.string,
    ticket: PropTypes.object,

    actions: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired
}

TicketContainer.defaultProps = {
    view: 'default',
    ticket: null
}

function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        error: state.error
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TicketActions, dispatch),
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketContainer)
