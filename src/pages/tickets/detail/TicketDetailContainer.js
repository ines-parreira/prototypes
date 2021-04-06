//@flow
// $FlowFixMe
import React, {useEffect, useMemo, useState} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {fromJS, type List, type Map} from 'immutable'
import {parse} from 'query-string'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import {usePrevious} from 'react-use'

import DocumentTitle from 'react-document-title'

import pendingMessageManager from '../../../services/pendingMessageManager'
import shortcutManager from '../../../services/shortcutManager/index.ts'
import socketManager from '../../../services/socketManager'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors.ts'
import * as customersActions from '../../../state/customers/actions.ts'
import * as customersSelectors from '../../../state/customers/selectors.ts'
import * as macroActions from '../../../state/macro/actions.ts'
import * as newMessageActions from '../../../state/newMessage/actions.ts'
import * as newMessageSelectors from '../../../state/newMessage/selectors.ts'
import * as tagActions from '../../../state/tags/actions.ts'
import * as ticketActions from '../../../state/ticket/actions.ts'
import * as ticketsActions from '../../../state/tickets/actions'
import * as viewsActions from '../../../state/views/actions.ts'
import * as viewsSelectors from '../../../state/views/selectors.ts'
import * as ticketSelectors from '../../../state/ticket/selectors.ts'
import type {reactRouterLocation, reactRouterRoute} from '../../../types'

import Loader from '../../common/components/Loader/Loader.tsx'

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
        macro: typeof macroActions,
        newMessage: typeof newMessageActions,
        tag: typeof tagActions,
        ticket: typeof ticketActions,
        views: typeof viewsActions,
    },
    updateActiveViewCursor: typeof ticketsActions.updateActiveViewCursor,
    submitTicket: typeof newMessageActions.submitTicket,
    activeView: Map<any, any>,
    currentUser: Map<any, any>,
    ticket: Map<any, any>,
    newMessage: Map<any, any>,
    tickets: Map<any, any>,
    customers: Map<any, any>,
    activeCustomer: Map<any, any>,
    newMessageSource: Map<any, any>,
    routing: Map<any, any>,
    route: reactRouterRoute,
    location: reactRouterLocation,
}

export const TicketDetailContainer = ({
    match: {
        params: {ticketId: ticketIdParam},
    },
    canSendMessage,
    actions,
    updateActiveViewCursor,
    submitTicket,
    activeView,
    currentUser,
    ticket,
    newMessage,
    customers,
    activeCustomer,
    newMessageSource,
    location,
}: Props) => {
    const [isTicketHidden, setIsTicketHidden] = useState(false)

    const ticketId = useMemo(() => ticket.get('id'), [ticket])
    const recipients = useMemo(() => newMessageSource.get('to') || fromJS([]), [
        newMessageSource,
    ])
    const customer = useMemo(() => ticket.get('customer') || fromJS({}), [
        ticket,
    ])
    const prevCustomer = usePrevious(customer)

    useEffect(() => {
        actions.tag.fetchTags()

        const customerId = parse(location.search).customer
        if (
            ticketIdParam === 'new' &&
            customerId &&
            activeCustomer.get('id') !== customerId
        ) {
            actions.customers.fetchCustomer(customerId)
        }

        return () => {
            window.onbeforeunload = null
            const customerId = ticket.getIn(['customer', 'id'])

            // leaving ticket and request customer from socket io
            if (ticketIdParam && ticketIdParam !== 'new') {
                socketManager.leave('ticket', ticketIdParam)
            }

            if (customerId) {
                socketManager.leave('customer', customerId)
            }

            actions.ticket.clearTicket()
        }
    }, [])

    const goToPrevOrNextTicket = (direction: 'prev' | 'next') => {
        const ticketNumber = parseInt(ticketIdParam)
        actions.ticket.clearTicket()
        direction === 'prev'
            ? actions.ticket.goToPrevTicket(ticketNumber)
            : actions.ticket.goToNextTicket(ticketNumber)
    }

    const submitNewMessage = async (
        status: ?string,
        next: any,
        action: ?List<Map<any, any>>,
        resetMessage: boolean
    ) => {
        const {
            messageId,
            messageToSend,
            replyAreaState,
        } = await actions.newMessage.prepareTicketMessage(
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
                ticketId: ticketIdParam,
                replyAreaState,
            })
            return
        }
        pendingMessageManager.skipExistingTimer()
        return actions.newMessage.sendTicketMessage(
            messageId,
            messageToSend,
            action,
            resetMessage
        )
    }

    const submit = (
        status: ?string,
        next: any,
        action: ?List<Map<any, any>>,
        resetMessage: boolean = true
    ) => {
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
            let submittedTicket
            const receiver = newMessage.getIn(['newMessage', 'receiver'])
            const sender = {id: currentUser.get('id')}

            const sourceType = newMessage.getIn([
                'newMessage',
                'source',
                'type',
            ])
            submittedTicket = ticket.setIn(['newMessage', 'sender'], sender)

            // Ensure that a customer is always set on the ticket when created
            if (sourceType !== 'internal-note') {
                submittedTicket = ticket.set('customer', receiver)
            }

            promise = submitTicket(
                submittedTicket,
                status,
                ticket.getIn(['state', 'appliedMacro', 'actions']),
                currentUser,
                resetMessage
            )
        } else {
            promise = submitNewMessage(status, next, action, resetMessage)
        }

        if (status && promise) {
            ;(promise: any).then(() => {
                return setStatus(status || '')
            })
        }

        return promise
    }

    useEffect(() => {
        shortcutManager.bind('TicketDetailContainer', {
            GO_BACK: {
                action: () => {
                    goToPrevOrNextTicket('prev')
                },
            },
            GO_FORWARD: {
                action: () => {
                    goToPrevOrNextTicket('next')
                },
            },
            SUBMIT_TICKET: {
                action: (e) => {
                    if (e.preventDefault) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                    }

                    submit()
                },
            },
            SUBMIT_CLOSE_TICKET: {
                action: (e) => {
                    if (e.preventDefault) {
                        e.preventDefault()
                        e.stopImmediatePropagation()
                    }

                    submit('closed', true)
                },
            },
        })
        return () => {
            shortcutManager.unbind('TicketDetailContainer')
        }
    }, [goToPrevOrNextTicket, submit])

    // Fetch the ticket's customer history (tickets + events).
    useEffect(() => {
        if (
            ticketIdParam !== 'new' &&
            customer &&
            !customers.getIn(['customerHistory', 'triedLoading'])
        ) {
            const customerId = customer.get('id')

            if (!customerId) {
                return
            }

            actions.customers.fetchCustomerHistory(customerId, {
                successCondition: (state) =>
                    state.ticket.getIn(['customer', 'id']) === customerId,
            })
        }
    }, [customer, customers, ticketIdParam])

    // if the ticket in the reducer is not the one asked, we fetch it and display it
    useEffect(() => {
        if (ticket.get('id', '').toString() !== ticketIdParam) {
            actions.ticket.clearTicket()
            actions.ticket.fetchTicket(ticketIdParam || '')
        }

        showTicket()
    }, [ticketIdParam])

    useEffect(() => {
        if (prevCustomer) {
            // set customer and receiver from query
            // map default channel (email) to address, for the receivers select.
            const customerQuery = parse(location.search).customer
            const receiver = activeCustomer.set(
                'address',
                activeCustomer.get('email')
            )

            if (
                ticketIdParam === 'new' &&
                customerQuery &&
                activeCustomer.get('id') === parseInt(customerQuery) &&
                !prevCustomer.equals(receiver)
            ) {
                // set customer on ticket (to show in infobar and be used in macros)
                actions.ticket.setCustomer(receiver)
            }
        }
    }, [activeCustomer, location.search, prevCustomer, ticketIdParam])

    // We update the cursor when we display the ticket for the first time.
    // If an attribute of the ticket changes, we don't want to update the cursor because
    // its position in the view has maybe changed.
    useEffect(() => {
        if (ticketId) {
            updateActiveViewCursor(ticket.get(activeView.get('order_by')))
        }
    }, [ticketId])

    useEffect(() => {
        // When we're on a new ticket, that the recipients have changed, and
        // that there's now exactly one recipient,
        // set this recipient as customer of the ticket
        if (ticketIdParam === 'new' && recipients.size === 1) {
            const recipient = recipients.first()
            let shouldSetCustomer = true

            // The recipient address may be in the channels of the customer, and not be in his customer.email address, so
            // to be sure we are not re-setting the same customer as customer of the current ticket, we need to check every channel of the
            // current customer.
            if (customer && !customer.isEmpty()) {
                ;(customer.get('channels') || fromJS([])).forEach((channel) => {
                    if (
                        channel.get('type') === 'email' &&
                        channel.get('address') === recipient.get('address')
                    ) {
                        shouldSetCustomer = false
                    }
                })
            }

            if (shouldSetCustomer) {
                actions.ticket.findAndSetCustomer(recipient.get('address'))
            }
        }
    }, [recipients])

    // When we're on a new ticket and the agent has removed the receivers of the new message, empty the
    // customer of the ticket
    // If the channel change to internal-note we don't want to unset the customer set by the user
    useEffect(() => {
        if (
            ticketIdParam === 'new' &&
            recipients.isEmpty() &&
            newMessageSource.get('type') !== 'internal-note'
        ) {
            actions.ticket.setCustomer(null)
        }
    }, [recipients])

    // When we're on a new ticket and the agent set a customer, set this customer's default email address
    // as recipient of the new message
    useEffect(() => {
        if (ticketIdParam === 'new' && !customer.isEmpty()) {
            const newReceivers = _merge(
                _pick(
                    newMessageSource.toJS(),
                    newMessageSelectors.getReceiversProperties()
                ),
                {
                    to: [
                        {
                            name: ticket.getIn(['customer', 'name']),
                            address: ticket.getIn(['customer', 'email']),
                        },
                    ],
                }
            )

            actions.newMessage.setReceivers(newReceivers)
        }
    }, [customer])

    const showTicket = () => {
        setIsTicketHidden(false)
    }

    const hideTicket = () => {
        return new Promise<void>((resolve) => {
            setIsTicketHidden(true)
            // 100ms to let the animation goes
            return setTimeout(resolve, 100)
        })
    }

    const setStatus = (status: string) => {
        return actions.ticket.setStatus(status, () => {
            if (status !== 'closed') {
                return
            }
            // If the history is open, we don't want to go to the next ticket
            if (!ticket.getIn(['_internal', 'displayHistory'])) {
                const promise = hideTicket().then(actions.ticket.clearTicket)
                actions.ticket.goToNextTicket(parseInt(ticketIdParam), promise)
            }
        })
    }

    if (
        (ticketIdParam !== 'new' && !ticket.get('id')) ||
        (ticketIdParam === 'new' && ticket.get('id')) ||
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
                    hideTicket={hideTicket}
                    isTicketHidden={isTicketHidden}
                    submit={submit}
                    view={activeView}
                    setStatus={setStatus}
                />
            </div>
        </DocumentTitle>
    )
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
            macro: bindActionCreators(macroActions, dispatch),
            tag: bindActionCreators(tagActions, dispatch),
            ticket: bindActionCreators(ticketActions, dispatch),
            customers: bindActionCreators(customersActions, dispatch),
            views: bindActionCreators(viewsActions, dispatch),
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
