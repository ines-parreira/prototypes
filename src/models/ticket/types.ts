import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
    TicketVia,
} from '../../business/types/ticket'
import {AuditLogEvent} from '../event/types'

export type Ticket = {
    id: number
    assignee_user: TicketAssignee
    messages: TicketElement[]
    status: TicketStatus
    subject: string
    channel: TicketChannel
    receiver: Actor
    sender: Actor
    tags: unknown[]
    events: AuditLogEvent[]
    customer: unknown
    from_agent: boolean
    created_datetime: string
    opened_datetime: string | null
    updated_datetime: string | null
    closed_datetime: string | null
    snooze_datetime: string | null
    trashed_datetime: string | null
    last_message_datetime: string | null
    last_received_message_datetime: string | null
    meta: Record<string, unknown> | null
    uri: string
    external_id: string | null
    via: TicketVia
}

export type TicketAssignee = {
    id: number
    email: string
    firstname: string
    lastname: string
    name: string
}

export type TicketElement =
    | TicketMessage
    | TicketEvent
    | TicketSatisfactionSurvey

export type TicketMessage = {
    id?: number
    ticket_id?: number
    message_id?: string
    integration_id: number | null
    request_id?: string
    sender: Actor
    receiver: Actor
    subject: string
    body_html?: string
    body_text?: string
    stripped_html: string | null
    stripped_text: string | null
    channel: Channel
    via: TicketVia
    uri: string
    public: boolean
    from_agent: boolean
    isPending?: boolean
    source?: Source
    meta: Meta | null
    last_sending_error?: LastSendingError
    attachments: Attachment[]
    created_datetime: string
    stripped_signature: string | null
    actions: Action[] | null
    rule_id: string | null
    external_id: string | null
    failed_datetime: string | null
    opened_datetime: string | null
    sent_datetime?: string
    _internal?: {
        id: number
    }
    isMessage: true
}

export type TicketEvent = Omit<TicketMessage, 'isMessage'> & {
    isEvent: true
}

export type TicketSatisfactionSurvey = Omit<TicketMessage, 'isMessage'> & {
    isSatisfactionSurvey: true
}

export type Actor = {
    id: number
    email: string
    name: string
    firstname: string
    lastname: string
    meta?: any
}

export type Attachment = {
    content_type: string
    name: string
    public: boolean
    size: number
    url: string
}

export type Action = {
    status: ActionStatus
    name: string
    title: string
    type: string
    response?: {
        msg: string
    }
}

export enum ActionStatus {
    Error = 'error',
    Pending = 'pending',
    Success = 'success',
}

export type SourceType = TicketMessageSourceType
export type Channel = TicketChannel

export type Source = {
    type: SourceType
    from: SourceAddress
    to: SourceAddress[]
    cc?: SourceAddress[]
    bcc?: SourceAddress[]
    extra?: {
        forward?: boolean
    }
}

export type SourceAddress = {
    address: string
    name: string
}

export type Meta = {
    current_page?: string
    campaign_id?: string
    facebook_carousel?: FacebookCarouselTemplate[]
    hidden_datetime?: string
    liked_datetime?: string
    error?: string
    post_id?: string
    page_id?: string
    parent_id?: string
    deleted_datetime?: string
    private_reply?: FacebookPrivateReply
    is_duplicated?: boolean
}

export type FacebookPrivateReply = {
    already_sent?: boolean
    sent_datetime?: string
    messenger_ticket_id?: number
}

export type LastSendingError = {
    error?: string
}

export type FacebookCarouselTemplate = {
    type: 'template'
    payload: {
        template_type: string
        elements?: Array<{
            title: string
            subtitle: string
            image_url: string
            buttons?: Array<{
                type: string
                title: string
                url: string
            }>
        }>
    }
}
