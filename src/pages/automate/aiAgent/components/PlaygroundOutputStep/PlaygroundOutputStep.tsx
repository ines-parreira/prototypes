import React from 'react'
import {
    MessageType,
    PlaygroundMessage,
    PlaygroundStep,
} from 'models/aiAgentPlayground/types'
import Button from 'pages/common/components/button/Button'
import PlaygroundMessageComponent from '../PlaygroundMessage/PlaygroundMessage'
import PlaygroundThread from '../PlaygroundThread/PlaygroundThread'
import TicketEvent from '../TicketEvent/TicketEvent'

type Props = {
    messages: PlaygroundMessage[]
    subject: string | null
    setStep: (step: PlaygroundStep) => void
    isProcessing: boolean
}

export const PlaygroundOutputStep = ({
    messages,
    subject,
    setStep,
    isProcessing,
}: Props) => {
    const handleReset = () => {
        setStep(PlaygroundStep.INPUT)
    }

    const actions = (
        <Button
            intent="primary"
            onClick={handleReset}
            isDisabled={isProcessing}
        >
            Reset
        </Button>
    )

    const threadContent = messages.map((message, index) => {
        if (message.type === MessageType.TICKET_EVENT && message.outcome) {
            return <TicketEvent key={index} type={message.outcome} />
        }

        return (
            <PlaygroundMessageComponent
                sender={message.sender}
                type={message.type}
                message={message.message}
                createdDatetime={message.createdDatetime}
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
