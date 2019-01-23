//@flow
import React from 'react'
import Container from './Container'
import {TicketMessage} from '../../../../../models/ticketElement'
import Message from './Message'

type Props = {
    id: string,
    messages:  TicketMessage[],
    ticketId: number,
    timezone: string,
    isLastReadMessage: boolean,
    hasCursor: boolean,
    lastMessageDatetimeAfterMount: any,
    setStatus: () => void,
    lastReadMessageId?: number
}

export default class extends React.Component<Props> {
    _isLastReadMessage = (message: TicketMessage): boolean => {
        return !!(message.id && this.props.lastReadMessageId && message.id === this.props.lastReadMessageId)
    }

    render () {
        let {messages} = this.props

        if (!messages.length) {
            return null
        }

        return (
            <Container
                id={this.props.id}
                message={messages[0]}
                hasCursor={this.props.hasCursor}
                lastMessageDatetimeAfterMount={this.props.lastMessageDatetimeAfterMount}
                timezone={this.props.timezone}
                isLastRead={this._isLastReadMessage(messages[0])}
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
