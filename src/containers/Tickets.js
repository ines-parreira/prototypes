import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import DocumentTitle from 'react-document-title'
import * as MacroActions from '../actions/macro'
import * as TicketActions from '../actions/ticket'
import * as TicketsActions from '../actions/tickets'
import * as ViewActions from '../actions/view'
import * as UserActions from '../actions/user'
import * as SchemaActions from '../actions/schema'
import MacrosContainer from './Macros'
import TicketsView from '../components/ticket/ticketlist/TicketsView'
import {compactInteger} from '../utils'

class TicketsContainer extends React.Component {
    componentWillMount() {
        this.props.actions.schema.fetch()
        this.fetchPage()
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

        if (currentActive.isEmpty() && nextActive.isEmpty() && nextViews.get('items').size) {
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
            this.fetchPage(1, nextProps)
        }
    }

    fetchPage = (page = 1, props) => {
        const {tickets, actions, views} = props || this.props
        if (!(tickets.get('loading') || views.get('active').isEmpty())) {
            return actions.tickets.fetchTicketsPage(views, page)
        }
        return null
    }

    search = (query, params, stringQuery) => {
        /** populate tickets state from search results now **/

        const view = this.props.views.get('active')

        if (stringQuery && stringQuery.length > 2) {
            this.props.actions.view.updateView(view.merge({search: {query, params}}))
        } else if (view.get('search')) {
            this.props.actions.view.updateView(view.delete('search'))
        }
    }

    render() {
        let slug = ''

        if (this.props.params) {
            slug = this.props.params.view
        }

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
                <div className="TicketsContainer">
                    <TicketsView
                        tickets={this.props.tickets}
                        views={this.props.views}
                        schemas={this.props.schemas}
                        users={this.props.users}
                        currentUser={this.props.currentUser}
                        tags={this.props.tags.get('items')}

                        actions={this.props.actions}

                        fetchPage={this.fetchPage}
                        search={this.search}
                        slug={slug}
                    />
                    <MacrosContainer
                        disableExternalActions selectionMode
                        selected={this.props.tickets.get('selected')}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

TicketsContainer.propTypes = {
    tickets: PropTypes.shape({
        items: PropTypes.array,
        resp_meta: PropTypes.shape({
            page: PropTypes.number,
            nb_pages: PropTypes.number
        }),
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
    params: PropTypes.object
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

export default connect(mapStateToProps, mapDispatchToProps)(TicketsContainer)
