import React, {PropTypes} from 'react'
import {browserHistory, withRouter} from 'react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as mousetrap from 'mousetrap'
import DocumentTitle from 'react-document-title'
import TicketView from '../components/ticket/ticketview/TicketView'
import {Loader} from '../components/Loader'
import * as TicketsActions from '../actions/tickets'
import * as TicketActions from '../actions/ticket'
import * as MacroActions from '../actions/macro'
import * as UserActions from '../actions/user'
import * as TagActions from '../actions/tag'
import * as SettingsActions from '../actions/settings'
import MacrosContainer from './Macros' // import that to fetch tags list


class TicketContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = { unbindConfirmationHook: () => {} }
    }

    componentWillMount() {
        if (this.props.params.ticketId !== 'new') {
            this.props.actions.ticket.fetchTicketDetails(this.props.params.ticketId)
        } else {
            this.props.actions.ticket.setupNewTicket()
        }
        this.props.actions.macro.fetchMacros()
        this.props.actions.tag.fetchTags()
        this.props.actions.user.fetchUsers('agent')
    }

    confirmLeaveWhenDirty = (e, suffix = '') => {
        /**
         * When using window.onbeforeunload, the text '\n\n Are you sure you want to reload this page?' is not
         * removable. So we need to deal with it and try to be as consistent as possible when using
         * router.setRouteLeaveHook.
         *
         * Using the suffix, we have:
         *  - window.onbeforeunload:    'You have unsaved changes! \n\n Are you sure you want to reload this page?'
         *  - router.setRouteLeaveHook: 'You have unsaved changes! \n\n Are you sure you want to leave this page?'
         */

        if (this.props.ticket.getIn(['state', 'dirty'])) {
            return `You have unsaved changes! ${suffix}`
        }
        return null
    }

    bindConfirmToRouter() {
        this.setState({ unbindConfirmationHook: this.props.router.setRouteLeaveHook(
            this.props.route,
            (e) => this.confirmLeaveWhenDirty(e, '\n\nAre you sure you want to leave this page?')
        )})
    }

    forcePush(url) {
        this.state.unbindConfirmationHook()
        browserHistory.push(url)
        this.bindConfirmToRouter()
    }

    componentDidMount() {
        // Have to bind these here so they capture at the correct level
        const macrosVisible = () => this.props.macros.get('visible')

        mousetrap.bind('escape', () => {
            if (macrosVisible()) {
                this.props.actions.macro.setMacrosVisible(false)
            }
        })
        mousetrap.bind('return', (e) => {
            if (macrosVisible()) {
                e.preventDefault()
                e.stopPropagation()
                this.applyMacro(this.props.macros.get('selected'))
            }
        })
        mousetrap.bind('up', (e) => {
            if (macrosVisible()) {
                e.preventDefault()
                this.props.actions.macro.previewAdjacentMacro('prev')
            }
        })
        mousetrap.bind('down', (e) => {
            if (macrosVisible()) {
                e.preventDefault()
                this.props.actions.macro.previewAdjacentMacro('next')
            }
        })
        mousetrap.bind('left', () => {
            const nextUrl = this.computeNextUrl(false)

            if (nextUrl) {
                browserHistory.push(nextUrl)
            }
        })
        mousetrap.bind('right', () => {
            const nextUrl = this.computeNextUrl(true)

            if (nextUrl) {
                browserHistory.push(nextUrl)
            }
        })
        mousetrap.bind('mod+enter', (e) => {
            if (e.preventDefault) {
                e.preventDefault()
            }

            this.submit('closed', true)
        })
        mousetrap.bind('mod+shift+enter', (e) => {
            if (e.preventDefault) {
                e.preventDefault()
            }

            this.submit()
        })

        this.bindConfirmToRouter()
        window.onbeforeunload = this.confirmLeaveWhenDirty
    }

    componentWillUnmount() {
        window.onbeforeunload = null
        mousetrap.unbind('escape')
        mousetrap.unbind('return')
        mousetrap.unbind('up')
        mousetrap.unbind('down')
        mousetrap.unbind('left')
        mousetrap.unbind('right')
        mousetrap.unbind('mod+enter')
        mousetrap.unbind('mod+shift+enter')
        this.props.actions.ticket.clearTicket()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.ticketId !== this.props.params.ticketId && nextProps.params.ticketId !== 'new') {
            /**
             * Fetch required data when loading a ticket.
             */
            this.props.actions.ticket.clearTicket()
            this.props.actions.ticket.fetchTicketDetails(nextProps.params.ticketId)
        } else if (this.props.params.ticketId === 'new' && nextProps.ticket.get('id')) {
            /**
             * Redirect to the new page when submitting a new ticket.
             */
            this.forcePush(`/app/ticket/${nextProps.ticket.get('id')}/`)
        } else if (
            this.props.ticket.get('id') &&
            this.props.ticket.get('id') !== 'new' &&
            this.props.ticket.get('id') === nextProps.ticket.get('id') &&
            this.props.ticket.get('id').toString() === this.props.params.ticketId
        ) {
            /**
             * This is the autosave. Here, we check changes to the ticket state, and if there's any we make a
             * partial update to save only what has changed.
             */

            const data = {}

            if (this.props.ticket.get('status') !== nextProps.ticket.get('status')) {
                data.status = nextProps.ticket.get('status')
            }

            if (this.props.ticket.get('tags').size !== nextProps.ticket.get('tags').size) {
                data.tags = nextProps.ticket.get('tags')
            }

            if (this.props.ticket.get('priority') !== nextProps.ticket.get('priority')) {
                data.priority = nextProps.ticket.get('priority')
            }

            if (this.props.ticket.getIn(['assignee_user', 'id']) !== nextProps.ticket.getIn(['assignee_user', 'id'])) {
                data.assignee_user = { id: nextProps.ticket.getIn(['assignee_user', 'id']) }
            }

            if (this.props.ticket.get('subject') !== nextProps.ticket.get('subject')) {
                data.subject = nextProps.ticket.get('subject')
            }

            if (Object.keys(data).length) {
                this.props.actions.ticket.ticketPartialUpdate(nextProps.ticket.get('id'), data)
            }
        }
    }

    componentDidUpdate = (prevProps) => {
        const prevMacros = prevProps.macros.get('items')
        const macros = this.props.macros.get('items')
        if (prevMacros.size === 0 && macros.size !== 0) {
            this.props.actions.macro.previewMacro(macros.valueSeq().first())
        }
    }

    applyMacro = (macro) => {
        this.props.actions.macro.applyMacro(macro, this.props.currentUser)
    }

    computeNextUrl(ascending) {
        const translation = ascending ? 1 : -1
        const nextTicket = this.props.tickets.get('items').toJS()[
            this.props.tickets.get('currentTicketIndex') + translation
        ]

        let nextTicketUrl = null

        if (nextTicket) {
            nextTicketUrl = `/app/ticket/${nextTicket.id}`
            this.props.actions.tickets.saveIndex(this.props.tickets.get('currentTicketIndex') + translation)
        }

        return nextTicketUrl
    }

    submit = (status, next, action) => {
        let ticket = this.props.ticket

        if (!ticket.get('id')) {
            ticket = ticket.set('sender', {id: this.props.currentUser.get('id')})
                .set('requester', ticket.getIn(['newMessage', 'receiver']))
                .set('receiver', ticket.getIn(['newMessage', 'receiver']))
                .setIn(['newMessage', 'sender'], {id: this.props.currentUser.get('id')})
        }

        if (action === 'force') {
            ticket.getIn(['messages', 'actions'])
        }

        if (ticket.get('subject') || window.confirm('Are you sure you want to create a ticket with no subject?')) {
            this.props.actions.ticket.submitTicket(
                ticket,
                status,
                this.props.macros.getIn(['appliedMacro', 'actions']),
                this.props.currentUser,
                action
            )

            if (next) {
                /**
                 * `next` is a boolean indicating whether the agent want to be redirected to the next ticket.
                 *
                 * If he does, we first try to get the naive next ticket (the ticket at the current index + 1).
                 * If the ticket doesnt exist, then we can't redirect the agent.
                 * If it does, we save the new index (the old index + 1) as the new current index, then we push
                 * the new state to the application.
                 */
                const nextTicketUrl = this.computeNextUrl(true)
                this.forcePush(nextTicketUrl)
            }
        }
    }

    render() {
        const view = this.props.views.get('active')

        if (
            this.props.params.ticketId !== 'new' && this.props.ticket.get('messages').isEmpty()
            || this.props.params.ticketId === 'new' && this.props.ticket.get('id')
        ) {
            return <Loader />
        }

        return (
            <DocumentTitle title={`${this.props.ticket.get('subject')}`}>
                <div className="TicketContainer">
                    <TicketView
                        actions={this.props.actions}
                        ticket={this.props.ticket}
                        macros={this.props.macros}
                        currentUser={this.props.currentUser}
                        tags={this.props.tags}
                        users={this.props.users}
                        settings={this.props.settings}
                        submit={this.submit}
                        applyMacro={this.applyMacro}
                        view={view}
                    />
                    <MacrosContainer />
                </div>
            </DocumentTitle>
        )
    }
}

TicketContainer.propTypes = {
    params: PropTypes.shape({
        view: PropTypes.string,
        page: PropTypes.string,
        ticketId: PropTypes.string
    }).isRequired,

    ticket: PropTypes.object,
    tickets: PropTypes.object,
    macros: PropTypes.object,
    tags: PropTypes.object,
    users: PropTypes.object,
    currentUser: PropTypes.object,
    settings: PropTypes.object,
    views: PropTypes.object,
    routing: PropTypes.object,

    actions: PropTypes.object.isRequired,

    // React Router
    router: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired
}


function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        tickets: state.tickets,
        macros: state.macros,
        tags: state.tags,
        users: state.users,
        currentUser: state.currentUser,
        settings: state.settings,
        views: state.views,
        routing: state.routing
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            tickets: bindActionCreators(TicketsActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            macro: bindActionCreators(MacroActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
            settings: bindActionCreators(SettingsActions, dispatch)
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TicketContainer))
