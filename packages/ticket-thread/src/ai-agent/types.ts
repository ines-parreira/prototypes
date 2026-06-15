import type { TicketTag } from '@gorgias/helpdesk-queries'

export const TicketThreadAiAgentPseudoEventAction = {
    Close: 'close',
    Handover: 'handover',
    Snooze: 'snooze',
} as const

export type TicketThreadAiAgentPseudoEventAction =
    (typeof TicketThreadAiAgentPseudoEventAction)[keyof typeof TicketThreadAiAgentPseudoEventAction]

export type TicketThreadAiAgentPseudoEventTag = {
    id?: TicketTag['id']
    name: string
    decoration: TicketTag['decoration'] | null
}

export type TicketThreadAiAgentPseudoEvent = {
    action: TicketThreadAiAgentPseudoEventAction | null
    tags: TicketThreadAiAgentPseudoEventTag[]
}
