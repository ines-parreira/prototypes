import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'
import _ from 'lodash'

import * as TicketActions from '../actions/ticket'
import * as ViewActions from '../actions/view'
import * as UserActions from '../actions/user'
import * as TagActions from '../actions/tag'

import TicketsView from '../components/ticket/TicketsView'
import { TicketColumns } from '../components/ticket/TicketColumns'
import { DEFAULT_VIEW } from '../constants'


class TicketsContainer extends React.Component {
    pushState = (url) => {
        this.props.pushState(null, url)
    }

    getView = (props) => {
        // TODO: Use reselect for this
        props = props || this.props
        const {views, view, params} = props
        const viewName = params ? params.view : DEFAULT_VIEW

        if (!views || !views.size) {
            // Return something so sub-components can start rendering while the view loads
            return {slug: viewName}
        }

        return views.get(viewName)
    }

    getViewColumns = () => {
        const currentColumns = this.getView().columns
        return _.filter(TicketColumns, (column) => {
            return _.includes(currentColumns, column.name)
        })
    }

    componentDidMount = () => {
        this.props.actions.tag.fetchTags()
        this.props.actions.user.fetchUsers()
    }

    componentDidUpdate = (prevProps) => {
        if (!this.getView(prevProps).filters_ast && this.getView().filters_ast) {
            this.props.actions.ticket.fetchPageFromAlgolia(this.getView(), 1)
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.params && this.props.params && nextProps.params.view !== this.props.params.view) {
            this.props.actions.ticket.fetchPageFromAlgolia(this.getView(nextProps), 1)
        }
    }

    render() {
        return (
            <div className="TicketsContainer">
                <TicketsView
                    tickets={this.props.tickets}
                    allTags={this.props.tags.get('items')}
                    allUsers={this.props.users.get('items')}
                    columns={this.getViewColumns()}
                    view={this.getView()}
                    currentUser={this.props.currentUser}
                    actions={this.props.actions}
                    pushState={this.pushState}
                    />
            </div>
        )
    }
}

TicketsContainer.propTypes = {
    tickets: PropTypes.shape({
        items: PropTypes.array,
        resp_meta: PropTypes.shape({
            page: PropTypes.number,
            nb_pages: PropTypes.number,
        }),
    }),
    views: PropTypes.object.isRequired,
    users: PropTypes.object,
    tags: PropTypes.object,
    currentUser: PropTypes.object,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object,
    pushState: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        tags: state.tags,
        users: state.users,
        views: state.views,
        tickets: state.tickets,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            view: bindActionCreators(ViewActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),            
            user: bindActionCreators(UserActions, dispatch),            
            tag: bindActionCreators(TagActions, dispatch),            
        },
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsContainer)
