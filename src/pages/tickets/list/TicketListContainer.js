import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import DocumentTitle from 'react-document-title'
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

        if (this.props.views.get('active').isEmpty() && this.props.views.get('items').size) {
            this.props.actions.view.setViewActive(this.props.views.getIn(['items', 0]))
        }
    }

    // Test if we need to re-fetch the data
    componentWillReceiveProps = (nextProps) => {
        const currentViews = this.props.views
        const nextViews = nextProps.views
        const currentActive = currentViews.get('active')
        const nextActive = nextViews.get('active')

        if (_.isEmpty(nextProps.params) && nextViews.get('items').size &&
            (
                nextViews.get('active').isEmpty() ||
                nextViews.getIn(['items', 0, 'id']) !== nextViews.getIn(['active', 'id'])
            )
        ) {
            this.props.actions.view.setViewActive(nextViews.getIn(['items', 0]))
        }

        // if our view changed
        if (currentActive && nextActive && !nextActive.isEmpty() &&
            (
                currentActive.isEmpty() ||
                // we ignore the fields because they get updated before any filtering is performed
                // Ex: when fetching the Requester field enum
                !currentActive.delete('fields').equals(nextActive.delete('fields'))
            )
        ) {
            this._fetchPage(1, nextProps)
            amplitude.getInstance().logEvent('Opened view', _.pick(nextActive.toJS(), ['id', 'slug']))
        }
    }

    _fetchPage = (page = 1, props) => {
        const {actions, views} = props || this.props
        if (!views.get('active').isEmpty()) {
            return actions.tickets.fetchTicketsPage(views, page)
        }
        return null
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

        const active = this.props.views.get('active').toJS()
        let title = 'Loading...'
        if (Object.keys(active).length) {
            title = `${active.name}`
            if (active.count > 0) {
                title = `(${compactInteger(active.count)}) ${title}`
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
                        fetchPage={this._fetchPage}
                        search={this._search}
                    />
                    <MacroContainer
                        disableExternalActions selectionMode
                        selected={this.props.tickets.get('selected')}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

TicketListContainer.propTypes = {
    tickets: PropTypes.shape({
        items: PropTypes.array,
        resp_meta: PropTypes.shape({
            page: PropTypes.number,
            nb_pages: PropTypes.number
        }),
        get: PropTypes.func,
        search: PropTypes.string
    }),
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
