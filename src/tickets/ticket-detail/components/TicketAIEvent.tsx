import type { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

export type AIEvent = {
    eventType: TicketEventEnum
}

type Props = {
    data: AIEvent
}

export function TicketAIEvent({ data }: Props) {
    return <pre data-testid="dump">{JSON.stringify(data, null, '  ')}</pre>
}
