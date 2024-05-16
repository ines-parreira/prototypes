import React from 'react'
import {MessageType, PlaygroundMessage} from 'models/aiAgentPlayground/types'
import PlaygroundThread from '../PlaygroundThread/PlaygroundThread'
import PlaygroundMessageComponent from '../PlaygroundMessage/PlaygroundMessage'
import TicketEvent from '../TicketEvent/TicketEvent'

type Props = {
    messages: PlaygroundMessage[]
    actions: React.ReactNode
    subject: string | null
}

export const PlaygroundOutputStep = ({messages, actions, subject}: Props) => {
    const threadContent = messages.map((message, index) => {
        if (message.type === MessageType.TICKET_EVENT && message.outcome) {
            return <TicketEvent key={index} type={message.outcome} />
        }

        return (
            <PlaygroundMessageComponent
                sender={message.sender}
                type={message.type}
                message={message.message}
                processingStatus={message.processingStatus}
                key={index}
            />
        )
    })

    return (
        <div>
            <PlaygroundThread
                subject={subject}
                threadContent={threadContent}
                actions={actions}
            />
        </div>
    )
}
