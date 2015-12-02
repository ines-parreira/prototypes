import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'

import * as TicketActions from '../actions/ticket'
import TicketsView from '../components/ticket/TicketsView'

class TicketsContainer extends React.Component {
    constructor(props) {
        super(props)
        this.pushState = this.pushState.bind(this)
    }

    pushState(url) {
        this.props.pushState(null, url)
    }

    fetchTickets(props) {
        this.props.actions.fetchView(`/api/tickets/?view=${props.view || props.params.view}`)
    }
    componentWillMount() {
        this.fetchTickets(this.props)
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.params && this.props.params && nextProps.params.view !== this.props.params.view) {
            this.fetchTickets(nextProps)
        }
    }

    render() {
        return (
            <div className="TicketsContainer">
                <TicketsView
                    title={this.props.title}
                    tickets={this.props.tickets}
                    pushState={this.pushState} />
            </div>
        )
    }
}

TicketsContainer.propTypes = {
    view: PropTypes.string,
    title: PropTypes.string.isRequired,
    tickets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object,
    pushState: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        tickets: state.tickets,
        title: state.title,
        error: state.error
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TicketActions, dispatch),
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsContainer)
