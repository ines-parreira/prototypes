import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {withRouter} from 'react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import _merge from 'lodash/merge'
import _pick from 'lodash/pick'

import shortcutManager from '../../../services/shortcutManager'
import DocumentTitle from 'react-document-title'
import TicketView from './components/TicketView'
import Loader from '../../common/components/Loader'
import * as ViewsActions from '../../../state/views/actions'
import * as TicketActions from '../../../state/ticket/actions'
import * as MacroActions from '../../../state/macro/actions'
import * as UserActions from '../../../state/users/actions'
import * as TagActions from '../../../state/tags/actions'
import * as ticketsActions from '../../../state/tickets/actions'
import socketManager from '../../../services/socketManager'

import * as newMessageActions from '../../../state/newMessage/actions'

import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import * as newMessageSelectors from '../../../state/newMessage/selectors'
import * as viewsSelectors from '../../../state/views/selectors'
import * as ticketSelectors from '../../../state/ticket/selectors'
import * as userSelectors from '../../../state/users/selectors'
import {updateMessageText} from './components/replyarea/TicketReplyEditor'

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
        newMessageSource: newMessageSelectors.getNewMessageSource(state)
    }
}, (dispatch) => {
    return {
        actions: {
            macro: bindActionCreators(MacroActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
            views: bindActionCreators(ViewsActions, dispatch),
            newMessage: bindActionCreators(newMessageActions, dispatch),
        },
        updateActiveViewCursor: bindActionCreators(ticketsActions.updateCursor, dispatch),
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
        updateActiveViewCursor: PropTypes.func.isRequired,
        activeView: PropTypes.object.isRequired,
        currentUser: PropTypes.object,
        macros: PropTypes.object,
        ticket: PropTypes.object,
        newMessage: PropTypes.object,
        tickets: PropTypes.object,
        users: PropTypes.object,
        pagination: ImmutablePropTypes.map.isRequired,
        activeUser: PropTypes.object,
        newMessageSource: PropTypes.object,

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

    _showTicket = () => {
        this.setState({
            isTicketHidden: false,
        })
    }

    _hideTicket = () => {
        return new Promise((resolve) => {
            this.setState({isTicketHidden: true})
            // 100ms to let the animation goes
            return setTimeout(resolve, 100)
        })
    }

    componentWillMount() {
        this.props.actions.tag.fetchTags()
        this.props.actions.user.fetchUsers(['agent', 'admin', 'bot'])
        this.props.actions.ticket.clearTicket()
        this.props.actions.ticket.fetchTicket(this.props.params.ticketId)

        const userId = parseInt(this.props.location.query.customer)
        if (
            this.props.params.ticketId === 'new' &&
            this.props.location.query.customer &&
            this.props.activeUser.get('id') !== userId
        ) {
            this.props.actions.user.fetchUser(userId)
        }
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillReceiveProps(nextProps) {
        const nextTicket = nextProps.ticket
        const nextCustomer = nextTicket.get('customer') || fromJS({})
        const nextParams = nextProps.params
        const nextUsers = nextProps.users
        const prevRecipients = this.props.newMessageSource.get('to') || fromJS([])
        const nextRecipients = nextProps.newMessageSource.get('to') || fromJS([])

        const ticketIdParamChanged = nextParams.ticketId !== this.props.params.ticketId
        const nextTicketIsNew = nextParams.ticketId === 'new'
        const nextTicketIdParamMatchesNextTicket = nextTicket.get('id', '').toString() === nextParams.ticketId
        const customerHasChanged = this.props.ticket.getIn(['customer', 'id']) !== nextCustomer.get('id')

        const hasCustomer = !nextCustomer.isEmpty()

        const recipientsHaveBeenRemoved = !prevRecipients.isEmpty() && nextRecipients.isEmpty()
        const recipientsHaveChanged = !prevRecipients.equals(nextRecipients)

        const onlyOneRecipient = nextRecipients.size === 1

        if (!nextTicketIsNew && nextTicket.get('customer') && !nextUsers.getIn(['userHistory', 'triedLoading'])) {
            const customerId = nextTicket.getIn(['customer', 'id'])

            if (!customerId) {
                return
            }

            // Fetch the ticket's customer history (tickets + events).
            this.props.actions.user.fetchUserHistory(customerId, {
                successCondition: (state) => {
                    return state.ticket.getIn(['customer', 'id']) === customerId
                }
            })
        }

        if (ticketIdParamChanged) {
            // if the ticket in the reducer is not the one asked, we fetch it and display it
            if (!nextTicketIsNew && !nextTicketIdParamMatchesNextTicket) {
                this.props.actions.ticket.clearTicket()
                this.props.actions.ticket.fetchTicket(nextParams.ticketId)
            }

            this._showTicket()
        }

        // set customer and receiver from query
        // map default channel (email) to address, for the receivers select.
        const receiver = nextProps.activeUser.set('address', nextProps.activeUser.get('email'))
        const customer = this.props.ticket.get('customer') || fromJS({})

        if (
            nextTicketIsNew &&
            nextProps.location.query.customer &&
            nextProps.activeUser.get('id') === parseInt(nextProps.location.query.customer) &&
            !customer.equals(receiver)
        ) {
            // set customer on ticket
            // (to show in infobar and be used in macros)
            this.props.actions.ticket.setCustomer(receiver).then(() => {
                // set in receivers selector
                return this.props.actions.newMessage.setReceivers({
                    to: [receiver.toJS()]
                }, true)
            })
        }

        // We update the cursor when we display the ticket for the first time.
        // If an attribute of the ticket changes, we don't want to update the cursor because
        // its position in the view has maybe changed.
        if (nextTicket.get('id') && nextTicket.get('id') !== this.props.ticket.get('id')) {
            this.props.updateActiveViewCursor(nextTicket.get(this.props.activeView.get('order_by')))
        }

        // When we're on a new ticket, the recipients have changed, and there's now exactly one recipient,
        // set this recipient as customer of the ticket
        const shouldSetFirstRecipientAsCustomer = recipientsHaveChanged && onlyOneRecipient

        if (nextTicketIsNew && shouldSetFirstRecipientAsCustomer) {
            const recipient = nextRecipients.first()
            let shouldSetCustomer = true

            // The recipient address may be in the channels of the customer, and not be his user.email address, so
            // to be sure we are not re-setting the same user as customer, we need to check every channel of the
            // current customer.

            if (nextCustomer && !nextCustomer.isEmpty()) {
                (nextCustomer.get('channels') || fromJS([])).forEach((channel) => {
                    if (channel.get('type') === 'email' && channel.get('address') === recipient.get('address')) {
                        shouldSetCustomer = false
                    }
                })
            }

            if (shouldSetCustomer) {
                this.props.actions.ticket.findAndSetCustomer(recipient.get('address'))
            }
        }

        // When we're on a new ticket and the agent has removed the receivers of the new message, empty the
        // customer of the ticket
        if (nextTicketIsNew && recipientsHaveBeenRemoved) {
            this.props.actions.ticket.setCustomer(null)
        }

        // When we're on a new ticket and the agent set a customer, set this customer's default email address
        // as recipient of the new message
        if (nextTicketIsNew && customerHasChanged && hasCustomer) {
            const newReceivers = _merge(
                _pick(nextProps.newMessageSource.toJS(), newMessageSelectors.getReceiversProperties()),
                {
                    to: [{
                        name: nextTicket.getIn(['customer', 'name']),
                        address: nextTicket.getIn(['customer', 'email'])
                    }]
                }
            )

            this.props.actions.newMessage.setReceivers(newReceivers)
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
        const customerId = this.props.ticket.getIn(['customer', 'id'])

        if (ticketId && ticketId !== 'new') {
            socketManager.leave('ticket', ticketId)
        }

        if (customerId) {
            socketManager.leave('user', customerId)
        }

        this.props.actions.ticket.clearTicket()
    }

    _bindKeys() {
        const modalVisible = () => this.props.macros.get('isModalOpen')

        shortcutManager.bind('TicketDetailContainer', {
            GO_BACK: {
                action: () => {
                    if (!modalVisible()) {
                        this.props.actions.ticket.clearTicket()
                        this.props.actions.ticket.goToPrevTicket(this.props.params.ticketId)
                    }
                }
            },
            GO_FORWARD: {
                action: () => {
                    if (!modalVisible()) {
                        this.props.actions.ticket.clearTicket()
                        this.props.actions.ticket.goToNextTicket(this.props.params.ticketId)
                    }
                }
            },
            SUBMIT_TICKET: {
                action: (e) => {
                    if (!modalVisible()) {
                        if (e.preventDefault) {
                            e.preventDefault()
                            e.stopImmediatePropagation()
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
                            e.stopImmediatePropagation()
                        }

                        this._submit('closed', true)
                    }
                }
            }
        })
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

        // flush any pending updates from the TicketReplyEditor debouncer
        updateMessageText.flush()

        let promise

        // The ticket does not exist yet.
        if (!ticket.get('id')) {
            const receiver = newMessage.getIn(['newMessage', 'receiver'])
            const sender = {id: this.props.currentUser.get('id')}
            ticket = ticket.mergeDeep({
                sender,
                customer: receiver,
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
        const {ticket, actions} = this.props
        return actions.ticket.setStatus(status, () => {
            // If the history is open, we don't want to go to the next ticket
            if (status === 'closed' && !ticket.getIn(['_internal', 'displayHistory'])) {
                const promise = this._hideTicket().then(this.props.actions.ticket.clearTicket)
                this.props.actions.ticket.goToNextTicket(this.props.params.ticketId, promise)
            }
        })
    }

    render() {
        if (
            (this.props.params.ticketId !== 'new' && !this.props.ticket.get('id'))
            || (this.props.params.ticketId === 'new' && this.props.ticket.get('id'))
            || this.props.ticket.getIn(['_internal', 'loading', 'fetchTicket'])
        ) {
            return <Loader message="Loading ticket..."/>
        }

        return (
            <DocumentTitle title={this.props.ticket.get('id') ? this.props.ticket.get('subject') : 'New ticket'}>
                <div className="TicketDetailContainer">
                    <TicketView
                        actions={this.props.actions}
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
