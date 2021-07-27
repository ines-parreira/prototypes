//@flow
// $FlowFixMe
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {useParams} from 'react-router-dom'
import {fromJS, type List, type Map} from 'immutable'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import {usePrevious} from 'react-use'
import DocumentTitle from 'react-document-title'

import useSearch from '../../../hooks/useSearch.ts'
import pendingMessageManager from '../../../services/pendingMessageManager'
import shortcutManager from '../../../services/shortcutManager/index.ts'
import socketManager from '../../../services/socketManager'
import {isAccountActive} from '../../../state/currentAccount/selectors.ts'
import {
    fetchCustomer,
    fetchCustomerHistory,
} from '../../../state/customers/actions.ts'
import {
    getActiveCustomer,
    getCustomersState,
} from '../../../state/customers/selectors.ts'
import {
    prepareTicketMessage,
    sendTicketMessage,
    setReceivers,
    submitTicket,
} from '../../../state/newMessage/actions.ts'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from '../../../state/newMessage/errors.ts'
import {
    isReady,
    getNewMessageSource,
    getReceiversProperties,
} from '../../../state/newMessage/selectors.ts'
import {fetchTags} from '../../../state/tags/actions.ts'
import {
    clearTicket,
    fetchTicket,
    findAndSetCustomer,
    goToNextTicket,
    goToPrevTicket,
    setCustomer,
    setStatus,
} from '../../../state/ticket/actions.ts'
import {updateCursor} from '../../../state/tickets/actions.ts'
import {getActiveView} from '../../../state/views/selectors.ts'

import Loader from '../../common/components/Loader/Loader.tsx'

import TicketView from './components/TicketView.tsx'
import {updateMessageText} from './components/ReplyArea/TicketReplyEditor'

type Props = {
    activeCustomer: Map<any, any>,
    activeView: Map<any, any>,
    canSendMessage: boolean,
    clearTicket: typeof clearTicket,
    currentUser: Map<any, any>,
    customers: Map<any, any>,
    fetchCustomer: typeof fetchCustomer,
    fetchCustomerHistory: typeof fetchCustomerHistory,
    fetchTags: typeof fetchTags,
    fetchTicket: typeof fetchTicket,
    findAndSetCustomer: typeof findAndSetCustomer,
    goToNextTicket: typeof goToNextTicket,
    goToPrevTicket: typeof goToPrevTicket,
    newMessage: Map<any, any>,
    newMessageSource: Map<any, any>,
    prepareTicketMessage: typeof prepareTicketMessage,
    sendTicketMessage: typeof sendTicketMessage,
    setCustomer: typeof setCustomer,
    setReceivers: typeof setReceivers,
    setStatus: typeof setStatus,
    submitTicket: typeof submitTicket,
    ticket: Map<any, any>,
    updateCursor: typeof updateCursor,
}

export const TicketDetailContainer = ({
    activeCustomer,
    activeView,
    canSendMessage,
    clearTicket,
    currentUser,
    customers,
    fetchCustomer,
    fetchCustomerHistory,
    fetchTags,
    fetchTicket,
    findAndSetCustomer,
    goToNextTicket,
    goToPrevTicket,
    newMessage,
    newMessageSource,
    prepareTicketMessage,
    sendTicketMessage,
    setCustomer,
    setReceivers,
    setStatus,
    submitTicket,
    ticket,
    updateCursor,
}: Props) => {
    const {ticketId: ticketIdParam} = useParams()
    const {customer: customerId} = useSearch()
    const ticketIdParamRef = useRef(ticketIdParam)

    useEffect(() => {
        ticketIdParamRef.current = ticketIdParam
    })

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
        fetchTags()

        if (
            ticketIdParam === 'new' &&
            customerId &&
            activeCustomer.get('id') !== customerId
        ) {
            fetchCustomer(customerId)
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

            clearTicket()
        }
    }, [])

    const goToPrevOrNextTicket = (direction: 'prev' | 'next') => {
        const ticketNumber = parseInt(ticketIdParam)
        clearTicket()
        direction === 'prev'
            ? goToPrevTicket(ticketNumber)
            : goToNextTicket(ticketNumber)
    }

    const submitNewMessage = async (
        status: ?string,
        next: any,
        action: ?List<Map<any, any>>,
        resetMessage: boolean
    ) => {
        try {
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
                    ticketId: ticketIdParam,
                    replyAreaState,
                })
                return
            }
            pendingMessageManager.skipExistingTimer()
            return sendTicketMessage(
                messageId,
                messageToSend,
                action,
                resetMessage
            )
        } catch (error) {
            if (
                !(error instanceof TicketMessageInvalidSendDataError) &&
                !(error instanceof TicketMessageActionValidationError)
            ) {
                throw error
            }
        }
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
                return handleStatusChange(status || '')
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

            fetchCustomerHistory(customerId, {
                successCondition: (state) =>
                    state.ticket.getIn(['customer', 'id']) === customerId,
            })
        }
    }, [customer, customers, ticketIdParam])

    // if the ticket in the reducer is not the one asked, we fetch it and display it
    useEffect(() => {
        if (ticket.get('id', '').toString() !== ticketIdParam) {
            clearTicket()
            fetchTicket(ticketIdParam || '')
        }

        showTicket()
    }, [ticketIdParam])

    useEffect(() => {
        if (prevCustomer) {
            // set customer and receiver from query
            // map default channel (email) to address, for the receivers select.
            const receiver = activeCustomer.set(
                'address',
                activeCustomer.get('email')
            )

            if (
                ticketIdParam === 'new' &&
                customerId &&
                activeCustomer.get('id') === parseInt(customerId) &&
                !prevCustomer.equals(receiver)
            ) {
                // set customer on ticket (to show in infobar and be used in macros)
                setCustomer(receiver)
            }
        }
    }, [activeCustomer, customerId, prevCustomer, ticketIdParam])

    // We update the cursor when we display the ticket for the first time.
    // If an attribute of the ticket changes, we don't want to update the cursor because
    // its position in the view has maybe changed.
    useEffect(() => {
        if (ticketId) {
            updateCursor(ticket.get(activeView.get('order_by')))
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
                findAndSetCustomer(recipient.get('address'))
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
            setCustomer(null)
        }
    }, [recipients])

    // When we're on a new ticket and the agent set a customer, set this customer's default email address
    // as recipient of the new message
    useEffect(() => {
        if (ticketIdParam === 'new' && !customer.isEmpty()) {
            const newReceivers = _merge(
                _pick(newMessageSource.toJS(), getReceiversProperties()),
                {
                    to: [
                        {
                            name: ticket.getIn(['customer', 'name']),
                            address: ticket.getIn(['customer', 'email']),
                        },
                    ],
                }
            )

            setReceivers(newReceivers)
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

    const handleStatusChange = (status: string) => {
        return setStatus(status, () => {
            if (status !== 'closed') {
                return
            }
            // If the history is open, we don't want to go to the next ticket
            if (!ticket.getIn(['_internal', 'displayHistory'])) {
                const promise = hideTicket().then(clearTicket)
                goToNextTicket(parseInt(ticketIdParamRef.current), promise)
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
                    hideTicket={hideTicket}
                    isTicketHidden={isTicketHidden}
                    submit={submit}
                    setStatus={handleStatusChange}
                />
            </div>
        </DocumentTitle>
    )
}

const connector = connect(
    (state) => ({
        activeView: getActiveView(state),
        activeCustomer: getActiveCustomer(state),
        currentUser: state.currentUser,
        customers: getCustomersState(state),
        ticket: state.ticket,
        newMessage: state.newMessage,
        canSendMessage: isAccountActive(state) && isReady(state),
        newMessageSource: getNewMessageSource(state),
    }),
    {
        clearTicket,
        fetchCustomer,
        fetchCustomerHistory,
        fetchTags,
        fetchTicket,
        findAndSetCustomer,
        goToNextTicket,
        goToPrevTicket,
        prepareTicketMessage,
        sendTicketMessage,
        setCustomer,
        setReceivers,
        setStatus,
        submitTicket,
        updateCursor,
    }
)

export default connector(TicketDetailContainer)
