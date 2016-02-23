import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'

import TicketView from '../components/ticket/TicketView'

import * as TicketActions from '../actions/ticket'

class TicketContainer extends React.Component {
    constructor(props) {
        super(props)
        this.submit = this.submit.bind(this)
        this.update = this.update.bind(this)
    }

    componentWillMount() {
        this.props.actions.fetchView(
            `/api/tickets/${this.props.params.ticketId}/`,
            {view: this.props.view},
            'item'
        )
    }

    update(props) {
        this.props.actions.updateTicket(props)
    }

    submit(status) {
        this.props.actions.updateTicket({status})
        this.props.actions.submitTicket(this.props.ticket)
    }

    render() {
        return (
            <div className="TicketContainer">
                <TicketView
                    view={this.props.view}
                    ticket={this.props.ticket}
                    currentUser={this.props.currentUser}
                    update={this.update}
                    submit={this.submit}
                />
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
    currentUser: PropTypes.object,

    actions: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired
}

TicketContainer.defaultProps = {
    view: 'default'
}

function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TicketActions, dispatch),
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketContainer)
