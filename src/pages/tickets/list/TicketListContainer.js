import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import DocumentTitle from 'react-document-title'
import {fromJS} from 'immutable'
import _ from 'lodash'
import * as MacroActions from '../../../state/macro/actions'
import * as TicketActions from '../../../state/ticket/actions'
import * as TicketsActions from '../../../state/tickets/actions'
import * as ViewActions from '../../../state/views/actions'
import * as UserActions from '../../../state/users/actions'
import * as SchemaActions from '../../../state/schema/actions'
import MacroContainer from '../common/macros/MacroContainer'
import TicketsView from './components/TicketsView'
import {compactInteger} from '../../../utils'

class TicketListContainer extends React.Component {
    componentWillMount() {
        this.props.actions.schema.fetch()
        const hasViewIdParameter = !!this.props.params.viewId

        // set active view as the first one
        const shouldSetFirstViewAsActive = !hasViewIdParameter
            && !this.props.views.get('items').isEmpty()

        if (shouldSetFirstViewAsActive) {
            this.props.actions.view.setViewActive(this.props.views.getIn(['items', 0]))
            this._setPage(1)
        }

        this.props.actions.tickets.fetchTicketsPage(
            this.props.tickets.getIn(['_internal', 'pagination', 'page'], 1)
        )
    }

    componentWillReceiveProps = (nextProps) => {
        const currentViews = this.props.views
        const nextViews = nextProps.views
        const currentActive = currentViews.get('active', fromJS({}))
        const nextActive = nextViews.get('active', fromJS({}))

        const isLoading = nextProps.views.get('loading')

        const hasViewIdParameter = !!this.props.params.viewId

        // set active view as the first one
        const shouldSetFirstViewAsActive = !hasViewIdParameter
            && nextViews.get('items').size
            && nextActive.isEmpty()

        if (shouldSetFirstViewAsActive) {
            this.props.actions.view.setViewActive(nextViews.getIn(['items', 0]))
        }

        // if the active view changed, fetch it again
        const currentPage = this.props.tickets.getIn(['_internal', 'pagination', 'page'], 1)
        let nextPage = nextProps.tickets.getIn(['_internal', 'pagination', 'page'], 1)

        // we ignore the fields because they get updated before any filtering is performed
        // ex: when fetching the Requester field enum
        const viewHasChanged = !currentActive.delete('fields').equals(nextActive.delete('fields'))

        const shouldFetchTickets = !isLoading
            && !nextActive.isEmpty()
            && (
                viewHasChanged
                // if the view has changed since the last time the container was mounted
                || nextProps.tickets.getIn(['_internal', 'currentViewId']) !== nextActive.get('id')
                // page changed
                || currentPage !== nextPage
            )

        // if view change or is edited, set active page to first page
        if (currentActive.get('id') !== nextActive.get('id') || viewHasChanged) {
            this._setPage(1, nextProps)
            nextPage = 1
        }

        if (shouldFetchTickets) {
            nextProps.actions.tickets.fetchTicketsPage(nextPage)
            amplitude.getInstance().logEvent('Opened view', _.pick(nextActive.toJS(), ['id', 'slug']))
        }
    }

    _setPage = (page = 1) => {
        this.props.actions.tickets.setPage(page)
    }

    _search = (query, params, stringQuery) => {
        /** populate tickets state from search results now **/
        const view = this.props.views.get('active')

        if (stringQuery) {
            this.props.actions.view.updateView(view.merge({search: {query, params}}))
        } else if (view.get('search')) {
            this.props.actions.view.updateView(view.set('search', null))
        }
    }

    render() {
        if (!this.props.views.get('active')) {
            return null
        }

        const active = this.props.views.get('active', fromJS({}))
        let title = 'Loading...'

        if (!active.isEmpty()) {
            title = active.get('name')
            if (active.get('count', 0) > 0) {
                title = `(${compactInteger(active.get('count', 0))}) ${title}`
            }
        }

        return (
            <DocumentTitle title={title}>
                <div className="TicketListContainer">
                    <TicketsView
                        tickets={this.props.tickets}
                        views={this.props.views}
                        schemas={this.props.schemas}
                        users={this.props.users}
                        currentUser={this.props.currentUser}
                        tags={this.props.tags.get('items')}
                        actions={this.props.actions}
                        setPage={this._setPage}
                        search={this._search}
                    />
                    <MacroContainer
                        disableExternalActions selectionMode
                        selectedItemsIds={this.props.tickets.getIn(['_internal', 'selectedItemsIds'])}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

TicketListContainer.propTypes = {
    tickets: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    settings: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object,
    location: PropTypes.object
}

function mapStateToProps(state) {
    return {
        tickets: state.tickets,
        views: state.views,
        tags: state.tags,
        schemas: state.schemas,
        users: state.users,
        currentUser: state.currentUser,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            macro: bindActionCreators(MacroActions, dispatch),
            view: bindActionCreators(ViewActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            tickets: bindActionCreators(TicketsActions, dispatch),
            schema: bindActionCreators(SchemaActions, dispatch),
            user: bindActionCreators(UserActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketListContainer)
