import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import DocumentTitle from 'react-document-title'
import * as TicketActions from '../actions/ticket'
import * as ViewActions from '../actions/view'
import * as UserActions from '../actions/user'
import * as SchemaActions from '../actions/schema'
import TicketsView from '../components/ticket/ticketlist/TicketsView'

class TicketsContainer extends React.Component {
    componentWillMount() {
        this.props.actions.schema.fetch()
        this.fetchPage()
    }

    // Test if we need to re-fetch the data
    componentWillReceiveProps = (nextProps) => {
        const currentViews = this.props.views
        const nextViews = nextProps.views

        // if our view changed
        if (!nextViews.get('active').isEmpty() && (
                currentViews.get('active').isEmpty() ||
                currentViews.getIn(['active', 'slug']) !== nextViews.getIn(['active', 'slug']) ||
                currentViews.getIn(['active', 'filters']) !== nextViews.getIn(['active', 'filters']) ||
                currentViews.getIn(['active', 'search']) !== nextViews.getIn(['active', 'search'])
            )
        ) {
            this.fetchPage(1, nextProps)
        }
    }

    fetchPage = (page = 1, props) => {
        const {tickets, actions, views} = props || this.props
        if (!(tickets.get('loading') || views.get('active').isEmpty())) {
            return actions.ticket.fetchTicketsPage(views, page)
        }
        return null
    }

    search = (query, params, stringQuery) => {
        // populate users state from search results now
        const view = this.props.views.get('active')
        if (stringQuery) {
            this.props.actions.view.updateView(view.merge({search: {query, params}}))
        } else {
            this.props.actions.view.updateView(view.merge({search: {}}))
        }
    }

    render() {
        let slug = ''

        if (this.props.params) {
            slug = this.props.params.view
        }

        const active = this.props.views.get('active').toJS()
        let title = 'Loading...'
        if (Object.keys(active).length) {
            title = `${active.name}`
            if (active.count > 0) {
                title = `(${active.count}) ${title}`
            }
        }

        return (
            <DocumentTitle title={title}>
                <div className="TicketsContainer">
                    <TicketsView
                        tickets={this.props.tickets}
                        views={this.props.views}
                        schemas={this.props.schemas}
                        currentUser={this.props.currentUser}
                        actions={this.props.actions}

                        fetchPage={this.fetchPage}
                        search={this.search}
                        slug={slug}
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
    settings: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object
}

function mapStateToProps(state) {
    return {
        users: state.users,
        views: state.views,
        schemas: state.schemas,
        tickets: state.tickets,
        currentUser: state.currentUser,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            view: bindActionCreators(ViewActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            schema: bindActionCreators(SchemaActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsContainer)
