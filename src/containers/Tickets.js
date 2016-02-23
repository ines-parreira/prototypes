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

    onInfiniteLoad() {
        const totalGettableItems = this.props.tickets.get('resp').meta.item_count

        if (this.props.tickets.get('items').length < totalGettableItems) {
            const view = this.props.view || this.props.params.view
            const page = this.props.tickets.get('page')
            const perPage = 50
            this.props.actions.fetchView(`/api/tickets/?view=${view}&page=${page}&per_page=${perPage}`)
        }
    }

    render() {
        return (
            <div className="TicketsContainer">
                <TicketsView
                    items={this.props.tickets.get('items')}
                    view={this.props.tickets.get('resp').meta.view}
                    currentUser={this.props.currentUser}
                    onInfiniteLoad={this.onInfiniteLoad.bind(this)}
                    isLoading={this.props.tickets.get('loading')}
                    pushState={this.pushState}/>
            </div>
        )
    }
}

TicketsContainer.propTypes = {
    view: PropTypes.string,
    tickets: PropTypes.shape({
        page: PropTypes.number,
        loading: PropTypes.bool,
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
