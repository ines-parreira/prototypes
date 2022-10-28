import React from 'react'
import moment, {Moment} from 'moment'

import {fromJS} from 'immutable'

import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from '../../../../../models/ticket/predicates'
import {TicketMessage} from '../../../../../models/ticket/types'
import {HighlightedElements} from '../AuditLogEvent'

import Container from './Container'
import Message from './Message'

type Props = {
    id: string
    messages: TicketMessage[]
    ticketId: number
    timezone: string
    hasCursor: boolean
    lastMessageDatetimeAfterMount: Moment | null
    setStatus?: (status: string) => void
    lastReadMessageId?: number
    lastSentMessageIdFromAgent?: number
    highlightedElements: HighlightedElements | null
    customer: Map<any, any>
    lastCustomerMessage: Map<any, any>
}

export default class TicketMessages extends React.Component<Props> {
    _isLastReadMessage = (message: TicketMessage): boolean => {
        return !!(
            message.id &&
            this.props.lastReadMessageId &&
            message.id === this.props.lastReadMessageId
        )
    }

    _isLastCustomerMessage = (message: TicketMessage): boolean => {
        if (!this.props.lastCustomerMessage) {
            return false
        }

        return !!(
            message.id &&
            this.props.lastCustomerMessage.get('id') &&
            message.id === this.props.lastCustomerMessage.get('id')
        )
    }

    _isLastSentMessageFromAgent = (message: TicketMessage): boolean => {
        return !!(
            message.id &&
            this.props.lastSentMessageIdFromAgent &&
            message.id === this.props.lastSentMessageIdFromAgent
        )
    }

    _messageShouldBeHighlighted(message: TicketMessage) {
        return (
            this.props.highlightedElements &&
            message.from_agent &&
            !isNaN(message.id!) &&
            this.props.highlightedElements.first <= message.id! &&
            message.id! <= this.props.highlightedElements.last
        )
    }

    containerContainsHighlightedMessages(messages: TicketMessage[]) {
        return messages
            .map((message) => this._messageShouldBeHighlighted(message))
            .indexOf(true)
    }

    containerContainsLastCustomerMessage(messages: TicketMessage[]) {
        return messages.some((message) => this._isLastCustomerMessage(message))
    }

    containerContainsUnreadMessages(messages: TicketMessage[]) {
        return messages.some((message) => message.opened_datetime === null)
    }

    render() {
        const {
            messages,
            customer = fromJS({}),
            lastCustomerMessage,
        } = this.props

        if (!messages.length) {
            return null
        }

        const message = messages[0]
        const isMessageHidden = isTicketMessageHidden(message)
        const isMessageDeleted = isTicketMessageDeleted(message)

        const firstGroupMessageIsRead = !!message.opened_datetime

        const groupAfterLastCustomerMessage = moment(
            message.sent_datetime
        ).isAfter(lastCustomerMessage.get('sent_datetime'))

        const showMessageStatusIndicator =
            firstGroupMessageIsRead &&
            this.containerContainsUnreadMessages(messages)

        return (
            <Container
                id={this.props.id}
                message={message}
                hasCursor={this.props.hasCursor}
                lastMessageDatetimeAfterMount={
                    this.props.lastMessageDatetimeAfterMount
                }
                timezone={this.props.timezone}
                isLastRead={this._isLastReadMessage(message)}
                containsLastCustomerMessage={this.containerContainsLastCustomerMessage(
                    messages
                )}
                displayMessageStatusIndicator={groupAfterLastCustomerMessage}
                isMessageHidden={isMessageHidden}
                isMessageDeleted={isMessageDeleted}
                isBodyHighlighted={
                    this.containerContainsHighlightedMessages(messages) !== -1
                }
                customer={customer}
                lastCustomerMessageDateTime={lastCustomerMessage.get(
                    'sent_datetime'
                )}
            >
                {messages.map((message: TicketMessage, index: number) => (
                    <Message
                        key={message.id || `${this.props.id}-${index}`}
                        message={message}
                        ticketId={this.props.ticketId}
                        setStatus={this.props.setStatus}
                        showSourceDetails={!!index}
                        isLastRead={this._isLastReadMessage(message)}
                        timezone={this.props.timezone}
                        showMessageStatusIndicator={showMessageStatusIndicator}
                    />
                ))}
            </Container>
        )
    }
}
