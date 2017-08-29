import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {browserHistory, withRouter} from 'react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import shortcutManager from '../../../services/shortcutManager'
import DocumentTitle from 'react-document-title'
import TicketView from './components/TicketView'
import Loader from '../../common/components/Loader'
import * as ViewsActions from '../../../state/views/actions'
import * as TicketActions from '../../../state/ticket/actions'
import * as MacroActions from '../../../state/macro/actions'
import * as UserActions from '../../../state/users/actions'
import * as TagActions from '../../../state/tags/actions'
import * as SettingsActions from '../../../state/settings/actions'
import socketManager from '../../../services/socketManager'

import * as newMessageActions from '../../../state/newMessage/actions'

import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import * as newMessageSelectors from '../../../state/newMessage/selectors'
import * as viewsSelectors from '../../../state/views/selectors'
import * as ticketSelectors from '../../../state/ticket/selectors'
import * as userSelectors from '../../../state/users/selectors'

@withRouter
@connect((state) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        activeUser: userSelectors.getActiveUser(state),
        currentUser: state.currentUser,
        macros: state.macros,
        pagination: viewsSelectors.getPagination(state),
        users: state.users,
        routing: state.routing,
        ticket: state.ticket,
        newMessage: state.newMessage,
        tickets: state.tickets,
        isTicketDirty: ticketSelectors.isDirty(state),
        canSendMessage: currentAccountSelectors.isAccountActive(state) && newMessageSelectors.isReady(state),
    }
}, (dispatch) => {
    return {
        actions: {
            macro: bindActionCreators(MacroActions, dispatch),
            settings: bindActionCreators(SettingsActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
            views: bindActionCreators(ViewsActions, dispatch),
            newMessage: bindActionCreators(newMessageActions, dispatch),
        },
        submitTicket: bindActionCreators(newMessageActions.submitTicket, dispatch),
        submitTicketMessage: bindActionCreators(newMessageActions.submitTicketMessage, dispatch),
    }
})
export default class TicketDetailContainer extends React.Component {
    static propTypes = {
        params: PropTypes.shape({
            view: PropTypes.string,
            page: PropTypes.string,
            ticketId: PropTypes.string,
        }).isRequired,
        isTicketDirty: PropTypes.bool.isRequired,
        canSendMessage: PropTypes.bool.isRequired,

        actions: PropTypes.object.isRequired,
        submitTicket: PropTypes.func.isRequired,
        submitTicketMessage: PropTypes.func.isRequired,
        activeView: PropTypes.object.isRequired,
        currentUser: PropTypes.object,
        macros: PropTypes.object,
        ticket: PropTypes.object,
        newMessage: PropTypes.object,
        tickets: PropTypes.object,
        users: PropTypes.object,
        pagination: ImmutablePropTypes.map.isRequired,
        activeUser: PropTypes.object,

        routing: PropTypes.object,

        // React Router
        router: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
    }

    static defaultProps = {
        isTicketDirty: false,
    }

    state = {
        isTicketHidden: false,
    }

    _fetchTicketData = (ticketId) => this.props.actions.ticket.fetchTicket(ticketId)

    _showTicket = () => {
        this.setState({
            isTicketHidden: false,
        })
    }

    _hideTicket = () => {
        this.setState({
            isTicketHidden: true,
        })
    }

    componentWillMount() {
        this.props.actions.tag.fetchTags()
        this.props.actions.user.fetchUsers(['agent', 'admin'])
        this.props.actions.ticket.clearTicket()
        this._fetchTicketData(this.props.params.ticketId)

        const userId = parseInt(this.props.location.query.requester)
        if (
            this.props.params.ticketId === 'new' &&
            this.props.location.query.requester &&
            this.props.activeUser.get('id') !== userId
        ) {
            this.props.actions.user.fetchUser(userId)
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
                successCondition: (state) => {
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
        }

        if (nextProps.params.ticketId !== this.props.params.ticketId) {
            this._showTicket()
        }

        // set requester and receiver from query
        // map default channel (email) to address, for the receivers select.
        const receiver = nextProps.activeUser.set('address', nextProps.activeUser.get('email'))
        const requester = this.props.ticket.get('requester') || fromJS({})
        if (
            nextProps.params.ticketId === 'new' &&
            nextProps.location.query.requester &&
            nextProps.activeUser.get('id') === parseInt(nextProps.location.query.requester) &&
            !requester.equals(receiver)
        ) {
            // set requester on ticket
            // (to show in infobar and be used in macros)
            this.props.actions.ticket.setRequester(receiver).then(() => {
                // set in receivers selector
                return this.props.actions.newMessage.setReceivers({
                    to: [receiver.toJS()]
                }, true)
            })
        }
    }

    componentDidUpdate = (prevProps) => {
        if (prevProps.macros.get('isModalOpen') && !this.props.macros.get('isModalOpen')) {
            this._bindKeys()
        }
    }

    componentWillUnmount() {
        window.onbeforeunload = null

        shortcutManager.unbind('TicketDetailContainer')

        // leaving ticket and request user from socket io
        const ticketId = this.props.params.ticketId
        const requesterId = this.props.ticket.getIn(['requester', 'id'])

        if (ticketId && ticketId !== 'new') {
            socketManager.leave('ticket', ticketId)
        }

        if (requesterId) {
            socketManager.leave('user', requesterId)
        }

        this.props.actions.ticket.clearTicket()
    }

    _bindKeys() {
        const modalVisible = () => this.props.macros.get('isModalOpen')

        shortcutManager.bind('Search')
        shortcutManager.bind('TicketDetailContainer', {
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

                        if (!this.props.canSendMessage) {
                            return
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

                        if (!this.props.canSendMessage) {
                            return
                        }

                        this._submit('closed', true)
                    }
                }
            }
        })
    }

    _computeNextUrl = (ascending) => {
        let nextTicketUrl = '/app'
        const translation = ascending ? 1 : -1
        const ticketId = this.props.ticket.get('id')

        if (!ticketId) {
            return false
        }

        const currentTicketIndex = this.props.tickets.get('items', fromJS([]))
            .findIndex(ticket => ticket.get('id') === ticketId)

        if (!currentTicketIndex && currentTicketIndex !== 0) {
            return false
        }

        const nextIndex = currentTicketIndex + translation
        const nextTicket = this.props.tickets.get('items').toJS()[nextIndex]
        const activeView = this.props.activeView

        if (nextTicket && nextTicket.id) {
            nextTicketUrl = `/app/ticket/${nextTicket.id}`
        } else if (!activeView.isEmpty()) {
            nextTicketUrl = `/app/tickets/${activeView.get('id')}/${activeView.get('slug')}`

            // if the active view is a search view, come back to it
            const searchedTerm = activeView.get('search')
            if (searchedTerm) {
                nextTicketUrl = `/app/tickets/search?q=${encodeURIComponent(searchedTerm)}`
            } else {
                const page = this.props.pagination.get('page')
                if (page && page > 1) {
                    nextTicketUrl += `?page=${page}`
                }
            }
        }

        return nextTicketUrl
    }

    _submit = (status, next, action, resetMessage = true) => {
        let {newMessage, ticket} = this.props
        if (newMessage.getIn(['_internal', 'loading', 'submitMessage'])) {
            // We're already submitting something, we dont want to POST twice.
            // Or the ticket isn't dirty, and we don't want to send an empty message.
            return
        }

        if (!this.props.canSendMessage) {
            return
        }

        let promise

        // The ticket does not exist yet.
        if (!ticket.get('id')) {
            const receiver = newMessage.getIn(['newMessage', 'receiver'])
            const sender = {id: this.props.currentUser.get('id')}
            ticket = ticket.mergeDeep({
                sender,
                requester: receiver,
                receiver,
                newMessage: {
                    sender
                }
            })

            promise = this.props.submitTicket(
                ticket,
                status,
                this.props.ticket.getIn(['state', 'appliedMacro', 'actions']),
                this.props.currentUser,
                resetMessage
            )
        } else {
            promise = this.props.submitTicketMessage(
                status,
                this.props.ticket.getIn(['state', 'appliedMacro', 'actions']),
                action,
                resetMessage
            )

            // clear applied action after submitting message
            this.props.actions.ticket.clearAppliedMacro(ticket.get('id'))
        }

        if (status && promise) {
            // set status
            promise.then(() => {
                return this._setStatus(status)
            })
        }

        return promise
    }

    _setStatus = (status) => {
        return this.props.actions.ticket.setStatus(status, () => {
            if (status === 'closed') {
                const nextUrl = this._computeNextUrl(true)

                // redirect to the next ticket after the transition is done.
                if (nextUrl) {
                    this._hideTicket()
                    // delay redirect to let the hiding animation appear
                    setTimeout(() => browserHistory.push(nextUrl), 300)
                }
            }
        })
    }

    render() {
        if (
            (this.props.params.ticketId !== 'new' && !this.props.ticket.get('id'))
            || (this.props.params.ticketId === 'new' && this.props.ticket.get('id'))
            || this.props.ticket.getIn(['_internal', 'loading', 'fetchTicket'])
        ) {
            return <Loader message="Loading ticket..." />
        }

        return (
            <DocumentTitle title={this.props.ticket.get('id') ? this.props.ticket.get('subject') : 'New ticket'}>
                <div className="TicketDetailContainer">
                    <TicketView
                        actions={this.props.actions}
                        computeNextUrl={this._computeNextUrl}
                        hideTicket={this._hideTicket}
                        isTicketHidden={this.state.isTicketHidden}
                        submit={this._submit}
                        view={this.props.activeView}
                        setStatus={this._setStatus}
                    />
                </div>
            </DocumentTitle>
        )
    }
}
