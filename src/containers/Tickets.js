import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'

import * as TicketActions from '../actions/ticket'
import TicketsView from '../components/ticket/TicketsView'


class TicketsContainer extends React.Component {
    pushState = (url) => {
        this.props.pushState(null, url)
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.params && this.props.params && nextProps.params.view !== this.props.params.view) {
            this.fetchTickets(nextProps, 1)
        }
    }

    onInfiniteLoad = () => {
        if (!this.props.tickets.get('endReached')) {
            this.fetchTickets(this.props)
        }
    }

    fetchTickets = (props, getPage = null) => {
        const page = getPage || props.tickets.get('page') + 1
        props.actions.fetchView("/api/tickets/", {
            view: props.view || props.params.view,
            page: page,
            per_page: 50
        })
    }        

    render() {
        return (
            <div className="TicketsContainer">
                <TicketsView
                    items={this.props.tickets.get('items')}
                    view={this.props.tickets.get('resp').meta.view}
                    currentUser={this.props.currentUser}
                    onInfiniteLoad={this.onInfiniteLoad}
                    isLoading={this.props.tickets.get('loading')}
                    pushState={this.pushState} />
            </div>
        )
    }
}

TicketsContainer.propTypes = {
    view: PropTypes.string,
    tickets: PropTypes.shape({
        page: PropTypes.number,
        loading: PropTypes.bool,
        endReached: PropTypes.bool,
        items: PropTypes.array,
        resp: PropTypes.shape({
            meta: PropTypes.object,
            data: PropTypes.array,
            uri: PropTypes.string,
            object: PropTypes.string
        }),
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
