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

    componentWillMount() {
        this.fetchTickets(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params && this.props.params && nextProps.params.view !== this.props.params.view) {
            this.fetchTickets(nextProps)
        }
    }

    fetchTickets(props) {
        this.props.actions.fetchView(`/api/tickets/?view=${props.view || props.params.view}`)
    }

    pushState(url) {
        this.props.pushState(null, url)
    }



    render() {
        return (
            <div className="TicketsContainer">
                <TicketsView
                    tickets={this.props.tickets}
                    currentUser={this.props.currentUser}
                    pushState={this.pushState}/>
            </div>
        )
    }
}

TicketsContainer.propTypes = {
    view: PropTypes.string,
    tickets: PropTypes.shape({
        data: PropTypes.array,
        meta: PropTypes.object,
        uri: PropTypes.string,
        object: PropTypes.string
    }),
    currentUser: PropTypes.object,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object,
    pushState: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        tickets: state.tickets,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TicketActions, dispatch),
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsContainer)
