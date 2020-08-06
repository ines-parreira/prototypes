//@flow
import React from 'react'

import {
    isTicketMessageHidden,
    TicketMessage,
} from '../../../../../models/ticket'

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
}

export default class TicketMessages extends React.Component<Props> {
    _isLastReadMessage = (message: TicketMessage): boolean => {
        return !!(
            message.id &&
            this.props.lastReadMessageId &&
            message.id === this.props.lastReadMessageId
        )
    }

    render() {
        let {messages} = this.props

        if (!messages.length) {
            return null
        }

        const message = messages[0]
        const isMessageHidden = isTicketMessageHidden(message)

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
