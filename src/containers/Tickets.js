import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { Map, List } from 'immutable'


import * as TicketActions from '../actions/ticket'
import * as ViewActions from '../actions/view'
import * as UserActions from '../actions/user'
import * as TagActions from '../actions/tag'

import TicketsView from '../components/ticket/TicketsView'
import TicketColumns from '../components/ticket/TicketColumns'
import { DEFAULT_VIEW } from '../constants'


class TicketsContainer extends React.Component {
    getView = (props) => {
        // TODO: Use reselect for this
        const usedProps = props || this.props
        const { views, params } = usedProps
        const viewName = params ? params.view : DEFAULT_VIEW

        if (!views || !views.get('items').size) {
            // Return something so sub-components can start rendering while the view loads
            return Map({ slug: viewName })
        }

        return views.getIn(['items', viewName])
    }

    pushState = (url) => {
        this.props.pushState(null, url)
    }

    getViewColumns = () => {
        const currentColumns = this.getView().get('columns')
        if (!currentColumns) {
            return List()
        }
        return TicketColumns.filter((column) =>
            currentColumns.includes(column.get('name'))
        )
    }

    componentDidMount = () => {
        this.props.actions.tag.fetchTags()
        this.props.actions.user.fetchUsers()

        if (!this.props.views.get('loading')) {
            this.fetchPage()
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.props.views.get('loading') &&
            !nextProps.views.get('loading') &&
            nextProps.views.get('items').size) {
            this.fetchPage(1, nextProps)
        }

        if (this.getView().get('groupedFilters') !== this.getView(nextProps).get('groupedFilters')) {
            this.fetchPage(1, nextProps)
        }
    }

    componentDidUpdate = (prevProps) => {
        const settingsLoaded = prevProps.settings.get('loading') !== this.props.settings.get('loading')
        const viewChanged = this.getView(prevProps).get('slug') !== this.getView().get('slug')
        if (!this.props.views.get('loading') && this.props.views.get('items').size && (settingsLoaded || viewChanged)) {
            this.fetchPage()
        }
    }

    fetchPage = (page = 1, props) => {
        const { tickets, settings, actions } = props || this.props
        const loadPossible = !tickets.get('loading') && !settings.get('loading')
        if (loadPossible) {
            return actions.ticket.fetchPageFromAlgolia(settings, this.getView(props), page)
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
                    fetchPage={this.fetchPage}
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
    settings: PropTypes.object.isRequired,
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
        currentUser: state.currentUser,
        settings: state.settings,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            view: bindActionCreators(ViewActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch)
        },
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsContainer)
