import React, {PropTypes} from 'react'
import {browserHistory, withRouter} from 'react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import shortcutManager from '../../common/utils/shortcutManager'
import DocumentTitle from 'react-document-title'
import TicketView from './components/TicketView'
import {Loader} from '../../common/components/Loader'
import Timeline from '../../common/components/timeline/Timeline'
import * as ActivityActions from '../../../state/activity/actions'
import * as ViewsActions from '../../../state/views/actions'
import * as TicketActions from '../../../state/ticket/actions'
import * as MacroActions from '../../../state/macro/actions'
import * as UserActions from '../../../state/users/actions'
import * as TagActions from '../../../state/tags/actions'
import * as SettingsActions from '../../../state/settings/actions'
import MacroContainer from '../common/macros/MacroContainer' // import that to fetch tags list

class TicketDetailContainer extends React.Component {
    _fetchTicketData(id) {
        this.props.actions.ticket.fetchTicket(id)

        // get cached ticket reply message
        this.props.actions.ticket.fetchTicketReplyMessage(id)

        // get cached reply macros
        this.props.actions.macro.fetchTicketReplyMacro(id)
    }

    componentWillMount() {
        this.props.actions.macro.fetchMacros()
        this.props.actions.tag.fetchTags()
        this.props.actions.user.fetchUsers(['agent', 'admin'])
        this.props.actions.ticket.clearTicket()

        if (this.props.params.ticketId !== 'new') {
            this._fetchTicketData(this.props.params.ticketId)
        }
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillReceiveProps(nextProps) {
        /**
         * Fetch the ticket's requester history (tickets + events) after the ticket's details have been loaded.
         */
        if (
            nextProps.params.ticketId !== 'new'
            && nextProps.ticket.get('requester')
            && !nextProps.users.getIn(['userHistory', 'triedLoading'])
        ) {
            const askedUserId = nextProps.ticket.getIn(['requester', 'id'], '')
            this.props.actions.user.fetchUserHistory(askedUserId, {
                successCondition(state) {
                    return state.ticket.getIn(['requester', 'id'], '').toString() === askedUserId.toString()
                }
            })
        }

        if (
            nextProps.params.ticketId !== this.props.params.ticketId
            && nextProps.params.ticketId !== 'new'
        ) {
            /**
             * Fetch required data when loading a ticket.
             */
            if (this.props.params.ticketId !== 'new') {
                // Don't clear when creating a new ticket: looks better this way
                this.props.actions.ticket.clearTicket()
            }

            this._fetchTicketData(nextProps.params.ticketId)
        } else if (this.props.params.ticketId === 'new' && nextProps.ticket.get('id')) {
            /**
             * Redirect to the new page when submitting a new ticket.
             */
            this._forcePush(`/app/ticket/${nextProps.ticket.get('id')}/`)
        } else if (
            this.props.ticket.get('id')
            && this.props.ticket.get('id') !== 'new'
            && this.props.ticket.get('id') === nextProps.ticket.get('id')
            && this.props.ticket.get('id').toString() === this.props.params.ticketId
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
                data.assignee_user = {id: nextProps.ticket.getIn(['assignee_user', 'id'])}
            }

            if (this.props.ticket.get('subject') !== nextProps.ticket.get('subject')) {
                data.subject = nextProps.ticket.get('subject')
            }

            if (Object.keys(data).length) {
                this.props.actions.ticket.ticketPartialUpdate(
                    nextProps.ticket.get('id'),
                    data,
                    this._computeNextUrl(true)
                )
            }
        }
    }

    componentDidUpdate = (prevProps) => {
        const prevMacros = prevProps.macros.get('items')
        const macros = this.props.macros.get('items')
        if (prevMacros.size === 0 && macros.size !== 0) {
            this.props.actions.macro.previewMacro(macros.valueSeq().first())
        }

        if (prevProps.macros.get('isModalOpen') && !this.props.macros.get('isModalOpen')) {
            this._bindKeys()
        }
    }

    componentWillUnmount() {
        window.onbeforeunload = null

        shortcutManager.unbind('TicketDetailContainer')
    }

    _forcePush(url) {
        browserHistory.push(url)
    }

    _bindKeys() {
        // Have to bind these here so they capture at the correct level
        const macrosVisible = () => this.props.macros.get('visible')
        const modalVisible = () => this.props.macros.get('isModalOpen')

        shortcutManager.bind('TicketDetailContainer', {
            SHOW_MACROS: {
                action: (e) => {
                    if (!macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        this.props.actions.macro.setMacrosVisible(true)
                    }
                }
            },
            HIDE_MACROS: {
                action: () => {
                    if (macrosVisible() && !modalVisible()) {
                        this.props.actions.macro.setMacrosVisible(false)
                    }
                }
            },
            APPLY_MACRO: {
                action: (e) => {
                    if (macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        e.stopPropagation()
                        if (this.props.macros.get('selected')) {
                            this._applyMacro(this.props.macros.get('selected'))
                        }
                    }
                }
            },
            PREVIEW_PREV_MACRO: {
                action: (e) => {
                    if (macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        this.props.actions.macro.previewAdjacentMacro('prev')
                    }
                }
            },
            PREVIEW_NEXT_MACRO: {
                action: (e) => {
                    if (macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        this.props.actions.macro.previewAdjacentMacro('next')
                    }
                }
            },
            GO_BACK: {
                action: () => {
                    if (!modalVisible()) {
                        const nextUrl = this._computeNextUrl(false)

                        if (nextUrl) {
                            browserHistory.push(nextUrl)
                        }
                    }
                }
            },
            GO_FORWARD: {
                action: () => {
                    if (!modalVisible()) {
                        const nextUrl = this._computeNextUrl(true)

                        if (nextUrl) {
                            browserHistory.push(nextUrl)
                        }
                    }
                }
            },
            SUBMIT_TICKET: {
                action: (e) => {
                    if (!modalVisible()) {
                        if (e.preventDefault) {
                            e.preventDefault()
                        }
                        this._submit()
                    }
                }
            },
            SUBMIT_CLOSE_TICKET: {
                action: (e) => {
                    if (!modalVisible()) {
                        if (e.preventDefault) {
                            e.preventDefault()
                        }
                        this._submit('closed', true)
                    }
                }
            }
        })
    }

    _applyMacro = (macro) => {
        this.props.actions.macro.applyMacro(macro, this.props.currentUser, this.props.ticket.get('id'))
    }

    _computeNextUrl = (ascending) => {
        let nextTicketUrl = '/app'
        const translation = ascending ? 1 : -1
        const currentTicketIndex = this.props.views.getIn(['_internal', 'currentItemIndex'])

        if (!currentTicketIndex && currentTicketIndex !== 0) {
            return false
        }

        const nextIndex = currentTicketIndex + translation
        const nextTicket = this.props.tickets.get('items').toJS()[nextIndex]
        const activeView = this.props.views.get('active')

        if (nextTicket && nextTicket.id) {
            nextTicketUrl = `/app/ticket/${nextTicket.id}`
            this.props.actions.views.saveIndex(nextIndex)
        } else if (!activeView.isEmpty()) {
            nextTicketUrl = `/app/tickets/${activeView.get('id')}/${activeView.get('slug')}`
        }

        return nextTicketUrl
    }

    _submit = (status, next, action, resetMessage = true) => {
        let ticket = this.props.ticket

        if (ticket.getIn(['_internal', 'loading', 'submitMessage']) || !ticket.getIn(['state', 'dirty'])) {
            // We're already submitting something, we dont want to POST twice.
            // Or the ticket isn't dirty, and we don't want to send an empty message.
            return
        }

        // The ticket does not exist yet.
        if (!ticket.get('id')) {
            const receiver = ticket.getIn(['newMessage', 'receiver'])
            const sender = {id: this.props.currentUser.get('id')}
            ticket = ticket.mergeDeep({
                sender,
                requester: receiver,
                receiver,
                newMessage: {
                    sender
                }
            })

            if (ticket.get('subject') || window.confirm('Are you sure you want to create a ticket with no subject?')) {
                this.props.actions.ticket.submitTicket(
                    ticket,
                    status,
                    this.props.macros.getIn(['appliedMacro', 'actions']),
                    this.props.currentUser,
                    resetMessage
                )
            }
        } else {
            this.props.actions.ticket.submitTicketMessage(
                ticket,
                status,
                this.props.macros.getIn(['appliedMacro', 'actions']),
                this.props.currentUser,
                action,
                resetMessage
            )

            // clear applied action after submitting message
            this.props.actions.macro.clearAppliedMacro(ticket.get('id'))
        }

        if (next) {
            /**
             * `next` is a boolean indicating whether the agent wants to be redirected to the next ticket.
             *
             * If he does, we first try to get the naive next ticket (the ticket at the current index + 1).
             * If the ticket doesnt exist, then we can't redirect the agent.
             * If it does, we save the new index (the old index + 1) as the new current index, then we push
             * the new state to the application.
             */
            const nextTicketUrl = this._computeNextUrl(true)
            this._forcePush(nextTicketUrl)
        }
    }

    render() {
        const view = this.props.views.get('active')

        if (
            (this.props.params.ticketId !== 'new' && !this.props.ticket.get('id'))
            || (this.props.params.ticketId === 'new' && this.props.ticket.get('id'))
            || this.props.ticket.getIn(['_internal', 'loading', 'fetchTicket'])
        ) {
            return <Loader message="Loading ticket..." />
        }

        return (
            <DocumentTitle title={`${this.props.ticket.get('id') ? this.props.ticket.get('subject') : 'New ticket'}`}>
                <div
                    className="TicketDetailContainer"
                    onScroll={() => {
                        this.forceUpdate()
                    }}
                >
                    <Timeline
                        userHistory={this.props.users.get('userHistory')}
                        isDisplayed={this.props.ticket.getIn(['_internal', 'displayHistory'])}
                        actions={this.props.actions.ticket}
                        currentTicketId={this.props.ticket.get('id')}
                    />
                    <TicketView
                        actions={this.props.actions}
                        ticket={this.props.ticket}
                        macros={this.props.macros}
                        currentUser={this.props.currentUser}
                        tags={this.props.tags}
                        users={this.props.users}
                        settings={this.props.settings}
                        submit={this._submit}
                        applyMacro={this._applyMacro}
                        computeNextUrl={this._computeNextUrl}
                        view={view}
                    />
                    <MacroContainer />
                </div>
            </DocumentTitle>
        )
    }
}

TicketDetailContainer.propTypes = {
    params: PropTypes.shape({
        view: PropTypes.string,
        page: PropTypes.string,
        ticketId: PropTypes.string
    }).isRequired,

    activity: PropTypes.object,
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
        activity: state.activity,
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
            activity: bindActionCreators(ActivityActions, dispatch),
            views: bindActionCreators(ViewsActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            macro: bindActionCreators(MacroActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
            settings: bindActionCreators(SettingsActions, dispatch)
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TicketDetailContainer))
