//@flow
import React from 'react'

import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
    TicketMessage,
} from '../../../../../models/ticket'

import type {HighlightedElements} from '../AuditLogEvent'

import Container from './Container'
import Message from './Message'

type Props = {
    id: string,
    messages: TicketMessage[],
    ticketId: number,
    timezone: string,
    isLastReadMessage: boolean,
    hasCursor: boolean,
    lastMessageDatetimeAfterMount: ?moment$Moment,
    setStatus: () => void,
    lastReadMessageId?: number,
    highlightedElements: HighlightedElements,
}

export default class TicketMessages extends React.Component<Props> {
    _isLastReadMessage = (message: TicketMessage): boolean => {
        return !!(
            message.id &&
            this.props.lastReadMessageId &&
            message.id === this.props.lastReadMessageId
        )
    }

    _messageShouldBeHighlighted(message: TicketMessage) {
        return (
            this.props.highlightedElements &&
            message.from_agent &&
            !isNaN(message.id) &&
            this.props.highlightedElements.first <= message.id &&
            message.id <= this.props.highlightedElements.last
        )
    }

    containerContainsHighlightedMessages(messages: TicketMessage[]) {
        return messages
            .map((message) => this._messageShouldBeHighlighted(message))
            .indexOf(true)
    }

    render() {
        let {messages} = this.props

        if (!messages.length) {
            return null
        }

        const message = messages[0]
        const isMessageHidden = isTicketMessageHidden(message)
        const isMessageDeleted = isTicketMessageDeleted(message)

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
                isMessageHidden={isMessageHidden}
                isMessageDeleted={isMessageDeleted}
                isBodyHighlighted={
                    this.containerContainsHighlightedMessages(messages) !== -1
                }
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
                    />
                ))}
            </Container>
        )
    }
}
