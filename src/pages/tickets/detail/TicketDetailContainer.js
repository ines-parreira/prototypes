//@flow
import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {fromJS, type List, type Map} from 'immutable'
import {parse} from 'query-string'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'

import DocumentTitle from 'react-document-title'

import shortcutManager from '../../../services/shortcutManager/index.ts'
import Loader from '../../common/components/Loader/Loader.tsx'
import * as ViewsActions from '../../../state/views/actions.ts'
import * as TicketActions from '../../../state/ticket/actions.ts'
import * as MacroActions from '../../../state/macro/actions.ts'
import * as customersActions from '../../../state/customers/actions.ts'
import * as TagActions from '../../../state/tags/actions.ts'
import * as ticketsActions from '../../../state/tickets/actions'
import socketManager from '../../../services/socketManager'
import pendingMessageManager from '../../../services/pendingMessageManager'

import * as newMessageActions from '../../../state/newMessage/actions.ts'

import * as currentAccountSelectors from '../../../state/currentAccount/selectors.ts'
import * as newMessageSelectors from '../../../state/newMessage/selectors.ts'
import * as viewsSelectors from '../../../state/views/selectors.ts'
import * as ticketSelectors from '../../../state/ticket/selectors.ts'
import * as customersSelectors from '../../../state/customers/selectors.ts'
import type {reactRouterLocation, reactRouterRoute} from '../../../types'

import TicketView from './components/TicketView'
import {updateMessageText} from './components/ReplyArea/TicketReplyEditor'

type Props = {
    match: {
        params: {
            view?: string,
            page?: string,
            ticketId?: string,
        },
    },
    isTicketDirty: boolean,
    canSendMessage: boolean,
    actions: {
        customers: typeof customersActions,
        macro: typeof MacroActions,
        newMessage: typeof newMessageActions,
        tag: typeof TagActions,
        ticket: typeof TicketActions,
        views: typeof ViewsActions,
    },
    updateActiveViewCursor: typeof ticketsActions.updateActiveViewCursor,
    submitTicket: typeof newMessageActions.submitTicket,
    activeView: Map<*, *>,
    currentUser: Map<*, *>,
    ticket: Map<*, *>,
    newMessage: Map<*, *>,
    tickets: Map<*, *>,
    customers: Map<*, *>,
    activeCustomer: Map<*, *>,
    newMessageSource: Map<*, *>,
    routing: Map<*, *>,
    route: reactRouterRoute,
    location: reactRouterLocation,
}

type State = {
    isTicketHidden: boolean,
}

export class TicketDetailContainer extends React.Component<Props, State> {
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
        return new Promise<void>((resolve) => {
            this.setState({isTicketHidden: true})
            // 100ms to let the animation goes
            return setTimeout(resolve, 100)
        })
    }

    componentWillMount() {
        const {
            actions: {
                customers: {fetchCustomer},
                tag: {fetchTags},
                ticket: {clearTicket, fetchTicket},
            },
            activeCustomer,
            location: {search},
            match: {
                params: {ticketId},
            },
        } = this.props
        fetchTags()
        clearTicket()
        fetchTicket(ticketId || '')

        const customerId = parse(search).customer
        if (
            ticketId === 'new' &&
            customerId &&
            activeCustomer.get('id') !== customerId
        ) {
            fetchCustomer(customerId)
        }
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillReceiveProps(nextProps: Props) {
        const {
            actions: {
                customers: {fetchCustomerHistory},
                newMessage: {setReceivers},
                ticket: {
                    clearTicket,
                    fetchTicket,
                    findAndSetCustomer,
                    setCustomer,
                },
            },
            activeView,
            newMessageSource,
            match: {
                params: {ticketId},
            },
            ticket,
            updateActiveViewCursor,
        } = this.props
        const nextTicket = nextProps.ticket
        const nextCustomer = nextTicket.get('customer') || fromJS({})
        const nextParams = nextProps.match.params
        const nextCustomers = nextProps.customers
        const prevRecipients = newMessageSource.get('to') || fromJS([])
        const nextRecipients =
            nextProps.newMessageSource.get('to') || fromJS([])

        const ticketIdParamChanged = nextParams.ticketId !== ticketId
        const nextTicketIsNew = nextParams.ticketId === 'new'
        const nextTicketIdParamMatchesNextTicket =
            nextTicket.get('id', '').toString() === nextParams.ticketId
        const customerHasChanged =
            ticket.getIn(['customer', 'id']) !== nextCustomer.get('id')

        const hasCustomer = !nextCustomer.isEmpty()

        const recipientsHaveBeenRemoved =
            !prevRecipients.isEmpty() && nextRecipients.isEmpty()
        const recipientsHaveChanged = !prevRecipients.equals(nextRecipients)

        const onlyOneRecipient = nextRecipients.size === 1

        if (
            !nextTicketIsNew &&
            nextTicket.get('customer') &&
            !nextCustomers.getIn(['customerHistory', 'triedLoading'])
        ) {
            const customerId = nextTicket.getIn(['customer', 'id'])

            if (!customerId) {
                return
            }

            // Fetch the ticket's customer history (tickets + events).
            fetchCustomerHistory(customerId, {
                successCondition: (state) => {
                    return state.ticket.getIn(['customer', 'id']) === customerId
                },
            })
        }

        if (ticketIdParamChanged) {
            // if the ticket in the reducer is not the one asked, we fetch it and display it
            if (!nextTicketIsNew && !nextTicketIdParamMatchesNextTicket) {
                clearTicket()
                fetchTicket(nextParams.ticketId || '')
            }

            this._showTicket()
        }

        // set customer and receiver from query
        // map default channel (email) to address, for the receivers select.
        const receiver = nextProps.activeCustomer.set(
            'address',
            nextProps.activeCustomer.get('email')
        )
        const customer = ticket.get('customer') || fromJS({})
        const nextCustomerQuery = parse(nextProps.location.search).customer

        if (
            nextTicketIsNew &&
            nextCustomerQuery &&
            nextProps.activeCustomer.get('id') ===
                parseInt(nextCustomerQuery) &&
            !customer.equals(receiver)
        ) {
            // set customer on ticket
            // (to show in infobar and be used in macros)
            setCustomer(receiver).then(() => {
                // set in receivers selector
                return setReceivers(
                    {
                        to: [receiver.toJS()],
                    },
                    true
                )
            })
        }

        // We update the cursor when we display the ticket for the first time.
        // If an attribute of the ticket changes, we don't want to update the cursor because
        // its position in the view has maybe changed.
        if (nextTicket.get('id') && nextTicket.get('id') !== ticket.get('id')) {
            updateActiveViewCursor(nextTicket.get(activeView.get('order_by')))
        }

        // When we're on a new ticket, the recipients have changed, and there's now exactly one recipient,
        // set this recipient as customer of the ticket
        const shouldSetFirstRecipientAsCustomer =
            recipientsHaveChanged && onlyOneRecipient

        if (nextTicketIsNew && shouldSetFirstRecipientAsCustomer) {
            const recipient = nextRecipients.first()
            let shouldSetCustomer = true

            // The recipient address may be in the channels of the customer, and not be in his customer.email address, so
            // to be sure we are not re-setting the same customer as customer of the current ticket, we need to check every channel of the
            // current customer.

            if (nextCustomer && !nextCustomer.isEmpty()) {
                ;(nextCustomer.get('channels') || fromJS([])).forEach(
                    (channel) => {
                        if (
                            channel.get('type') === 'email' &&
                            channel.get('address') === recipient.get('address')
                        ) {
                            shouldSetCustomer = false
                        }
                    }
                )
            }

            if (shouldSetCustomer) {
                findAndSetCustomer(recipient.get('address'))
            }
        }

        // When we're on a new ticket and the agent has removed the receivers of the new message, empty the
        // customer of the ticket
        // If the channel change to internal-note we don't want to unset the customer set by the user
        if (
            nextTicketIsNew &&
            recipientsHaveBeenRemoved &&
            nextProps.newMessageSource.get('type') !== 'internal-note'
        ) {
            setCustomer(null)
        }

        // When we're on a new ticket and the agent set a customer, set this customer's default email address
        // as recipient of the new message
        if (nextTicketIsNew && customerHasChanged && hasCustomer) {
            const newReceivers = _merge(
                _pick(
                    nextProps.newMessageSource.toJS(),
                    newMessageSelectors.getReceiversProperties()
                ),
                {
                    to: [
                        {
                            name: nextTicket.getIn(['customer', 'name']),
                            address: nextTicket.getIn(['customer', 'email']),
                        },
                    ],
                }
            )

            setReceivers(newReceivers)
        }
    }

    componentWillUnmount() {
        window.onbeforeunload = null
        const {
            actions: {
                ticket: {clearTicket},
            },
            match: {
                params: {ticketId},
            },
            ticket,
        } = this.props
        const customerId = ticket.getIn(['customer', 'id'])

        shortcutManager.unbind('TicketDetailContainer')
        // leaving ticket and request customer from socket io
        if (ticketId && ticketId !== 'new') {
            socketManager.leave('ticket', ticketId)
        }

        if (customerId) {
            socketManager.leave('customer', customerId)
        }

        clearTicket()
    }

    _bindKeys() {
        const {
            actions: {
                ticket: {clearTicket, goToNextTicket, goToPrevTicket},
            },
        } = this.props

        shortcutManager.bind('TicketDetailContainer', {
            GO_BACK: {
                action: () => {
                    const {
                        match: {
                            params: {ticketId},
                        },
                    } = this.props
                    const ticketNumber = parseInt(ticketId)
                    clearTicket()
                    goToPrevTicket(ticketNumber)
                },
            },
            GO_FORWARD: {
                action: () => {
                    const {
                        match: {
                            params: {ticketId},
                        },
                    } = this.props
                    const ticketNumber = parseInt(ticketId)
                    clearTicket()
                    goToNextTicket(ticketNumber)
                },
            },
            SUBMIT_TICKET: {
                action: (e) => {
                    if (e.preventDefault) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                    }

                    this._submit()
                },
            },
            SUBMIT_CLOSE_TICKET: {
                action: (e) => {
                    if (e.preventDefault) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                    }

                    this._submit('closed', true)
                },
            },
        })
    }

    _submit = (
        status: ?string,
        next: any,
        action: ?List<Map<*, *>>,
        resetMessage: boolean = true
    ) => {
        let {
            canSendMessage,
            currentUser,
            newMessage,
            submitTicket,
            ticket,
        } = this.props
        if (newMessage.getIn(['_internal', 'loading', 'submitMessage'])) {
            // We're already submitting something, we dont want to POST twice.
            // Or the ticket isn't dirty, and we don't want to send an empty message.
            return
        }

        if (!canSendMessage) {
            return
        }

        // flush any pending updates from the TicketReplyEditor debouncer
        updateMessageText.flush()

        let promise

        // The ticket does not exist yet.
        if (!ticket.get('id')) {
            const receiver = newMessage.getIn(['newMessage', 'receiver'])
            const sender = {id: currentUser.get('id')}

            const sourceType = newMessage.getIn([
                'newMessage',
                'source',
                'type',
            ])
            ticket = ticket.setIn(['newMessage', 'sender'], sender)

            // Ensure that a customer is always set on the ticket when created
            if (sourceType !== 'internal-note') {
                ticket = ticket.set('customer', receiver)
            }

            promise = submitTicket(
                ticket,
                status,
                ticket.getIn(['state', 'appliedMacro', 'actions']),
                currentUser,
                resetMessage
            )
        } else {
            promise = this.submitNewMessage(status, next, action, resetMessage)
        }

        if (status && promise) {
            ;(promise: any).then(() => {
                return this._setStatus(status || '')
            })
        }

        return promise
    }

    submitNewMessage = async (
        status: ?string,
        next: any,
        action: ?List<Map<*, *>>,
        resetMessage: boolean
    ) => {
        const {
            actions: {
                newMessage: {prepareTicketMessage, sendTicketMessage},
            },
            match: {
                params: {ticketId},
            },
            ticket,
        } = this.props

        const {
            messageId,
            messageToSend,
            replyAreaState,
        } = await prepareTicketMessage(
            status,
            ticket.getIn(['state', 'appliedMacro', 'actions']),
            action,
            resetMessage
        )

        if (messageToSend.source.type === 'email') {
            pendingMessageManager.sendMessage({
                messageId,
                messageToSend,
                action,
                resetMessage,
                ticketId,
                replyAreaState,
            })
            return
        }
        pendingMessageManager.skipExistingTimer()
        return sendTicketMessage(messageId, messageToSend, action, resetMessage)
    }

    _setStatus = (status: string) => {
        const {
            actions: {
                ticket: {clearTicket, goToNextTicket, setStatus},
            },
            match: {
                params: {ticketId},
            },
            ticket,
        } = this.props
        return setStatus(status, () => {
            if (status !== 'closed') {
                return
            }
            // If the history is open, we don't want to go to the next ticket
            if (!ticket.getIn(['_internal', 'displayHistory'])) {
                const promise = this._hideTicket().then(clearTicket)
                goToNextTicket(parseInt(ticketId), promise)
            }
        })
    }

    render() {
        const {
            actions,
            activeView,
            match: {
                params: {ticketId},
            },
            ticket,
        } = this.props
        const {isTicketHidden} = this.state
        if (
            (ticketId !== 'new' && !ticket.get('id')) ||
            (ticketId === 'new' && ticket.get('id')) ||
            ticket.getIn(['_internal', 'loading', 'fetchTicket'])
        ) {
            return <Loader message="Loading ticket..." />
        }

        return (
            <DocumentTitle
                title={ticket.get('id') ? ticket.get('subject') : 'New ticket'}
            >
                <div className="TicketDetailContainer">
                    <TicketView
                        actions={actions}
                        hideTicket={this._hideTicket}
                        isTicketHidden={isTicketHidden}
                        submit={this._submit}
                        view={activeView}
                        setStatus={this._setStatus}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

const connector = connect(
    (state) => ({
        activeView: viewsSelectors.getActiveView(state),
        activeCustomer: customersSelectors.getActiveCustomer(state),
        currentUser: state.currentUser,
        customers: customersSelectors.getCustomersState(state),
        routing: state.routing,
        ticket: state.ticket,
        newMessage: state.newMessage,
        tickets: state.tickets,
        isTicketDirty: ticketSelectors.isDirty(state),
        canSendMessage:
            currentAccountSelectors.isAccountActive(state) &&
            newMessageSelectors.isReady(state),
        newMessageSource: newMessageSelectors.getNewMessageSource(state),
    }),
    (dispatch) => ({
        actions: {
            macro: bindActionCreators(MacroActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            customers: bindActionCreators(customersActions, dispatch),
            views: bindActionCreators(ViewsActions, dispatch),
            newMessage: bindActionCreators(newMessageActions, dispatch),
        },
        updateActiveViewCursor: bindActionCreators(
            ticketsActions.updateCursor,
            dispatch
        ),
        submitTicket: bindActionCreators(
            newMessageActions.submitTicket,
            dispatch
        ),
    })
)

export default withRouter(connector(TicketDetailContainer))
