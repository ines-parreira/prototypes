//@flow

import {
    TicketChannels,
    TicketMessageSourceTypes,
    TicketStatuses,
} from '../../business/ticket.ts'
import type {TicketChannel, TicketVia} from '../../business/types/ticket'
import type {AuditLogEvent} from '../event/types'

export type Ticket = {
    id: number,
    assignee_user: TicketAssignee,
    messages: TicketElement[],
    status: $Values<typeof TicketStatuses>,
    subject: string,
    channel: TicketChannel,
    receiver: Actor,
    sender: Actor,
    tags: any[],
    events: AuditLogEvent[],
    customer: any,
    from_agent: boolean,
    created_datetime: string,
    opened_datetime: string | null,
    updated_datetime: string | null,
    closed_datetime: string | null,
    snooze_datetime: string | null,
    trashed_datetime: string | null,
    last_message_datetime: string | null,
    last_received_message_datetime: string | null,
    meta: {[key: string]: any} | null,
    uri: string,
    external_id: string | null,
    via: TicketVia,
}

export type TicketAssignee = {
    id: number,
    email: string,
    firstname: string,
    lastname: string,
    name: string,
}

export type TicketElement =
    | TicketMessage
    | TicketEvent
    | TicketSatisfactionSurvey

export type TicketMessage = {
    id?: number,
    ticket_id?: number,
    message_id?: string,
    integration_id: number | null,
    request_id?: string,
    sender: Actor,
    receiver: Actor,
    subject: string,
    body_html?: string,
    body_text?: string,
    stripped_html: string | null,
    stripped_text: string | null,
    channel: Channel,
    via: TicketVia,
    uri: string,
    public: boolean,
    from_agent: boolean,
    isPending?: boolean,
    source?: Source,
    meta: Meta | null,
    last_sending_error?: LastSendingError,
    attachments: Attachment[],
    created_datetime: string,
    stripped_signature: string | null,
    actions: Action[] | null,
    rule_id: string | null,
    external_id: string | null,
    failed_datetime: string | null,
    opened_datetime: string | null,
    sent_datetime?: string,
    _internal?: {
        id: number,
    },
    isMessage: true,
}

export type TicketEvent = $Diff<TicketMessage, {isMessage: true}> & {
    isEvent: true,
}

export type TicketSatisfactionSurvey = $Diff<
    TicketMessage,
    {isMessage: true}
> & {
    isSatisfactionSurvey: true,
}

export type Actor = {
    id: number,
    email: string,
    name: string | null,
    firstname: string,
    lastname: string,
    meta?: any,
}

export type Attachment = {
    content_type: string,
    name: string,
    public: boolean,
    size: number,
    url: string,
}

export type Action = {
    status: ActionStatus,
    name: string,
    title: string,
    type: string,
    response?: {
        msg: string,
    },
}

export type ActionStatus = 'error' | 'pending' | 'success'

export type SourceType = $Values<typeof TicketMessageSourceTypes>
export type Channel = $Values<typeof TicketChannels>

export type Source = {
    type: SourceType,
    from?: SourceAddress,
    to: SourceAddress[],
    cc?: SourceAddress[],
    bcc?: SourceAddress[],
    extra?: any,
}

export type SourceAddress = {
    address: string,
    name: string,
}

export type Meta = {
    current_page?: string,
    campaign_id?: string,
    facebook_carousel?: FacebookCarouselTemplate[],
    hidden_datetime?: string,
    permalink_url?: string,
    liked_datetime?: string,
    error?: string,
    post_id?: string,
    page_id?: string,
    parent_id?: string,
    facebook_reactions?: FacebookReactions,
    deleted_datetime?: string,
    private_reply?: FacebookPrivateReply,
    is_duplicated?: boolean,
}

export type FacebookPrivateReply = {
    already_sent?: boolean,
    sent_datetime?: string,
    messenger_ticket_id?: number,
}

export type FacebookReactions = {
    page_reaction?: FacebookReaction,
    customer_reaction?: FacebookReaction,
    reactions_counter: FacebookReactionCounter,
}

export type FacebookReaction = {
    reaction_type: string,
    reaction_datetime: string,
    reaction_made_by?: string,
    is_reacting?: boolean,
}

export type FacebookReactionCounter = {
    total_reactions: number,
}

export type LastSendingError = {
    error?: string,
}

export type FacebookCarouselTemplate = {
    type: 'template',
    payload: {
        template_type: string,
        elements?: Array<{
            title: string,
            subtitle: string,
            image_url: string,
            buttons?: Array<{
                type: string,
                title: string,
                url: string,
            }>,
        }>,
    },
}
